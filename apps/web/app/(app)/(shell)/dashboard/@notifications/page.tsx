import { Suspense } from 'react';
import { Card, Badge, Skeleton } from '@ghxstship/ui';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';


async function getNotifications() {
  // Fetch real-time notifications
  // This runs in parallel with the main dashboard page
  return [
    {
      id: 1,
      type: 'success',
      title: 'Project Completed',
      message: 'Main Deck Takeover has been marked as complete',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Budget Alert',
      message: 'Q4 Marketing budget is at 85% utilization',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'New Team Member',
      message: 'Sarah Johnson joined the Engineering team',
      time: '2 hours ago',
    },
  ];
}

async function NotificationsContent() {
  const notifications = await getNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-icon-xs w-icon-xs text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-icon-xs w-icon-xs text-yellow-600" />;
      case 'info':
        return <Info className="h-icon-xs w-icon-xs text-blue-600" />;
      default:
        return <Bell className="h-icon-xs w-icon-xs" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-5 font-semibold">Recent Activity</h3>
        <Badge variant="default">{notifications.length}</Badge>
      </div>

      <div className="space-y-sm">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-md hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-sm">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-xs">
                  <h4 className="text-sm font-semibold truncate">
                    {notification.title}
                  </h4>
                  <Badge variant={getBadgeVariant(notification.type)} className="ml-sm">
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-xs">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all notifications →
      </button>
    </div>
  );
}

function NotificationsLoading() {
  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <Skeleton className="h-icon-md w-component-xl" />
        <Skeleton className="h-icon-sm w-icon-lg rounded-full" />
      </div>
      <div className="space-y-sm">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-md">
            <div className="flex items-start gap-sm">
              <Skeleton className="h-icon-xs w-icon-xs rounded-full" />
              <div className="flex-1 space-y-xs">
                <Skeleton className="h-icon-xs w-component-xl" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-component-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsSlot() {
  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsContent />
    </Suspense>
  );
}
