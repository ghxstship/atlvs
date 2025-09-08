"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelemetry } from "../../lib/telemetry";

export function ProductToggle({ atlvsEnabled, opendeckEnabled }: { atlvsEnabled: boolean; opendeckEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { trackFeatureUsage } = useTelemetry();

  const active = pathname?.startsWith("/opendeck") ? "opendeck" : "atlvs";

  const go = (to: "atlvs" | "opendeck") => {
    if (to === "atlvs" && !atlvsEnabled) return;
    if (to === "opendeck" && !opendeckEnabled) return;
    trackFeatureUsage("ProductToggle", "switch", { to });
    router.push(to === "atlvs" ? "/dashboard" : "/opendeck");
  };

  const baseBtn =
    "px-3 py-1.5 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500";
  const activeCls = "bg-foreground text-background border-foreground";
  const idleCls = "bg-background text-foreground border-neutral-300 hover:bg-neutral-50";
  const disabledCls = "opacity-50 cursor-not-allowed";

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Product Toggle">
      <button
        className={`${baseBtn} ${active === "atlvs" ? activeCls : idleCls} ${!atlvsEnabled ? disabledCls : ""}`}
        onClick={() => go("atlvs")}
        aria-pressed={active === "atlvs"}
        aria-disabled={!atlvsEnabled}
      >
        ATLVS
      </button>
      <button
        className={`${baseBtn} ${active === "opendeck" ? activeCls : idleCls} ${!opendeckEnabled ? disabledCls : ""}`}
        onClick={() => go("opendeck")}
        aria-pressed={active === "opendeck"}
        aria-disabled={!opendeckEnabled}
      >
        OPENDECK
      </button>
    </div>
  );
}
