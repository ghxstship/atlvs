import * as React from "react"
import { cn } from "../lib/utils"

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-micro w-full" : "h-full w-micro",
      className
    )}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
