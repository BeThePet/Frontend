import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type { HTMLAttributes } from "react"

interface LinkButtonProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
}

export function LinkButton({
  href,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  )
}
