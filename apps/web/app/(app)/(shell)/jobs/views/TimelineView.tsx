'use client';

export function TimelineView({ data }: any) {
  return (
    <div className="space-y-4">
      {data?.map((item: any) => (
        <div key={item.id} className="flex gap-4">
          <div className="w-2 bg-blue-500 rounded" />
          <div>
            <h4 className="font-semibold">{item.title || item.name}</h4>
            <p className="text-sm text-gray-600">{item.created_at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
