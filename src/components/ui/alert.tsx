import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-yellow-500/50 text-yellow-800 bg-yellow-50 dark:border-yellow-500 dark:text-yellow-200 dark:bg-yellow-950/20 [&>svg]:text-yellow-600",
        success:
          "border-green-500/50 text-green-800 bg-green-50 dark:border-green-500 dark:text-green-200 dark:bg-green-950/20 [&>svg]:text-green-600",
        info:
          "border-blue-500/50 text-blue-800 bg-blue-50 dark:border-blue-500 dark:text-blue-200 dark:bg-blue-950/20 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
