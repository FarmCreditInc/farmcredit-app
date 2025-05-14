interface LoadingPaneProps {
  message?: string
}

export function LoadingPane({ message = "Loading..." }: LoadingPaneProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-12 h-12 rounded-full border-4 border-t-green-500 border-r-green-500 border-b-green-200 border-l-green-200 animate-spin mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

// Add default export to support both import styles
export default LoadingPane
