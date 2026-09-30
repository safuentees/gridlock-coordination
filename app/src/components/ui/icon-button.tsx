import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type IconButtonProps = Omit<ComponentProps<typeof Button>, "size" | "asChild" | "aria-label"> & {
  label: string
  size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

/** Familiar actions only: name the button and expose the same label on hover/focus. */
export function IconButton({ label, children, size = "icon-sm", type = "button", ...props }: IconButtonProps) {
  const button = <Button {...props} type={type} size={size} aria-label={label}>{children}</Button>
  return <Tooltip>
    <TooltipTrigger asChild>
      {props.disabled
        ? <span className="inline-flex" tabIndex={0} aria-label={label} aria-disabled="true">{button}</span>
        : button}
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
}
