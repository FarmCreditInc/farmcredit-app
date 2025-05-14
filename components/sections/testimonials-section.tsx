"use client"

import { Star } from "lucide-react"
import { useEffect, useState } from "react"

export function TestimonialsSection() {
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    // Mark images as loaded when component mounts on client
    setImagesLoaded(true)
  }, [])

  const testimonials = [
    {
      quote:
        "This platform helped me secure my first agricultural loan. The credit scoring system is transparent and the application process was straightforward.",
      author: "Adebayo Ogunlesi",
      role: "Cassava Farmer, Oyo State",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=100&h=100&auto=format&fit=crop",
    },
    {
      quote:
        "As a young female farmer, I struggled to get financing. FarmCredit's platform gave me the opportunity to build my credit profile and access the funds I needed.",
      author: "Amina Ibrahim",
      role: "Poultry Farmer, Kaduna State",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&h=100&auto=format&fit=crop",
    },
    {
      quote:
        "The educational resources helped me improve my farming practices, which increased my credit score. I've now received two loans through the platform.",
      author: "Chukwudi Okafor",
      role: "Rice Farmer, Enugu State",
      rating: 4,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Success Stories from Nigerian Farmers
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from farmers who have transformed their agricultural businesses with our platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {imagesLoaded && (
                    <img
                      src={testimonial.imageUrl || "/placeholder.svg"}
                      alt={testimonial.author}
                      className="object-cover w-full h-full"
                      width={48}
                      height={48}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=random&color=fff&size=48`
                      }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
