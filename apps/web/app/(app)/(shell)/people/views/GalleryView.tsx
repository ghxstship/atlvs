/**
 * PEOPLE MODULE - GALLERY VIEW COMPONENT
 * Visual card-based presentation with masonry layout
 * Lazy loading and media optimization
 */

"use client";

import React, { useState } from 'react';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageViewProps {
  data: unknown[];
  loading?: boolean;
  onCardClick?: (item: unknown) => void;
  onEdit?: (item: unknown) => void;
  onDelete?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  className?: string;
  masonry?: boolean;
}

const PeopleImageView: React.FC<ImageViewProps> = ({
  data,
  loading = false,
  onCardClick,
  onEdit,
  onDelete,
  onView,
  className,
  masonry = true
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const renderCard = (person: unknown, index: number) => {
    const isSelected = selectedCard === person.id;

    return (
      <div
        key={person.id}
        className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 group",
          "hover:shadow-lg hover:border-blue-300 hover:-translate-y-1",
          isSelected && "ring-2 ring-blue-500 ring-opacity-50",
          masonry && `masonry-item-${index % 3}` // Simulate masonry with different heights
        )}
        onClick={() => {
          setSelectedCard(person.id);
          onCardClick?.(person);
        }}
        style={masonry ? {
          height: `${200 + (index % 3) * 50}px` // Variable heights for masonry effect
        } : undefined}
      >
        {/* Avatar section */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {person.first_name?.[0]}{person.last_name?.[0]}
          </div>

          {/* Status indicator */}
          <div className={cn(
            "absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white",
            person.status === 'active' ? "bg-green-500" :
            person.status === 'inactive' ? "bg-red-500" : "bg-yellow-500"
          )}></div>
        </div>

        {/* Content section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
            {person.first_name} {person.last_name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 truncate">{person.title || 'No title'}</p>
          <p className="text-xs text-gray-400 mb-3 truncate">{person.department || 'No department'}</p>

          {/* Quick info */}
          <div className="space-y-1 text-xs text-gray-600">
            {person.email && (
              <div className="truncate">{person.email}</div>
            )}
            {person.location && (
              <div className="truncate">{person.location}</div>
            )}
          </div>
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(person);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                title="View details"
              >
                <Eye className="h-4 w-4 text-gray-700" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(person);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                title="Edit person"
              >
                <Edit className="h-4 w-4 text-gray-700" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(person);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                title="Delete person"
              >
                <Trash2 className="h-4 w-4 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingCards = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <div
        key={`loading-${index}`}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
        style={masonry ? { height: `${200 + (index % 3) * 50}px` } : undefined}
      >
        <div className="h-32 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className={cn("w-full", className)}>
      {masonry ? (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {loading ? (
            renderLoadingCards()
          ) : data.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No team members</h3>
                <p className="text-gray-500 mt-1">Start building your gallery by adding team members.</p>
              </div>
            </div>
          ) : (
            data.map((person, index) => renderCard(person, index))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {loading ? (
            renderLoadingCards()
          ) : data.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No team members</h3>
                <p className="text-gray-500 mt-1">Start building your gallery by adding team members.</p>
              </div>
            </div>
          ) : (
            data.map((person, index) => renderCard(person, index))
          )}
        </div>
      )}

      {/* Summary */}
      {!loading && data.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          {data.length} team member{data.length !== 1 ? 's' : ''} in gallery
        </div>
      )}
    </div>
  );
};

export default PeopleImageView;
