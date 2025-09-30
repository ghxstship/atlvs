"use client";

import { Badge, Button, Checkbox } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { ProjectFile } from "../FilesClient";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Download, Edit, Share2, Trash2 } from 'lucide-react';

interface FileListViewProps {
 files: ProjectFile[];
 selectedFiles: Set<string>;
 fieldVisibility: Array<{ id: string; label: string; visible: boolean; sortable: boolean }>;
 sortField: string;
 sortDirection: "asc" | "desc";
 onSelectAll: () => void;
 onSelectFile: (id: string) => void;
 onSort: (field: string) => void;
 onView: (file: ProjectFile) => void;
 onEdit: (file: ProjectFile) => void;
 onDownload: (file: ProjectFile) => void;
 onDelete: (file: ProjectFile) => void;
 onShare: (file: ProjectFile) => void;
 formatFileSize: (bytes: number) => string;
}

export default function FileListView({
 files,
 selectedFiles,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectFile,
 onSort,
 onView,
 onEdit,
 onDownload,
 onDelete,
 onShare,
 formatFileSize,
}: FileListViewProps) {
 const visibleFields = fieldVisibility.filter((f) => f.visible);

 const getCategoryBadgeVariant = (category: string) => {
 switch (category) {
 case "document":
 return "info";
 case "image":
 return "success";
 case "video":
 return "warning";
 case "audio":
 return "secondary";
 default:
 return "default";
 }
 };

 const getAccessBadgeVariant = (level: string) => {
 switch (level) {
 case "public":
 return "success";
 case "team":
 return "info";
 case "restricted":
 return "destructive";
 default:
 return "secondary";
 }
 };

 const renderFieldValue = (file: ProjectFile, fieldId: string) => {
 switch (fieldId) {
 case "name":
 return (
 <div className="font-medium">
 {file.name}
 {file.is_latest && (
 <Badge variant="success" className="ml-sm scale-90">
 Latest
 </Badge>
 )}
 </div>
 );
 case "category":
 return (
 <Badge variant={getCategoryBadgeVariant(file.category)}>
 {file.category}
 </Badge>
 );
 case "file_type":
 return <span className="text-sm">{file.file_type}</span>;
 case "file_size":
 return <span className="text-sm">{formatFileSize(file.file_size)}</span>;
 case "version":
 return <Badge variant="secondary">v{file.version}</Badge>;
 case "uploaded_by":
 return (
 <span className="text-sm">
 {file.uploaded_by_user?.full_name || file.uploaded_by_user?.email || "Unknown"}
 </span>
 );
 case "access_level":
 return (
 <Badge variant={getAccessBadgeVariant(file.access_level)}>
 {file.access_level}
 </Badge>
 );
 case "tags":
 return (
 <div className="flex flex-wrap gap-xs">
 {file.tags?.slice(0, 2).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {file.tags?.length > 2 && (
 <Badge variant="outline" className="text-xs">
 +{file.tags.length - 2}
 </Badge>
 )}
 </div>
 );
 case "download_count":
 return <span className="text-sm">{file.download_count}</span>;
 case "created_at":
 return <span className="text-sm">{format(parseISO(file.created_at), "MMM d, yyyy")}</span>;
 case "updated_at":
 return <span className="text-sm">{format(parseISO(file.updated_at), "MMM d, yyyy")}</span>;
 default:
 return "-";
 }
 };

 return (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left p-sm">
 <Checkbox
 checked={selectedFiles.size === files.length && files.length > 0}
 onChange={onSelectAll}
 />
 </th>
 {visibleFields.map((field) => (
 <th
 key={field.id}
 className={`text-left p-sm ${
 field.sortable ? "cursor-pointer hover:bg-muted/50" : ""
 }`}
 onClick={() => field.sortable && onSort(field.id)}
 >
 <div className="flex items-center gap-xs">
 {field.label}
 {field.sortable && (
 <>
 {sortField === field.id ? (
 sortDirection === "asc" ? (
 <ArrowUp className="h-3 w-3" />
 ) : (
 <ArrowDown className="h-3 w-3" />
 )
 ) : (
 <ArrowUpDown className="h-3 w-3 opacity-30" />
 )}
 </>
 )}
 </div>
 </th>
 ))}
 <th className="text-left p-sm">Actions</th>
 </tr>
 </thead>
 <tbody>
 {files.map((file) => (
 <tr
 key={file.id}
 className={`border-b hover:bg-muted/50 cursor-pointer ${
 selectedFiles.has(file.id) ? "bg-primary/5" : ""
 }`}
 onClick={() => onView(file)}
 >
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedFiles.has(file.id)}
 onChange={() => onSelectFile(file.id)}
 />
 </td>
 {visibleFields.map((field) => (
 <td key={field.id} className="p-sm">
 {renderFieldValue(file, field.id)}
 </td>
 ))}
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDownload(file)}
 >
 <Download className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onShare(file)}
 >
 <Share2 className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(file)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(file)}
 className="text-destructive"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 
 {files.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No files to display
 </div>
 )}
 </div>
 );
}
