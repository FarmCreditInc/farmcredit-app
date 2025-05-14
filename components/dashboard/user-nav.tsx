"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase-browser"

interface UserNavProps {
  user?: {
    id?: string
    email?: string
    name?: string
    profileUrl?: string
    role?: string
  }
  // For backward compatibility
  name?: string
  email?: string
  imageUrl?: string
}

export function UserNav({ user, name, email, imageUrl }: UserNavProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Use either the user object or the individual props
  const userName = user?.name || name || ""
  const userEmail = user?.email || email || ""
  const userProfileUrl = user?.profileUrl || imageUrl || null
  const userRole = user?.role || "Farmer"

  // Fetch profile image if available
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (userProfileUrl) {
        try {
          // If it's already a full URL, use it directly
          if (userProfileUrl.startsWith("http")) {
            setProfileUrl(userProfileUrl)
            return
          }

          // Otherwise, get a signed URL from Supabase storage
          const { data } = await supabase.storage.from("profile-images").createSignedUrl(userProfileUrl, 3600)

          if (data?.signedUrl) {
            setProfileUrl(data.signedUrl)
          }
        } catch (error) {
          console.error("Error fetching profile image:", error)
        }
      }
    }

    fetchProfileImage()
  }, [userProfileUrl, supabase])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Show toast notification
      toast({
        title: "Signing out...",
        description: "You are being logged out of your account",
      })

      // Sign out using Supabase client
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Also call the API endpoint to clear server-side session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Redirect to login page
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)

      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      })

      setIsSigningOut(false)
    }
  }

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!userName) return userEmail?.charAt(0).toUpperCase() || "U"

    return userName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  // Placeholder URL for when we don't have a profile image
  const placeholderUrl = `/placeholder.svg?height=36&width=36&query=${userName || userEmail}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={profileUrl || placeholderUrl}
              alt={userName || userEmail || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-green-100 text-green-800">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userName || userEmail}</p>
            <p className="text-sm text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/farmer/settings">Settings</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard/farmer/notifications">Notifications</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard/farmer/support">Help & Support</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
