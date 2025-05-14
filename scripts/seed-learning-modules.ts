import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const learningModules = [
  {
    title: "Building Creditworthiness",
    description: "Learn how to build and maintain good credit as a farmer to increase your chances of loan approval.",
    content_url: "/learning/building-creditworthiness",
    thumbnail_url: "/placeholder.svg?key=j1mqq",
    category: "finance",
    duration: 15,
  },
  {
    title: "Sustainable Post-Harvest Practices",
    description: "Discover techniques to reduce post-harvest losses and maximize your crop value.",
    content_url: "/learning/post-harvest-practices",
    thumbnail_url: "/placeholder.svg?key=r4to3",
    category: "farming",
    duration: 20,
  },
  {
    title: "Scaling Your Agri-Business",
    description: "Strategies for growing your farming operation from small-scale to commercial.",
    content_url: "/learning/scaling-agribusiness",
    thumbnail_url: "/placeholder.svg?key=n7r8c",
    category: "business",
    duration: 25,
  },
  {
    title: "Understanding Loan Terms",
    description: "A guide to understanding the common terms and conditions in agricultural loans.",
    content_url: "/learning/loan-terms",
    thumbnail_url: "/placeholder.svg?key=i759z",
    category: "finance",
    duration: 10,
  },
  {
    title: "Climate-Smart Farming Techniques",
    description: "Learn farming methods that are resilient to climate change and environmentally sustainable.",
    content_url: "/learning/climate-smart-farming",
    thumbnail_url: "/placeholder.svg?key=dlde1",
    category: "farming",
    duration: 30,
  },
  {
    title: "Digital Marketing for Farmers",
    description: "How to use social media and digital platforms to market your farm products.",
    content_url: "/learning/digital-marketing",
    thumbnail_url: "/placeholder.svg?height=200&width=300&query=farmer using smartphone for business",
    category: "business",
    duration: 20,
  },
]

async function seedLearningModules() {
  try {
    const { data, error } = await supabase.from("learning_modules").insert(learningModules)

    if (error) {
      console.error("Error seeding learning modules:", error)
      return
    }

    console.log("Successfully seeded learning modules")
  } catch (error) {
    console.error("Error:", error)
  }
}

seedLearningModules()
