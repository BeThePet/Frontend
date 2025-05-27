"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LinkButtonProps extends ButtonProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function LinkButton({ href, className, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={cn("inline-block", className)}>
      <Button {...props}>{children}</Button>
    </Link>
  )
} 