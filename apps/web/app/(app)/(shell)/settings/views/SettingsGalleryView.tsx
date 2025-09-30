'use client';
export function SettingsGalleryView({ data }: any) {
  return <div className="grid grid-cols-3 gap-4">{data?.map((item: any) => <div key={item.id} className="p-4 border rounded">{item.name}</div>)}</div>;
}
