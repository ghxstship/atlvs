export default function DashboardOverviewLayout({
  content,
  sidebar,
}: {
  content: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1">
        {content}
      </div>

      {/* Sidebar area */}
      {sidebar}
    </div>
  );
}
