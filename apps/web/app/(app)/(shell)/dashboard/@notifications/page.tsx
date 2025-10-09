'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

export default function NotificationsSlot() {
  const notifications = [
    { id: 1, type: 'success', message: 'Project Alpha completed', time: '2h ago' },
    { id: 2, type: 'info', message: 'New team member added', time: '4h ago' },
    { id: 3, type: 'warning', message: 'Budget threshold reached', time: '6h ago' }
  ];

  return (
    <Card className="p-md">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-body form-label">Notifications</h3>
        <Bell className="h-icon-xs w-icon-xs color-muted" />
      </div>
      <div className="space-y-sm">
        {notifications.map(notification => (
          <div key={notification.id} className="flex items-start gap-sm p-sm rounded-md bg-secondary/50">
            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-xs" />}
            {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-xs" />}
            {notification.type === 'info' && <Bell className="h-4 w-4 text-info flex-shrink-0 mt-xs" />}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm">{notification.message}</p>
              <p className="text-body-sm color-muted">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
