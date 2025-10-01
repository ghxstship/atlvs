/**
 * PEOPLE MODULE - CARD VIEW COMPONENT
 * Card/tile grid view for People data
 * Responsive grid with rich information display
 */

"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardViewProps {
  data: unknown[];
  loading?: boolean;
  onCardClick?: (item: unknown) => void;
  onEdit?: (item: unknown) => void;
  onDelete?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  className?: string;
  columns?: number;
}

const PeopleCardView: React.FC<CardViewProps> = ({
  data,
  loading = false,
  onCardClick,
  onEdit,
  onDelete,
  onView,
  className,
  columns = 3
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const renderCard = (person: unknown) => {
    const isHovered = hoveredCard === person.id;

    return (
      <div
        key={person.id}
        className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-200 p-lg cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-blue-300 hover:-translate-y-1",
          isHovered && "ring-2 ring-blue-500 ring-opacity-50",
          onCardClick && "cursor-pointer"
        )}
        onMouseEnter={() => setHoveredCard(person.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onCardClick?.(person)}
      >
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-sm">
            <div className="w-icon-2xl h-icon-2xl bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {person.first_name?.[0]}{person.last_name?.[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {person.first_name} {person.last_name}
              </h3>
              <p className="text-sm text-gray-500">{person.title || 'No title'}</p>
            </div>
          </div>

          {/* Action menu */}
          {(onView || onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Could implement dropdown menu here
                }}
                className="p-xs rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-icon-xs w-icon-xs text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Contact information */}
        <div className="space-y-xs mb-4">
          {person.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-icon-xs w-icon-xs mr-2 text-gray-400" />
              <span className="truncate">{person.email}</span>
            </div>
          )}

          {person.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-icon-xs w-icon-xs mr-2 text-gray-400" />
              <span>{person.phone}</span>
            </div>
          )}

          {person.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-icon-xs w-icon-xs mr-2 text-gray-400" />
              <span className="truncate">{person.location}</span>
            </div>
          )}

          {person.start_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-icon-xs w-icon-xs mr-2 text-gray-400" />
              <span>Started {new Date(person.start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Department and status */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-xs.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {person.department || 'No department'}
          </span>
          <span className={cn(
            "inline-flex items-center px-xs.5 py-0.5 rounded-full text-xs font-medium",
            person.status === 'active'
              ? "bg-green-100 text-green-800"
              : person.status === 'inactive'
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          )}>
            {person.status || 'pending'}
          </span>
        </div>

        {/* Quick actions */}
        {(onView || onEdit || onDelete) && (
          <div className="flex items-center justify-end space-x-xs pt-2 border-t border-gray-100">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(person);
                }}
                className="p-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="View details"
              >
                <Eye className="h-icon-xs w-icon-xs" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(person);
                }}
                className="p-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                title="Edit person"
              >
                <Edit className="h-icon-xs w-icon-xs" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(person);
                }}
                className="p-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete person"
              >
                <Trash2 className="h-icon-xs w-icon-xs" />
              </button>
            )}
          </div>
        )}

        {/* Bio preview */}
        {person.bio && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-xs">
              {person.bio}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderLoadingCards = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={`loading-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-lg">
        <div className="animate-pulse">
          <div className="flex items-start space-x-sm mb-4">
            <div className="w-icon-2xl h-icon-2xl bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-icon-xs bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-xs mb-4">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-icon-sm/6"></div>
          </div>
          <div className="flex justify-between mb-4">
            <div className="h-icon-sm bg-gray-200 rounded w-component-lg"></div>
            <div className="h-icon-sm bg-gray-200 rounded w-component-md"></div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("grid gap-lg", gridCols[columns as keyof typeof gridCols] || gridCols[3])}>
        {loading ? (
          renderLoadingCards()
        ) : data.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-xsxl">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-icon-2xl w-icon-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">No people found</h3>
              <p className="text-sm text-gray-500 mt-1">Get started by adding your first team member.</p>
            </div>
          </div>
        ) : (
          data.map(renderCard)
        )}
      </div>

      {/* Summary footer */}
      {!loading && data.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {data.length} team member{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default PeopleCardView;
