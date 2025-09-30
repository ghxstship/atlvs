'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { FilesService } from '../lib/files-service';
import type { DigitalAsset, AssetFilters } from '../types';
import { Download, Eye, Filter } from 'lucide-react';

const mediaTypeIcons = {
 image: Image,
 video: Video,
 audio: Music,
 other: FileCode,
};

export default function MediaClient() {
 const [assets, setAssets] = useState<DigitalAsset[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
 const [showUploadDrawer, setShowUploadDrawer] = useState(false);

 const filesService = useMemo(() => new FilesService(), []);

 const fetchMediaAssets = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);
 
 // Filter for media types only
 const mediaFilters: AssetFilters = {
 category: 'image' // We'll need to expand this to support multiple media types
 };
 
 const result = await filesService.getAssets(undefined, {
 filters: mediaFilters,
 sortField: 'created_at',
 sortDirection: 'desc'
 });

 if (result.error) {
 setError(result.error);
 } else {
 setAssets(result.data?.data || []);
 }
 } catch (err) {
 console.error('Error fetching media assets:', err);
 setError(err instanceof Error ? err.message : 'Failed to load media assets');
 } finally {
 setLoading(false);
 }
 }, [filesService]);

 useEffect(() => {
 fetchMediaAssets();
 }, [fetchMediaAssets]);

 const handleUpload = useCallback(() => {
 setShowUploadDrawer(true);
 }, []);

 const handleView = useCallback(async (asset: DigitalAsset) => {
 try {
 await filesService.incrementViewCount(asset.id);
 await fetchMediaAssets();
 } catch (err) {
 console.error('Error updating view count:', err);
 }
 }, [filesService, fetchMediaAssets]);

 const handleDownload = useCallback(async (asset: DigitalAsset) => {
 if (!asset.file_url) return;
 
 try {
 await filesService.incrementDownloadCount(asset.id);
 window.open(asset.file_url, '_blank');
 await fetchMediaAssets();
 } catch (err) {
 console.error('Error downloading asset:', err);
 }
 }, [filesService, fetchMediaAssets]);

 // Calculate stats
 const stats = useMemo(() => {
 const totalSize = assets.reduce((sum, asset) => sum + (asset.file_size || 0), 0);
 const imageCount = assets.filter(asset => asset.category === 'image').length;
 const videoCount = assets.filter(asset => asset.category === 'video').length;
 const audioCount = assets.filter(asset => asset.category === 'audio').length;
 
 return {
 total: assets.length,
 totalSize: Math.round(totalSize / (1024 * 1024)), // Convert to MB
 imageCount,
 videoCount,
 audioCount
 };
 }, [assets]);

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3">Media Assets</h1>
 <p className="color-muted">Manage multimedia content and digital assets</p>
 </div>
 <Button onClick={handleUpload}>
 <Upload className="w-4 h-4 mr-sm" />
 Upload Media
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card>
 <div className="flex items-center gap-sm">
 <FileCode className="w-5 h-5 color-accent" />
 <div>
 <div className="text-heading-3">{stats.total}</div>
 <div className="text-body-sm color-muted">Total Assets</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Image className="w-5 h-5 color-success" />
 <div>
 <div className="text-heading-3 color-success">{stats.imageCount}</div>
 <div className="text-body-sm color-muted">Images</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Video className="w-5 h-5 color-warning" />
 <div>
 <div className="text-heading-3 color-warning">{stats.videoCount}</div>
 <div className="text-body-sm color-muted">Videos</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Music className="w-5 h-5 color-secondary" />
 <div>
 <div className="text-heading-3 color-secondary">{stats.audioCount}</div>
 <div className="text-body-sm color-muted">Audio</div>
 </div>
 </div>
 </Card>
 </div>

 {/* Media Grid */}
 {loading && (
 <div className="text-center py-xl">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
 <p className="color-muted">Loading media assets...</p>
 </div>
 )}
 
 {error && (
 <Card>
 <div className="text-center py-xl">
 <FileCode className="w-12 h-12 color-destructive mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">Error loading media</h3>
 <p className="color-muted mb-md">{error}</p>
 <Button onClick={fetchMediaAssets}>
 Try Again
 </Button>
 </div>
 </Card>
 )}
 
 {!loading && !error && assets.length === 0 && (
 <Card>
 <div className="text-center py-xl">
 <Image className="w-12 h-12 color-muted mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">No media assets</h3>
 <p className="color-muted mb-md">
 Start building your media library by uploading images, videos, and audio files.
 </p>
 <Button onClick={handleUpload}>
 <Upload className="w-4 h-4 mr-sm" />
 Upload First Asset
 </Button>
 </div>
 </Card>
 )}

 {!loading && !error && assets.length > 0 && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {assets.map(asset => {
 const IconComponent = mediaTypeIcons[asset.category as keyof typeof mediaTypeIcons] || FileCode;
 const isSelected = selectedAssets.includes(asset.id);
 
 return (
 <Card 
 key={asset.id}
 className={`cursor-pointer hover:shadow-elevated transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => handleView(asset)}
 >
 <div className="aspect-square bg-muted/50 rounded-md mb-sm flex items-center justify-center">
 {asset.file_url && (asset.category === 'image') ? (
 <img 
 src={asset.file_url} 
 alt={asset.title}
 className="w-full h-full object-cover rounded-md"
 />
 ) : (
 <IconComponent className="w-12 h-12 color-muted" />
 )}
 </div>
 
 <div className="space-y-sm">
 <h3 className="text-body form-label line-clamp-2">{asset.title}</h3>
 
 <div className="flex items-center justify-between">
 <Badge variant="outline">{asset.category}</Badge>
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Eye className="w-3 h-3" />
 <span>{asset.view_count}</span>
 </div>
 </div>
 
 <div className="flex items-center gap-sm">
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 handleDownload(asset);
 }}
 className="flex-1"
 >
 <Download className="w-3 h-3 mr-xs" />
 Download
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}
