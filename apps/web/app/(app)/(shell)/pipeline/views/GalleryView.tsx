'use client';

export function GalleryView({ data }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.map((item: any) => (
        <div key={item.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{item.title || item.name}</h3>
        </div>
      ))}
    </div>
  );
}
