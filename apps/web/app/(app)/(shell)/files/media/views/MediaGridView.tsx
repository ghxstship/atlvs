'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Card, Badge, Button } from '@ghxstship/ui';
import type { MediaAsset } from '../types';

const mediaTypeIcons = {
 image: Image,
 video: Video,
 audio: Music,
 other: FileCode,
};

interface MediaGridViewProps {
 assets: MediaAsset[];
 onAssetClick: (asset: MediaAsset) => void;
 onAssetEdit: (asset: MediaAsset) => void;
 onAssetDownload: (asset: MediaAsset) => void;
 selectedAssets: string[];
 onSelectionChange: (assetIds: string[]) => void;
}

export default function MediaGridView({
 assets,
 onAssetClick,
 onAssetEdit,
 onAssetDownload,
 selectedAssets,
 onSelectionChange
}: MediaGridViewProps) {
 const handleAssetSelect = (assetId: string, selected: boolean) => {
 if (selected) {
 onSelectionChange([...selectedAssets, assetId]);
 } else {
 onSelectionChange(selectedAssets.filter(id => id !== assetId));
 }
 };

 const formatFileSize = (bytes: number) => {
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 if (bytes === 0) return '0 Bytes';
 const i = Math.floor(Math.log(bytes) / Math.log(1024));
 return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
 };

 const formatDuration = (seconds: number) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {assets.map(asset => {
 const IconComponent = mediaTypeIcons[asset.category] || FileCode;
 const isSelected = selectedAssets.includes(asset.id);
 
 return (
 <Card 
 key={asset.id}
 className={`cursor-pointer hover:shadow-elevated transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => onAssetClick(asset)}
 >
 <div className="relative">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => {
 e.stopPropagation();
 handleAssetSelect(asset.id, e.target.checked);
 }}
 className="absolute top-sm left-sm z-10 rounded border-border"
 />
 
 <div className="aspect-square bg-muted/50 rounded-md mb-sm flex items-center justify-center relative overflow-hidden">
 {asset.thumbnail_url || (asset.category === 'image' && asset.file_url) ? (
 <img 
 src={asset.thumbnail_url || asset.file_url} 
 alt={asset.title}
 className="w-full h-full object-cover"
 />
 ) : (
 <IconComponent className="w-12 h-12 color-muted" />
 )}
 
 {asset.category === 'video' && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
 <Play className="w-8 h-8 text-white" />
 </div>
 )}
 
 {asset.duration && (
 <div className="absolute bottom-xs right-xs bg-black/70 text-white text-xs px-xs py-xxs rounded">
 {formatDuration(asset.duration)}
 </div>
 )}
 </div>
 </div>
 
 <div className="space-y-sm">
 <h3 className="text-body form-label line-clamp-2">{asset.title}</h3>
 
 {asset.description && (
 <p className="text-body-sm color-muted line-clamp-2">{asset.description}</p>
 )}
 
 <div className="flex items-center justify-between">
 <Badge variant="outline">{asset.category}</Badge>
 <span className="text-xs color-muted">{formatFileSize(asset.file_size)}</span>
 </div>
 
 {asset.dimensions && (
 <div className="text-xs color-muted">
 {asset.dimensions.width} × {asset.dimensions.height}
 </div>
 )}
 
 <div className="flex items-center justify-between text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Eye className="w-3 h-3" />
 <span>{asset.view_count}</span>
 </div>
 <div className="flex items-center gap-xs">
 <Download className="w-3 h-3" />
 <span>{asset.download_count}</span>
 </div>
 </div>
 
 <div className="flex items-center gap-sm pt-sm border-t">
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onAssetEdit(asset);
 }}
 className="flex-1"
 >
 <Edit className="w-3 h-3 mr-xs" />
 Edit
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onAssetDownload(asset);
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
 );
}
