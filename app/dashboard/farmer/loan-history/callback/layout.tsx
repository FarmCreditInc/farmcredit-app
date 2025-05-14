import type React from "react"
export default function CallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-12">{children}</main>
    </div>
  )
}
