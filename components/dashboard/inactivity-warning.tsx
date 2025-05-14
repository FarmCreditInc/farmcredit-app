"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InactivityWarningProps {
  isOpen: boolean
  onStayLoggedIn: () => void
  onLogout: () => void
  remainingTime: number
}

export function InactivityWarning({ isOpen, onStayLoggedIn, onLogout, remainingTime }: InactivityWarningProps) {
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (isOpen) {
      const mins = Math.floor(remainingTime / 60000)
      const secs = Math.floor((remainingTime % 60000) / 1000)
      setMinutes(mins)
      setSeconds(secs)

      const timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                clearInterval(timer)
                return 0
              }
              return prevMinutes - 1
            })
            return 59
          }
          return prevSeconds - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen, remainingTime])

  return (
    <Dialog open={isOpen} onOpenChange={() => onStayLoggedIn()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire in {minutes}:{seconds < 10 ? `0${seconds}` : seconds} due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            For security reasons, you will be automatically logged out if you remain inactive. Would you like to stay
            logged in?
          </p>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onLogout}>
            Logout Now
          </Button>
          <Button onClick={onStayLoggedIn}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
