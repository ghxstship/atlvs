'use client';

export function GalleryView({ data }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {data?.map((item: any) => (
        <div key={item.id} className="p-md border rounded-lg">
          <h3 className="font-semibold">{item.title || item.name}</h3>
        </div>
      ))}
    </div>
  );
}
