"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, maxRows, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !maxRows) return

    const adjustHeight = () => {
      textarea.style.height = "auto"
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight)
      const paddingTop = Number.parseInt(getComputedStyle(textarea).paddingTop)
      const paddingBottom = Number.parseInt(getComputedStyle(textarea).paddingBottom)
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom

      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`

      // Add overflow if content exceeds max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto"
      } else {
        textarea.style.overflowY = "hidden"
      }
    }

    textarea.addEventListener("input", adjustHeight)
    adjustHeight() // Initial adjustment

    return () => {
      textarea.removeEventListener("input", adjustHeight)
    }
  }, [maxRows])

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={textareaRef}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
