"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Ruler, Check, X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteFarm } from "@/actions/farm-actions"

interface FarmCardProps {
  farm: {
    id: string
    name: string
    size: number
    size_units: string
    location: string
    start_date: string
    photo?: string
    number_of_harvests?: number
    uses_fertilizer?: boolean
    uses_machinery?: boolean
    uses_irrigation?: boolean
  }
  onDelete?: () => void
}

export function FarmCard({ farm, onDelete }: FarmCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const formattedDate = farm.start_date ? format(new Date(farm.start_date), "MMM d, yyyy") : "Not specified"

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteFarm(farm.id)

      if (result.success) {
        toast({
          title: "Farm deleted",
          description: `${farm.name} has been successfully deleted.`,
        })

        // Refresh the page or call the onDelete callback
        if (onDelete) {
          onDelete()
        } else {
          router.refresh()
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting farm:", error)
      toast({
        title: "Error",
        description: `Failed to delete farm: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full relative bg-muted">
        {farm.photo && !imageError ? (
          <img
            src={farm.photo || "/placeholder.svg"}
            alt={farm.name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{farm.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {farm.location}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this farm?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your farm and all associated production
                  records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span>
              {farm.size} {farm.size_units}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 border rounded-md">
            <span className="text-xs text-muted-foreground mb-1">Fertilizer</span>
            {farm.uses_fertilizer ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex flex-col items-center p-2 border rounded-md">
            <span className="text-xs text-muted-foreground mb-1">Machinery</span>
            {farm.uses_machinery ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex flex-col items-center p-2 border rounded-md">
            <span className="text-xs text-muted-foreground mb-1">Irrigation</span>
            {farm.uses_irrigation ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        {farm.number_of_harvests !== null && farm.number_of_harvests !== undefined && (
          <Badge variant="outline" className="mt-2">
            {farm.number_of_harvests} {farm.number_of_harvests === 1 ? "Harvest" : "Harvests"}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/farmer/farms/${farm.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
