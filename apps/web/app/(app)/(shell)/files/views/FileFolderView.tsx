"use client";

import { useState } from "react";
import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import type { ProjectFile } from "../FilesClient";
import type { LucideIcon } from "lucide-react";

interface FileFolderViewProps {
 groupedFiles: Record<string, ProjectFile[]>;
 selectedFiles: Set<string>;
 onSelectFile: (id: string) => void;
 onView: (file: ProjectFile) => void;
 onDownload: (file: ProjectFile) => void;
 onDelete: (file: ProjectFile) => void;
 formatFileSize: (bytes: number) => string;
 getCategoryIcon: (category: string) => LucideIcon;
}

export default function FileFolderView({
 groupedFiles,
 selectedFiles,
 onSelectFile,
 onView,
 onDownload,
 onDelete,
 formatFileSize,
 getCategoryIcon,
}: FileFolderViewProps) {
 const [expandedFolders, setExpandedFolders] = useState<Set<string>(
 new Set(Object.keys(groupedFiles))
 );

 const toggleFolder = (category: string) => {
 setExpandedFolders((prev: unknown) => {
 const next = new Set(prev);
 if (next.has(category)) {
 next.delete(category);
 } else {
 next.add(category);
 }
 return next;
 });
 };

 const getCategoryColor = (category: string) => {
 switch (category) {
 case "document":
 return "text-blue-600";
 case "image":
 return "text-green-600";
 case "video":
 return "text-purple-600";
 case "audio":
 return "text-yellow-600";
 case "drawing":
 return "text-indigo-600";
 case "specification":
 return "text-pink-600";
 case "report":
 return "text-orange-600";
 default:
 return "text-gray-600";
 }
 };

 const getTotalSize = (files: ProjectFile[]) => {
 const total = files.reduce((sum, file) => sum + file.file_size, 0);
 return formatFileSize(total);
 };

 return (
 <div className="space-y-md">
 {Object.entries(groupedFiles).map(([category, files]) => {
 const CategoryIcon = getCategoryIcon(category);
 const isExpanded = expandedFolders.has(category);

 return (
 <div key={category} className="border rounded-lg">
 {/* Folder Header */}
 <div
 className="flex items-center justify-between p-md bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
 onClick={() => toggleFolder(category)}
 >
 <div className="flex items-center gap-sm">
 <Button variant="ghost" size="sm" className="p-0">
 {isExpanded ? (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronRight className="h-icon-xs w-icon-xs" />
 )}
 </Button>
 <Folder className={`h-icon-sm w-icon-sm ${getCategoryColor(category)}`} />
 <h3 className="font-semibold capitalize">{category}</h3>
 <Badge variant="secondary">{files.length} files</Badge>
 <span className="text-sm text-muted-foreground">
 {getTotalSize(files)}
 </span>
 </div>
 </div>

 {/* Folder Contents */}
 {isExpanded && (
 <div className="p-md">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
 {files.map((file) => (
 <div
 key={file.id}
 className={`flex items-center gap-sm p-sm border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
 selectedFiles.has(file.id) ? "bg-primary/5 border-primary" : ""
 }`}
 onClick={() => onView(file)}
 >
 <Checkbox
 checked={selectedFiles.has(file.id)}
 onChange={() => onSelectFile(file.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 
 <CategoryIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 
 <div className="flex-1 min-w-0">
 <div className="font-medium truncate" title={file.name}>
 {file.name}
 </div>
 <div className="flex items-center gap-sm text-xs text-muted-foreground">
 <span>{formatFileSize(file.file_size)}</span>
 {file.version !== "1.0" && (
 <Badge variant="outline" className="scale-75">
 v{file.version}
 </Badge>
 )}
 {file.is_latest && (
 <Badge variant="success" className="scale-75">
 Latest
 </Badge>
 )}
 </div>
 </div>

 <div className="flex items-center gap-xs" onClick={(e) => e.stopPropagation()}>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDownload(file)}
 >
 <Download className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(file)}
 className="text-destructive"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 })}

 {Object.keys(groupedFiles).length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No files to display
 </div>
 )}
 </div>
 );
}
