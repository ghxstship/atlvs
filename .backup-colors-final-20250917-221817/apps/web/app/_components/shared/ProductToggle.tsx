"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelemetry } from "@/lib/telemetry";

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
    "px-md py-xs.5 text-body-sm rounded-md border transition-colors focus:outline-none focus:ring-primary ring-primary focus:ring-primary focus:ring-primary ring-primary focus:ring-primary focus:ring-ring";
  const activeCls = "bg-foreground text-background border-foreground";
  const idleCls = "bg-background color-foreground border-border hover:bg-secondary/50";
  const disabledCls = "opacity-50 cursor-not-allowed";

  return (
    <div className="inline-flex items-center gap-xs" role="group" aria-label="Product Toggle">
      <button aria-label="button"
        className={`${baseBtn} ${active === "atlvs" ? activeCls : idleCls} ${!atlvsEnabled ? disabledCls : ""}`}
        role="button" tabIndex={0} onClick={() => go("atlvs")}
        aria-pressed={active === "atlvs"}
        aria-disabled={!atlvsEnabled}
      >
        ATLVS
      </button>
      <button aria-label="button"
        className={`${baseBtn} ${active === "opendeck" ? activeCls : idleCls} ${!opendeckEnabled ? disabledCls : ""}`}
        role="button" tabIndex={0} onClick={() => go("opendeck")}
        aria-pressed={active === "opendeck"}
        aria-disabled={!opendeckEnabled}
      >
        OPENDECK
      </button>
    </div>
  );
}
