import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor focusRing [v0.0.1]
export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-accent-default",
]

// Tremor focusInput [v0.0.2]
export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-input-border-focus/30",
  // border color
  "focus:border-input-border-focus",
]

// Tremor hasErrorInput [v0.0.1]
export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-danger",
  // ring color
  "ring-danger/30",
]
