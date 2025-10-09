"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Card, Button } from "@ghxstship/ui";
import type { Resource } from '../types';
import { Download, Eye, Trash2, X } from 'lucide-react';

interface FileImageViewProps {
 files: Resource[];
 onView: (file: Resource) => void;
 onDownload: (file: Resource) => void;
 onDelete: (file: Resource) => void;
}

export default function FileImageView({
 files,
 onView,
 onDownload,
 onDelete
}: FileImageViewProps) {
 const [selectedImage, setSelectedImage] = useState<Resource | null>(null);
 const [hoveredId, setHoveredId] = useState<string | null>(null);

 return (
 <div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
 {files.map((file) => (
 <div
 key={file.id}
 className="relative group cursor-pointer"
 onMouseEnter={() => setHoveredId(file.id)}
 onMouseLeave={() => setHoveredId(null)}
 onClick={() => setSelectedImage(file)}
 >
 {/* Image Container */}
 <div className="aspect-square bg-muted rounded-lg overflow-hidden">
 <Image src={file.file_url || ''} alt={file.title} width={48} height={48} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
 </div>

 {/* Overlay on Hover */}
 {hoveredId === file.id && (
 <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center gap-sm animate-in fade-in-0 duration-200">
 <Button
 variant="secondary"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(file);
 }}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDownload(file);
 }}
 >
 <Download className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(file);
 }}
 className="text-destructive"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 )}

 {/* File Name */}
 <div className="mt-sm">
 <p className="text-sm font-medium truncate" title={file.title}>
 {file.title}
 </p>
 </div>
 </div>
 ))}
 </div>

 {files.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No images to display
 </div>
 )}

 {/* Lightbox Modal */}
 {selectedImage && (
 <div
 className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-md animate-in fade-in-0 duration-200"
 onClick={() => setSelectedImage(null)}
 >
 <div className="relative max-w-[90vw] max-h-[90vh]">
 <Image 
 src={selectedImage.file_url || ''} 
 alt={selectedImage.title} 
 width={800} 
 height={600} 
 className="max-w-full max-h-full object-contain cursor-pointer"
 onClick={(e) => e.stopPropagation()}
/>
 
 {/* Close Button */}
 <Button
 variant="secondary"
 size="sm"
 className="absolute top-md right-4"
 onClick={() => setSelectedImage(null)}
 >
 <X className="h-icon-xs w-icon-xs" />
 </Button>

 {/* Image Info */}
 <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-md rounded-lg">
 <h3 className="font-semibold mb-xs">{selectedImage.title}</h3>
 {selectedImage.description && (
 <p className="text-sm mb-sm">{selectedImage.description}</p>
 )}
 <div className="flex items-center gap-md">
 <Button
 variant="secondary"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(selectedImage);
 setSelectedImage(null);
 }}
 >
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View Details
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDownload(selectedImage);
 }}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Download
 </Button>
    </div>
   </div>
  </div>
 </div>
 )}
</div>
);
}
