"use client";

import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import { formatDistanceToNow } from "date-fns";
import type { ProjectFile } from "../FilesClient";
import type { LucideIcon } from "lucide-react";

interface FileGridViewProps {
 files: ProjectFile[];
 selectedFiles: Set<string>;
 onSelectFile: (id: string) => void;
 onView: (file: ProjectFile) => void;
 onEdit: (file: ProjectFile) => void;
 onDownload: (file: ProjectFile) => void;
 onDelete: (file: ProjectFile) => void;
 onShare: (file: ProjectFile) => void;
 formatFileSize: (bytes: number) => string;
 getCategoryIcon: (category: string) => LucideIcon;
 getAccessIcon: (level: string) => LucideIcon;
}

export default function FileGridView({
 files,
 selectedFiles,
 onSelectFile,
 onView,
 onEdit,
 onDownload,
 onDelete,
 onShare,
 formatFileSize,
 getCategoryIcon,
 getAccessIcon,
}: FileGridViewProps) {
 const getCategoryColor = (category: string) => {
 switch (category) {
 case "document":
 return "bg-blue-100 text-blue-800";
 case "image":
 return "bg-green-100 text-green-800";
 case "video":
 return "bg-purple-100 text-purple-800";
 case "audio":
 return "bg-yellow-100 text-yellow-800";
 case "drawing":
 return "bg-indigo-100 text-indigo-800";
 case "specification":
 return "bg-pink-100 text-pink-800";
 case "report":
 return "bg-orange-100 text-orange-800";
 default:
 return "bg-gray-100 text-gray-800";
 }
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {files.map((file) => {
 const CategoryIcon = getCategoryIcon(file.category);
 const AccessIcon = getAccessIcon(file.access_level);
 
 return (
 <Card
 key={file.id}
 className={`p-md cursor-pointer hover:shadow-lg transition-shadow ${
 selectedFiles.has(file.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(file)}
 >
 <div className="flex items-start justify-between mb-sm">
 <Checkbox
 checked={selectedFiles.has(file.id)}
 onChange={() => onSelectFile(file.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDownload(file);
 }}
 >
 <Download className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onShare(file);
 }}
 >
 <Share2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 <div className="space-y-sm">
 {/* File Icon and Category */}
 <div className="flex items-center justify-center h-component-lg bg-muted rounded-lg">
 <CategoryIcon className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 </div>

 {/* File Name */}
 <h3 className="font-semibold truncate" title={file.name}>
 {file.name}
 </h3>

 {/* Badges */}
 <div className="flex items-center gap-xs flex-wrap">
 <Badge className={getCategoryColor(file.category)}>
 {file.category}
 </Badge>
 {file.version !== "1.0" && (
 <Badge variant="secondary">v{file.version}</Badge>
 )}
 {file.is_latest && (
 <Badge variant="success">Latest</Badge>
 )}
 </div>

 {/* File Info */}
 <div className="space-y-xs text-sm text-muted-foreground">
 <div className="flex items-center justify-between">
 <span>Size:</span>
 <span>{formatFileSize(file.file_size)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Access:</span>
 <div className="flex items-center gap-xs">
 <AccessIcon className="h-3 w-3" />
 <span className="capitalize">{file.access_level}</span>
 </div>
 </div>
 {file.project && (
 <div className="truncate" title={file.project.name}>
 Project: {file.project.name}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="pt-sm border-t text-xs text-muted-foreground">
 <div className="flex items-center justify-between">
 <span>
 {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
 </span>
 {file.download_count > 0 && (
 <span>{file.download_count} downloads</span>
 )}
 </div>
 {file.uploaded_by_user && (
 <div className="mt-xs truncate">
 by {file.uploaded_by_user.full_name || file.uploaded_by_user.email}
 </div>
 )}
 </div>

 {/* Tags */}
 {file.tags && file.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {file.tags.slice(0, 3).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {file.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{file.tags.length - 3}
 </Badge>
 )}
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
