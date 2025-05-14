"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

import { type UserSession, signOut } from "@/actions/auth-actions"

interface AuthContextType {
  user: UserSession | null
  isLoading: boolean
  signOut: () => Promise<{ success: boolean; redirectUrl?: string; error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => ({ success: false }),
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for session cookie
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        const sessionToken = cookies["session"]

        if (sessionToken) {
          try {
            // Decode JWT token
            const decodedToken = jwtDecode<UserSession & { exp?: number }>(sessionToken)

            // Check if token is expired
            const currentTime = Date.now() / 1000
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              console.log("Session expired")
              setUser(null)
            } else if (!decodedToken.role) {
              console.log("Token missing role")
              setUser(null)
            } else {
              console.log("Valid session found:", decodedToken.role)
              setUser({
                id: decodedToken.id,
                email: decodedToken.email,
                role: decodedToken.role,
                name: decodedToken.name,
              })
            }
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError)
            setUser(null)
          }
        } else {
          console.log("No session token found")
          setUser(null)
        }
      } catch (error) {
        console.error("Auth error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      setUser(null)
      return result
    } catch (error) {
      console.error("Sign out error:", error)
      return { success: false, error: String(error) }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
