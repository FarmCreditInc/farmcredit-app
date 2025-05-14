import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ThumbsUp, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would typically come from a database or CMS
const guidesData = {
  "cassava-farming": {
    title: "Cassava Farming: Complete Guide",
    description: "Learn how to grow cassava efficiently with this comprehensive guide for Nigerian farmers.",
    image: "/placeholder.svg?key=yho4h",
    category: "Crop Farming",
    readTime: "15 min read",
    date: "May 10, 2023",
    author: "Dr. Adebayo Ogunlesi",
    authorRole: "Agricultural Scientist",
    authorImage: "/placeholder.svg?key=sn0h4",
    content: `
      <h2>Introduction to Cassava Farming</h2>
      <p>Cassava (Manihot esculenta) is one of the most important staple food crops grown in Nigeria and across tropical Africa. It's a hardy crop that can withstand harsh growing conditions and provides a reliable source of carbohydrates for millions of people.</p>
      
      <h2>Climate and Soil Requirements</h2>
      <p>Cassava grows best in warm, humid climates with temperatures between 25-29°C. It requires at least 8 months of warm weather to produce a good crop. The plant can survive in poor soils where many other crops would fail, but for optimal yields, well-drained, loamy soils with pH between 5.5 and 6.5 are ideal.</p>
      
      <h2>Land Preparation</h2>
      <p>Proper land preparation is crucial for successful cassava farming:</p>
      <ul>
        <li>Clear the land of vegetation and debris</li>
        <li>Plow to a depth of 20-30cm to loosen the soil</li>
        <li>Create ridges or mounds, especially in areas with heavy rainfall</li>
        <li>Apply organic matter or fertilizer if the soil is very poor</li>
      </ul>
      
      <h2>Planting Materials and Methods</h2>
      <p>Cassava is propagated using stem cuttings (stakes):</p>
      <ul>
        <li>Select mature, pest-free stems from plants 8-12 months old</li>
        <li>Cut stems into 20-25cm pieces with at least 5-7 nodes</li>
        <li>Plant stakes at a 45° angle with 2/3 of the stake below ground</li>
        <li>Space plants 1m apart with 1m between rows</li>
        <li>Plant at the beginning of the rainy season for rainfed farming</li>
      </ul>
      
      <h2>Weed Management</h2>
      <p>Weed control is critical during the first 3-4 months after planting:</p>
      <ul>
        <li>Manual weeding 2-3 times during the growing season</li>
        <li>Use of cover crops to suppress weeds</li>
        <li>Herbicides can be used but require proper knowledge and application</li>
      </ul>
      
      <h2>Pest and Disease Management</h2>
      <p>Common pests and diseases affecting cassava in Nigeria include:</p>
      <ul>
        <li>Cassava Mosaic Disease (CMD) - Use resistant varieties</li>
        <li>Cassava Bacterial Blight (CBB) - Practice crop rotation</li>
        <li>Cassava Mealybug - Biological control with natural predators</li>
        <li>Cassava Green Mite - Use resistant varieties and natural predators</li>
      </ul>
      
      <h2>Harvesting</h2>
      <p>Cassava can be harvested 8-18 months after planting, depending on the variety and intended use:</p>
      <ul>
        <li>Early maturing varieties can be harvested after 8-10 months</li>
        <li>Late maturing varieties are harvested after 12-18 months</li>
        <li>Cut off the stem about 30cm from the ground before uprooting</li>
        <li>Carefully dig around the plant to extract the tubers without damage</li>
      </ul>
      
      <h2>Post-Harvest Handling</h2>
      <p>Cassava tubers deteriorate rapidly after harvest:</p>
      <ul>
        <li>Process within 24-48 hours of harvesting</li>
        <li>For short-term storage, keep tubers in cool, shaded areas</li>
        <li>Process into dried chips, flour, or gari for longer storage</li>
      </ul>
      
      <h2>Marketing and Value Addition</h2>
      <p>To maximize profits from cassava farming:</p>
      <ul>
        <li>Process into value-added products like gari, fufu, or starch</li>
        <li>Form or join farmer cooperatives for better market access</li>
        <li>Explore industrial markets for cassava starch and flour</li>
        <li>Consider organic certification for premium markets</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Cassava farming offers a reliable income source for Nigerian farmers when proper techniques are applied. By selecting improved varieties, implementing good agronomic practices, and exploring value addition opportunities, farmers can significantly increase their yields and profits from this versatile crop.</p>
    `,
    relatedGuides: ["rice-cultivation", "poultry-management"],
  },
  "poultry-management": {
    title: "Poultry Management for Beginners",
    description: "Start your poultry farming business with this step-by-step guide for beginners.",
    image: "/placeholder.svg?key=ox1ix",
    category: "Livestock",
    readTime: "12 min read",
    date: "June 5, 2023",
    author: "Mrs. Folake Adeyemi",
    authorRole: "Poultry Specialist",
    authorImage: "/placeholder.svg?height=100&width=100&query=nigerian%20poultry%20specialist",
    content: `
      <h2>Introduction to Poultry Farming</h2>
      <p>Poultry farming is one of the most accessible and profitable agricultural ventures in Nigeria. It involves raising domesticated birds such as chickens, turkeys, ducks, and guinea fowls for meat and eggs. This guide focuses primarily on chicken farming, which is the most common type of poultry farming in Nigeria.</p>
      
      <h2>Getting Started: Housing</h2>
      <p>Proper housing is crucial for successful poultry farming:</p>
      <ul>
        <li>Location: Choose a quiet area with good drainage and ventilation</li>
        <li>Space requirements: Allow 2-3 square feet per bird for layers and 1-2 square feet for broilers</li>
        <li>Ventilation: Ensure good airflow while protecting birds from drafts</li>
        <li>Flooring: Use concrete floors with litter material (wood shavings or rice husks)</li>
        <li>Lighting: Provide 16-18 hours of light daily for layers</li>
      </ul>
      
      <h2>Choosing the Right Birds</h2>
      <p>Select the type of poultry farming based on your goals:</p>
      <ul>
        <li>Broilers: Fast-growing birds raised for meat (6-8 weeks to market)</li>
        <li>Layers: Hens raised for egg production (18-24 months of productive life)</li>
        <li>Dual-purpose breeds: Birds raised for both meat and eggs</li>
        <li>Day-old chicks: Purchase from reputable hatcheries with vaccination records</li>
      </ul>
      
      <h2>Feeding Management</h2>
      <p>Proper nutrition is essential for growth and productivity:</p>
      <ul>
        <li>Starter feed: 0-8 weeks (20-22% protein for layers, 22-24% for broilers)</li>
        <li>Grower feed: 8-18 weeks (16-18% protein)</li>
        <li>Layer feed: 18+ weeks (16-18% protein with added calcium)</li>
        <li>Broiler finisher: 4-8 weeks (18-20% protein)</li>
        <li>Clean, fresh water must be available at all times</li>
      </ul>
      
      <h2>Health Management</h2>
      <p>Disease prevention is more effective than treatment:</p>
      <ul>
        <li>Vaccination: Follow a strict vaccination schedule for Newcastle disease, Infectious Bursal Disease (Gumboro), and other common diseases</li>
        <li>Biosecurity: Restrict visitors, use footbaths, quarantine new birds</li>
        <li>Sanitation: Regular cleaning and disinfection of the poultry house</li>
        <li>Monitoring: Daily observation of birds for signs of illness</li>
      </ul>
      
      <h2>Record Keeping</h2>
      <p>Maintain detailed records of:</p>
      <ul>
        <li>Feed consumption and costs</li>
        <li>Egg production or weight gain</li>
        <li>Mortality rates</li>
        <li>Vaccination and medication schedules</li>
        <li>Income and expenses</li>
      </ul>
      
      <h2>Marketing Strategies</h2>
      <p>Develop effective marketing channels:</p>
      <ul>
        <li>Direct sales to consumers</li>
        <li>Supply to restaurants and hotels</li>
        <li>Sell to retailers and wholesalers</li>
        <li>Online marketing and home delivery services</li>
      </ul>
      
      <h2>Common Challenges and Solutions</h2>
      <p>Be prepared to address these common issues:</p>
      <ul>
        <li>Disease outbreaks: Strict biosecurity and vaccination</li>
        <li>Feed price fluctuations: Bulk purchasing and feed formulation</li>
        <li>Power outages: Backup generators or solar systems</li>
        <li>Market price volatility: Diversify products and markets</li>
        <li>Predators: Secure housing and perimeter fencing</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Poultry farming can be a lucrative business with proper planning and management. Start small, learn continuously, and expand gradually as you gain experience. With dedication and attention to detail, you can build a successful poultry enterprise in Nigeria.</p>
    `,
    relatedGuides: ["cassava-farming", "rice-cultivation"],
  },
  "rice-cultivation": {
    title: "Rice Cultivation Techniques",
    description: "Modern techniques for rice cultivation in Nigerian wetlands and lowlands.",
    image: "/placeholder.svg?height=400&width=800&query=rice%20farming%20in%20nigeria",
    category: "Crop Farming",
    readTime: "18 min read",
    date: "April 22, 2023",
    author: "Ibrahim Musa",
    authorRole: "Rice Farming Expert",
    authorImage: "/placeholder.svg?height=100&width=100&query=nigerian%20rice%20farmer",
    content: `
      <h2>Introduction to Rice Cultivation in Nigeria</h2>
      <p>Rice is a staple food for millions of Nigerians, with consumption steadily increasing. Despite this growing demand, domestic production has not kept pace, creating opportunities for farmers. This guide covers modern techniques for successful rice cultivation in Nigerian conditions.</p>
      
      <h2>Rice Varieties for Nigerian Conditions</h2>
      <p>Selecting the right variety is crucial for success:</p>
      <ul>
        <li>FARO 44 (SIPI): High-yielding, disease-resistant lowland variety</li>
        <li>FARO 52 (WITA 4): Drought-tolerant variety suitable for upland cultivation</li>
        <li>FARO 60: Short-duration variety with good grain quality</li>
        <li>NERICA varieties: Drought-resistant varieties suitable for upland areas</li>
      </ul>
      
      <h2>Land Preparation</h2>
      <p>Proper land preparation is essential for optimal rice growth:</p>
      <ul>
        <li>Lowland rice: Plow, puddle, and level the field to retain water</li>
        <li>Upland rice: Clear, plow, and harrow the land to create a fine tilth</li>
        <li>Create bunds (raised edges) around lowland fields to control water levels</li>
        <li>Incorporate organic matter 2-3 weeks before planting</li>
      </ul>
      
      <h2>Water Management</h2>
      <p>Rice requires different water management at various growth stages:</p>
      <ul>
        <li>Nursery stage: Keep soil moist but not flooded</li>
        <li>Transplanting: Maintain 2-5cm of water</li>
        <li>Vegetative stage: 5-7cm water depth</li>
        <li>Reproductive stage: 5-10cm water depth</li>
        <li>Ripening: Gradually drain field 2 weeks before harvest</li>
      </ul>
      
      <h2>Planting Methods</h2>
      <p>Two main planting methods are used in Nigeria:</p>
      <ul>
        <li>Direct seeding: Sowing seeds directly in the field</li>
        <ul>
          <li>Broadcast seeding: Scattering seeds evenly across the field</li>
          <li>Drill seeding: Planting seeds in rows using a seed drill</li>
          <li>Seed rate: 60-80kg/hectare</li>
        </ul>
        <li>Transplanting: Growing seedlings in nurseries then transplanting to the field</li>
        <ul>
          <li>Prepare nursery beds 25-30 days before transplanting</li>
          <li>Transplant 21-25 day old seedlings</li>
          <li>Plant 2-3 seedlings per hill at 20cm x 20cm spacing</li>
        </ul>
      </ul>
      
      <h2>Fertilizer Application</h2>
      <p>Rice requires adequate nutrients for optimal yields:</p>
      <ul>
        <li>Basal application: Apply NPK (15-15-15) at 200-250kg/hectare during land preparation</li>
        <li>Top dressing: Apply urea at 100-150kg/hectare in two splits</li>
        <ul>
          <li>First application: 3-4 weeks after transplanting</li>
          <li>Second application: At panicle initiation stage</li>
        </ul>
        <li>Organic fertilizers: Apply well-decomposed manure at 5-10 tons/hectare</li>
      </ul>
      
      <h2>Weed Management</h2>
      <p>Effective weed control is critical for good yields:</p>
      <ul>
        <li>Cultural methods: Proper land preparation, water management, and crop rotation</li>
        <li>Manual weeding: 2-3 times during the growing season</li>
        <li>Chemical control: Pre-emergence and post-emergence herbicides</li>
        <ul>
          <li>Pre-emergence: Butachlor or Oxadiazon</li>
          <li>Post-emergence: Propanil or 2,4-D</li>
        </ul>
      </ul>
      
      <h2>Pest and Disease Management</h2>
      <p>Common rice pests and diseases in Nigeria include:</p>
      <ul>
        <li>African rice gall midge: Use resistant varieties and early planting</li>
        <li>Stem borers: Apply appropriate insecticides and practice field sanitation</li>
        <li>Rice blast: Use resistant varieties and fungicides</li>
        <li>Bacterial leaf blight: Use resistant varieties and balanced fertilization</li>
      </ul>
      
      <h2>Harvesting and Post-Harvest Handling</h2>
      <p>Proper harvesting and post-harvest handling preserve grain quality:</p>
      <ul>
        <li>Harvest when 80-85% of grains turn golden yellow</li>
        <li>Cut stems 15-20cm above ground level</li>
        <li>Thresh immediately after harvesting</li>
        <li>Dry grains to 12-14% moisture content</li>
        <li>Clean and sort grains before storage</li>
        <li>Store in clean, dry, and pest-free containers or bags</li>
      </ul>
      
      <h2>Value Addition and Marketing</h2>
      <p>Increase profits through value addition:</p>
      <ul>
        <li>Parboiling and milling for higher quality rice</li>
        <li>Packaging in different quantities with proper labeling</li>
        <li>Direct marketing to consumers or retailers</li>
        <li>Joining farmer cooperatives for better market access</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Rice cultivation can be profitable in Nigeria with proper techniques and management. By adopting improved varieties and modern farming practices, farmers can significantly increase their yields and contribute to national food security while earning a good income.</p>
    `,
    relatedGuides: ["cassava-farming", "poultry-management"],
  },
}

export default function GuidePage({ params }: { params: { id: string } }) {
  const guide = guidesData[params.id as keyof typeof guidesData]

  if (!guide) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-20">
          <h1 className="text-3xl font-bold">Guide not found</h1>
          <p className="mt-4">The guide you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link href="/farming-guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4">
              <Button variant="outline" size="sm" className="w-fit" asChild>
                <Link href="/farming-guides">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Guides
                </Link>
              </Button>
              <div className="inline-block">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/20 dark:text-green-300 dark:hover:bg-green-800/30"
                >
                  {guide.category}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{guide.title}</h1>
              <p className="text-xl text-muted-foreground">{guide.description}</p>
              <div className="flex items-center space-x-4 pt-4">
                <Image
                  src={guide.authorImage || "/placeholder.svg"}
                  alt={guide.author}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{guide.author}</p>
                  <p className="text-sm text-muted-foreground">{guide.authorRole}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {guide.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {guide.readTime}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-xl bg-muted">
              <Image src={guide.image || "/placeholder.svg"} alt={guide.title} fill className="object-cover" priority />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div
                  className="prose prose-green max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: guide.content }}
                />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="sticky top-20">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-bold">Share this guide</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                        </Button>
                        <Button variant="outline" size="icon">
                          <Bookmark className="h-4 w-4" />
                          <span className="sr-only">Bookmark</span>
                        </Button>
                        <Button variant="outline" size="icon">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="sr-only">Like</span>
                        </Button>
                      </div>

                      <Separator />

                      <h3 className="text-xl font-bold">Related Guides</h3>
                      <div className="space-y-4">
                        {guide.relatedGuides.map((relatedId) => {
                          const relatedGuide = guidesData[relatedId as keyof typeof guidesData]
                          return (
                            <div key={relatedId} className="flex items-start space-x-4">
                              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                                <Image
                                  src={relatedGuide.image || "/placeholder.svg"}
                                  alt={relatedGuide.title}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium hover:underline">
                                  <Link href={`/farming-guides/${relatedId}`}>{relatedGuide.title}</Link>
                                </h4>
                                <p className="text-sm text-muted-foreground">{relatedGuide.readTime}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Ready to Start Farming?
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get access to more guides, expert advice, and financial support for your farming business.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
                  <Link href="/auth/signup">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
