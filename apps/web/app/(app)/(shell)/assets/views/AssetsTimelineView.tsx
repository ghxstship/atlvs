'use client';
export function AssetsTimelineView({ data }: any) {
  return <div className="space-y-md">{data?.map((item: any) => <div key={item.id}>{item.name}</div>)}</div>;
}
