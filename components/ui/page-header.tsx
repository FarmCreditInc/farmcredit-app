import type React from "react"

interface PageHeaderProps {
  heading: string
  subheading?: string
  children?: React.ReactNode
}

export function PageHeader({ heading, subheading, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {subheading && <p className="text-muted-foreground mt-1">{subheading}</p>}
      </div>
      {children}
    </div>
  )
}
