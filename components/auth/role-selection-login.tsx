"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TractorIcon as Farmer, Building2, ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type Role = "farmer" | "lender" | "admin"

export function RoleSelectionLogin() {
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null)
  const router = useRouter()

  const handleRoleSelect = (role: Role) => {
    router.push(`/auth/login/${role}`)
  }

  const roles = [
    {
      id: "farmer",
      title: "I am a Farmer",
      description: "Access your farm profile, loan applications, and resources",
      icon: Farmer,
      color: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
      hoverBorderColor: "border-green-500",
    },
    {
      id: "lender",
      title: "I am a Lender",
      description: "Manage loan offerings, review applications, and track investments",
      icon: Building2,
      color: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverBorderColor: "border-blue-500",
    },
    {
      id: "admin",
      title: "I am an Admin",
      description: "Access administrative controls and manage platform users",
      icon: ShieldCheck,
      color: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverBorderColor: "border-purple-500",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {roles.map((role) => (
        <motion.div
          key={role.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={`cursor-pointer transition-all duration-300 border-2 h-full ${
              hoveredRole === role.id ? role.hoverBorderColor : role.borderColor
            }`}
            onMouseEnter={() => setHoveredRole(role.id as Role)}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleRoleSelect(role.id as Role)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-full ${role.color} mb-4`}>
                <role.icon className={`h-8 w-8 ${role.textColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
              <p className="text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
