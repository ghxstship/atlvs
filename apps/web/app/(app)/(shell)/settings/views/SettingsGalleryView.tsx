'use client';
export function SettingsGalleryView({ data }: any) {
  return <div className="grid grid-cols-3 gap-md">{data?.map((item: any) => <div key={item.id} className="p-md border rounded">{item.name}</div>)}</div>;
}
