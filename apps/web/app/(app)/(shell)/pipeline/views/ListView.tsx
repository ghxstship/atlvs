'use client';


import {
  ListView
} from "@ghxstship/ui";

export function ListView({ data }: any) {
  return (
    <div className="space-y-xs">
      {data?.map((item: any) => (
        <div key={item.id} className="p-sm border-b">
          {item.title || item.name}
        </div>
      ))}
    </div>
  );
}
