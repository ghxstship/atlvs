'use client';

export function ListView({ data }: any) {
  return (
    <div className="space-y-2">
      {data?.map((item: any) => (
        <div key={item.id} className="p-3 border-b">
          {item.title || item.name}
        </div>
      ))}
    </div>
  );
}
