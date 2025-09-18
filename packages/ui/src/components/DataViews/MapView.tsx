'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Select } from '../Select';
import { Input } from '../Input';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { 
  Map as MapIcon, 
  Layers, 
  Search, 
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize,
  Navigation,
  MapPin,
  Satellite,
  Globe
} from 'lucide-react';
import { DataRecord, FieldConfig } from './types';

interface MapViewProps {
  className?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  latitudeField?: string;
  longitudeField?: string;
  addressField?: string;
  titleField?: string;
  descriptionField?: string;
  colorField?: string;
  sizeField?: string;
  clusterMarkers?: boolean;
  showHeatmap?: boolean;
  allowDrawing?: boolean;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  color?: string;
  size?: number;
  record: DataRecord;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export function MapView({
  className = '',
  defaultCenter = [40.7128, -74.0060], // NYC
  defaultZoom = 10,
  latitudeField = 'latitude',
  longitudeField = 'longitude',
  addressField = 'address',
  titleField = 'name',
  descriptionField = 'description',
  colorField = 'status',
  sizeField,
  clusterMarkers = true,
  showHeatmap = false,
  allowDrawing = false
}: MapViewProps) {
  const { state, config, actions } = useDataView();
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [mapType, setMapType] = useState<MapType>('roadmap');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClusters, setShowClusters] = useState(clusterMarkers);
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(showHeatmap);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  // Convert data records to map markers
  const markers = useMemo(() => {
    const data = config.data || [];
    const validMarkers: MapMarker[] = [];

    data.forEach(record => {
      let lat: number | null = null;
      let lng: number | null = null;

      // Try to get coordinates from lat/lng fields
      if (record[latitudeField] && record[longitudeField]) {
        lat = Number(record[latitudeField]);
        lng = Number(record[longitudeField]);
      }
      // TODO: In real implementation, geocode address field if no coordinates
      else if (record[addressField]) {
        // Mock geocoding - in real app would use Google Maps Geocoding API
        const mockCoords = mockGeocode(String(record[addressField]));
        if (mockCoords) {
          lat = mockCoords[0];
          lng = mockCoords[1];
        }
      }

      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        const marker: MapMarker = {
          id: record.id,
          lat,
          lng,
          title: String(record[titleField] || record.id),
          description: record[descriptionField] ? String(record[descriptionField]) : undefined,
          color: getMarkerColor(record[colorField]),
          size: sizeField ? Number(record[sizeField]) || 1 : 1,
          record
        };
        validMarkers.push(marker);
      }
    });

    return validMarkers;
  }, [config.data, latitudeField, longitudeField, addressField, titleField, descriptionField, colorField, sizeField]);

  // Filter markers based on search
  const filteredMarkers = useMemo(() => {
    if (!searchQuery.trim()) return markers;
    
    const query = searchQuery.toLowerCase();
    return markers.filter(marker =>
      marker.title.toLowerCase().includes(query) ||
      marker.description?.toLowerCase().includes(query)
    );
  }, [markers, searchQuery]);

  // Mock geocoding function
  const mockGeocode = useCallback((address: string): [number, number] | null => {
    // In real implementation, this would call Google Maps Geocoding API
    const mockAddresses: Record<string, [number, number]> = {
      'new york': [40.7128, -74.0060],
      'los angeles': [34.0522, -118.2437],
      'chicago': [41.8781, -87.6298],
      'houston': [29.7604, -95.3698],
      'phoenix': [33.4484, -112.0740],
      'philadelphia': [39.9526, -75.1652],
      'san antonio': [29.4241, -98.4936],
      'san diego': [32.7157, -117.1611],
      'dallas': [32.7767, -96.7970],
      'san jose': [37.3382, -121.8863]
    };
    
    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(mockAddresses)) {
      if (addressLower.includes(city)) {
        return coords;
      }
    }
    
    return null;
  }, []);

  // Get marker color based on field value
  const getMarkerColor = useCallback((value: any): string => {
    if (!value) return '#3B82F6'; // Default blue
    
    const colorMap: Record<string, string> = {
      'active': '#10B981',    // Green
      'inactive': '#6B7280',  // Gray
      'pending': '#F59E0B',   // Yellow
      'error': '#EF4444',     // Red
      'success': '#10B981',   // Green
      'warning': '#F59E0B',   // Yellow
      'high': '#EF4444',      // Red
      'medium': '#F59E0B',    // Yellow
      'low': '#10B981'        // Green
    };
    
    return colorMap[String(value).toLowerCase()] || '#3B82F6';
  }, []);

  // Calculate map bounds to fit all markers
  const fitBounds = useCallback(() => {
    if (filteredMarkers.length === 0) return;
    
    const bounds = filteredMarkers.reduce(
      (acc, marker) => ({
        north: Math.max(acc.north, marker.lat),
        south: Math.min(acc.south, marker.lat),
        east: Math.max(acc.east, marker.lng),
        west: Math.min(acc.west, marker.lng)
      }),
      {
        north: -90,
        south: 90,
        east: -180,
        west: 180
      }
    );
    
    setMapBounds(bounds);
    
    // Calculate center and zoom to fit bounds
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    setMapCenter([centerLat, centerLng]);
    
    // Simple zoom calculation based on bounds size
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 10;
    if (maxDiff > 10) zoom = 4;
    else if (maxDiff > 5) zoom = 6;
    else if (maxDiff > 1) zoom = 8;
    else if (maxDiff > 0.1) zoom = 12;
    else zoom = 14;
    
    setMapZoom(zoom);
  }, [filteredMarkers]);

  // Handle marker click
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker.id);
    actions.setSelectedRecords([marker.id]);
    
    // Center map on marker
    setMapCenter([marker.lat, marker.lng]);
    
    // Open drawer or show details
    if (config.onEdit) {
      config.onEdit(marker.record);
    }
  }, [actions, config]);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (allowDrawing && config.onCreate) {
      // Create new record at clicked location
      const newRecord = {
        [latitudeField]: lat,
        [longitudeField]: lng,
        [titleField]: 'New Location'
      };
      config.onCreate();
    }
  }, [allowDrawing, config, latitudeField, longitudeField, titleField]);

  const containerClasses = `
    map-view h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Map Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as MapType)}
          >
            <option value="roadmap">Roadmap</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
            <option value="terrain">Terrain</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showClusters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowClusters(!showClusters)}
          >
            <Layers className="h-4 w-4" />
            Clusters
          </Button>
          
          <Button
            variant={showHeatmapLayer ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowHeatmapLayer(!showHeatmapLayer)}
          >
            <Globe className="h-4 w-4" />
            Heatmap
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fitBounds}
          >
            <Maximize className="h-4 w-4" />
            Fit All
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Mock Map Display */}
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="text-muted-foreground">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Map Markers */}
          {filteredMarkers.map((marker, index) => {
            // Convert lat/lng to screen coordinates (mock calculation)
            const x = ((marker.lng + 180) / 360) * 100;
            const y = ((90 - marker.lat) / 180) * 100;
            
            return (
              <div
                key={marker.id}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                  transition-all duration-200 hover:scale-110
                  ${selectedMarker === marker.id ? 'z-20 scale-125' : 'z-10'}
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`
                }}
                onClick={() => handleMarkerClick(marker)}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: marker.color }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                
                {/* Marker Label */}
                {selectedMarker === marker.id && (
                  <Card className="absolute top-8 left-1/2 transform -translate-x-1/2 p-2 min-w-[200px] z-30">
                    <h4 className="font-medium text-sm">{marker.title}</h4>
                    {marker.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {marker.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" size="sm">
                        {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                      </Badge>
                      {marker.record[colorField] && (
                        <Badge variant="outline" size="sm">
                          {String(marker.record[colorField])}
                        </Badge>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            );
          })}

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Mock current location
                setMapCenter([40.7128, -74.0060]);
                setMapZoom(12);
              }}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {filteredMarkers.length} locations
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Zoom: {mapZoom} | Type: {mapType}
              </div>
              <div className="text-xs text-muted-foreground">
                Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
              </div>
            </div>
          </div>

          {/* Heatmap Overlay */}
          {showHeatmapLayer && filteredMarkers.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {filteredMarkers.map((marker, index) => {
                const x = ((marker.lng + 180) / 360) * 100;
                const y = ((90 - marker.lat) / 180) * 100;
                
                return (
                  <div
                    key={`heatmap-${marker.id}`}
                    className="absolute rounded-full bg-red-500/20"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: '60px',
                      height: '60px',
                      transform: 'translate(-50%, -50%)',
                      filter: 'blur(15px)'
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {colorField && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex items-center gap-3">
              {Array.from(new Set(markers.map(m => m.record[colorField]))).map(value => (
                <div key={String(value)} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: getMarkerColor(value) }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMarkers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <MapIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No locations found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 
                'Try adjusting your search terms.' : 
                'Add latitude/longitude fields or address data to display locations on the map.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
