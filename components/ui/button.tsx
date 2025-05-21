import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 버튼 스타일 변경: 앱 전체 색상 테마에 맞게 조정
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform border border-transparent shadow-md",
  {
    variants: {
      variant: {
        default: "bg-pink-400 text-white hover:bg-pink-500 shadow-pink-200/50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/30",
        outline: "border-2 border-pink-200 bg-white hover:bg-pink-50 text-pink-500 shadow-pink-100/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-secondary/30",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-none text-gray-700",
        link: "text-pink-500 underline-offset-4 hover:underline bg-transparent shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 rounded-full px-4 text-sm",
        lg: "h-14 rounded-full px-8 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
