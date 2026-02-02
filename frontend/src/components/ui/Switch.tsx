import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "cursor-pointer select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}>
        <input
          type="checkbox"
          ref={ref}
          disabled={disabled}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div className={cn(
          "h-6 w-11 rounded-full bg-gray-200 transition-colors",
          "peer-checked:bg-gradient-orange peer-checked:bg-[hsl(var(--primary))]",
          "after:absolute after:left-[2px] after:top-[2px]",
          "after:h-5 after:w-5 after:rounded-full after:bg-white",
          "after:transition-transform after:content-['']",
          "peer-checked:after:translate-x-full"
        )} />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
