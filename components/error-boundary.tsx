"use client"

import type React from "react"

import { useEffect } from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  useEffect(() => {
    // This is a client-side only component
    // We're using it as a wrapper for server components
    // to provide a fallback UI when server components fail
  }, [])

  return <>{children}</>
}
