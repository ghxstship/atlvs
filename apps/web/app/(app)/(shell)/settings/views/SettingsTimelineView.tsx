'use client';
export function SettingsTimelineView({ data }: any) {
  return <div className="space-y-4">{data?.map((item: any) => <div key={item.id}>{item.name}</div>)}</div>;
}
