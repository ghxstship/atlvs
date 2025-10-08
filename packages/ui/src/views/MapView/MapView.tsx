/**
 * MapView Component — Geospatial Data Visualization
 * Interactive map with markers and clusters
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Minus, Maximize2 } from 'lucide-react';
import type { ViewProps, MapMarker } from '../types';

export interface MapViewProps extends ViewProps {
  /** Latitude field */
  latField: string;
  
  /** Longitude field */
  lngField: string;
  
  /** Title field */
  titleField: string;
  
  /** Description field */
  descriptionField?: string;
  
  /** Initial center */
  center?: { lat: number; lng: number };
  
  /** Initial zoom */
  zoom?: number;
  
  /** Custom className */
  className?: string;
}

/**
 * MapView Component
 * Note: This is a simplified implementation. For production, use a real map library like Mapbox or Google Maps.
 */
export function MapView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  latField,
  lngField,
  titleField,
  descriptionField,
  center = { lat: 0, lng: 0 },
  zoom = 2,
  className = '',
}: MapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(zoom);
  
  // Calculate bounds to fit all markers
  const bounds = React.useMemo(() => {
    if (data.length === 0) return null;
    
    const lats = data.map(r => r[latField]).filter(v => v != null);
    const lngs = data.map(r => r[lngField]).filter(v => v != null);
    
    if (lats.length === 0) return null;
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
      centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  }, [data, latField, lngField]);
  
  const handleMarkerClick = (record: any) => {
    setSelectedMarker(record.id);
    onRecordClick?.(record);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading map</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
          className="
            p-2 rounded
            bg-card
            border border-border
            hover:bg-muted
            shadow-sm
            transition-colors
          "
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
          className="
            p-2 rounded
            bg-card
            border border-border
            hover:bg-muted
            shadow-sm
            transition-colors
          "
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          className="
            p-2 rounded
            bg-card
            border border-border
            hover:bg-muted
            shadow-sm
            transition-colors
          "
          aria-label="Fit bounds"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Map container */}
      <div className="flex-1 relative bg-muted">
        {/* Placeholder map background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm">Map visualization</p>
            <p className="text-xs mt-1">
              {data.length} marker{data.length !== 1 ? 's' : ''}
            </p>
            {bounds && (
              <p className="text-xs mt-1">
                Center: {bounds.centerLat.toFixed(4)}, {bounds.centerLng.toFixed(4)}
              </p>
            )}
            <p className="text-xs mt-4 text-muted-foreground/60">
              Integrate Mapbox or Google Maps for production
            </p>
          </div>
        </div>
        
        {/* Markers list (simplified visualization) */}
        <div className="absolute bottom-4 left-4 right-4 max-h-48 overflow-auto">
          <div className="space-y-2">
            {data.slice(0, 5).map(record => {
              const lat = record[latField];
              const lng = record[lngField];
              const title = record[titleField];
              const description = descriptionField ? record[descriptionField] : null;
              
              if (!lat || !lng) return null;
              
              return (
                <div
                  key={record.id}
                  onClick={() => handleMarkerClick(record)}
                  className={`
                    p-3 rounded-lg
                    bg-card
                    border ${selectedMarker === record.id ? 'border-primary' : 'border-border'}
                    hover:border-primary
                    cursor-pointer
                    shadow-sm
                    transition-all
                  `}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{title}</p>
                      {description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {data.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                +{data.length - 5} more markers
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

MapView.displayName = 'MapView';
