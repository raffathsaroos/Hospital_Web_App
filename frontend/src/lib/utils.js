import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Joins conditional class names without Tailwind conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
