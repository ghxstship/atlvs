/**
 * PEOPLE MODULE - LIST VIEW COMPONENT
 * Detailed list view for People data with rich information display
 * Compact yet comprehensive information layout
 */

"use client";

import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ListViewProps {
  data: unknown[];
  loading?: boolean;
  onItemClick?: (item: unknown) => void;
  onEdit?: (item: unknown) => void;
  onDelete?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  className?: string;
  showAvatar?: boolean;
  showContact?: boolean;
  showMetadata?: boolean;
}

const PeopleListView: React.FC<ListViewProps> = ({
  data,
  loading = false,
  onItemClick,
  onEdit,
  onDelete,
  onView,
  className,
  showAvatar = true,
  showContact = true,
  showMetadata = true
}) => {
  const renderListItem = (person: unknown) => {
    return (
      <div
        key={person.id}
        className={cn(
          "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200",
          onItemClick && "cursor-pointer"
        )}
        onClick={() => onItemClick?.(person)}
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          {showAvatar && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {person.first_name?.[0]}{person.last_name?.[0]}
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {person.first_name} {person.last_name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{person.title || 'No title'}</p>

                {/* Contact information */}
                {showContact && (
                  <div className="space-y-1 mb-3">
                    {person.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}

                    {person.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{person.phone}</span>
                      </div>
                    )}

                    {person.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{person.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                {person.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {person.bio}
                  </p>
                )}

                {/* Metadata */}
                {showMetadata && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Department: {person.department || 'Not assigned'}</span>
                    {person.start_date && (
                      <span>
                        Started: {new Date(person.start_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full font-medium",
                      person.status === 'active'
                        ? "bg-green-100 text-green-800"
                        : person.status === 'inactive'
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    )}>
                      {person.status || 'pending'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(onView || onEdit || onDelete) && (
                <div className="flex items-center space-x-1 ml-4">
                  {onView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(person);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(person);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit person"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(person);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete person"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingItems = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div key={`loading-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse flex items-start space-x-4">
          {showAvatar && (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          )}
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            {showContact && (
              <div className="space-y-2 mb-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            )}
            {showMetadata && (
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {loading ? (
        renderLoadingItems()
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-500">Start building your team by adding your first member.</p>
        </div>
      ) : (
        data.map(renderListItem)
      )}

      {/* Summary */}
      {!loading && data.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          {data.length} team member{data.length !== 1 ? 's' : ''} displayed
        </div>
      )}
    </div>
  );
};

export default PeopleListView;
