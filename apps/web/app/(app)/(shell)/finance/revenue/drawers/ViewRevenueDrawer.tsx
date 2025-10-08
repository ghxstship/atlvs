'use client';

import React from 'react';
import { Badge, Building, Button, Calendar, Card, CardContent, CardHeader, CardTitle, DollarSign, Drawer, Edit, FileText, User } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Drawer } from '@ghxstship/ui';

interface ViewRevenueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  revenue?: DataRecord | null;
}

export default function ViewRevenueDrawer({
  isOpen,
  onClose,
  onEdit,
  revenue
}: ViewRevenueDrawerProps) {
  if (!revenue) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Revenue Details">
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{revenue.source}</h2>
            <Badge variant={
              revenue.status === 'received' ? 'success' :
              revenue.status === 'invoiced' ? 'warning' : 'secondary'
            } className="mt-sm">
              {revenue.status}
            </Badge>
          </div>
          {onEdit && (
            <Button onClick={onEdit} variant="secondary">
              <Edit className="h-icon-xs w-icon-xs mr-xs" />
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <DollarSign className="h-icon-sm w-icon-sm" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-green-600 text-lg">
                  ${revenue.amount?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Category</span>
                <Badge variant="secondary">{revenue.category}</Badge>
              </div>

              {revenue.invoice_number && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Invoice Number</span>
                  <span className="font-medium">{revenue.invoice_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-icon-sm w-icon-sm" />
                Recognition Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recognition Date</span>
                <span className="font-medium">
                  {revenue.recognition_date ? new Date(revenue.recognition_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <Badge variant={
                  revenue.status === 'received' ? 'success' :
                  revenue.status === 'invoiced' ? 'warning' : 'secondary'
                }>
                  {revenue.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Associations */}
        {(revenue.client_id || revenue.project_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Associated Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {revenue.client_id && (
                  <div className="flex items-center gap-sm p-sm bg-gray-50 rounded">
                    <User className="h-icon-sm w-icon-sm text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Client</div>
                      <div className="font-medium">{revenue.client_id}</div>
                    </div>
                  </div>
                )}

                {revenue.project_id && (
                  <div className="flex items-center gap-sm p-sm bg-gray-50 rounded">
                    <Building className="h-icon-sm w-icon-sm text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Project</div>
                      <div className="font-medium">{revenue.project_id}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {revenue.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <FileText className="h-icon-sm w-icon-sm" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{revenue.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
              <div>
                <span className="text-gray-600">Created</span>
                <div className="font-medium">
                  {revenue.created_at ? new Date(revenue.created_at).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Last Updated</span>
                <div className="font-medium">
                  {revenue.updated_at ? new Date(revenue.updated_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-md pt-lg border-t">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-icon-xs w-icon-xs mr-xs" />
              Edit Revenue
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
