import { Suspense } from 'react';
import { Card } from '@ghxstship/ui';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';


function DashboardSidebarSkeleton() {
  return (
    <div className="space-y-md">
      <div className="h-icon-lg bg-gray-200 rounded animate-pulse" />
      <div className="space-y-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-component-lg bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  return (
    <div className="w-container-md border-l border-gray-200 bg-gray-50 p-md space-y-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Widgets</h3>

      <Suspense fallback={<DashboardSidebarSkeleton />}>
        <div className="space-y-md">
          {/* Recent Activity Widget */}
          <Card className="p-md">
            <div className="flex items-center space-x-xs mb-3">
              <Activity className="h-icon-xs w-icon-xs text-blue-600" />
              <h4 className="font-medium text-sm">Recent Activity</h4>
            </div>
            <div className="space-y-xs text-xs text-gray-600">
              <div>• Project "Blackwater Reverb" updated</div>
              <div>• New team member added</div>
              <div>• Invoice #1234 paid</div>
            </div>
          </Card>

          {/* Quick Stats Widget */}
          <Card className="p-md">
            <div className="flex items-center space-x-xs mb-3">
              <TrendingUp className="h-icon-xs w-icon-xs text-green-600" />
              <h4 className="font-medium text-sm">Quick Stats</h4>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-600">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">8</div>
                <div className="text-xs text-gray-600">Team Members</div>
              </div>
            </div>
          </Card>

          {/* Upcoming Events Widget */}
          <Card className="p-md">
            <div className="flex items-center space-x-xs mb-3">
              <Users className="h-icon-xs w-icon-xs text-purple-600" />
              <h4 className="font-medium text-sm">Upcoming Events</h4>
            </div>
            <div className="space-y-xs text-xs text-gray-600">
              <div>• Team Standup - Today 2:00 PM</div>
              <div>• Client Review - Tomorrow 10:00 AM</div>
              <div>• Project Demo - Friday 3:00 PM</div>
            </div>
          </Card>

          {/* Budget Overview Widget */}
          <Card className="p-md">
            <div className="flex items-center space-x-xs mb-3">
              <DollarSign className="h-icon-xs w-icon-xs text-yellow-600" />
              <h4 className="font-medium text-sm">Budget Overview</h4>
            </div>
            <div className="space-y-xs">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Spent</span>
                <span className="font-medium">$45,230</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <div className="text-xs text-gray-600">72% of $75,000 budget</div>
            </div>
          </Card>
        </div>
      </Suspense>
    </div>
  );
}
