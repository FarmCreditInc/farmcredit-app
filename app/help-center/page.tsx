import type { Metadata } from "next"
import HelpCenterClientPage from "./HelpCenterClientPage"

export const metadata: Metadata = {
  title: "Help Center | FarmCredit",
  description: "Get help and support for all your FarmCredit needs",
}

export default function HelpCenterPage() {
  return <HelpCenterClientPage />
}
