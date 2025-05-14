import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "All FAQs | Help Center | FarmCredit",
  description: "Comprehensive list of frequently asked questions about FarmCredit",
}

export default function AllFAQsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <Link href="/help-center">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to Help Center
                </Button>
              </Link>
              <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground">Find answers to the most common questions about FarmCredit</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="farmers">For Farmers</TabsTrigger>
                <TabsTrigger value="lenders">For Lenders</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit is a platform that connects Nigerian youth farmers with lenders to provide access to
                      finance through innovative credit scoring and loan facilitation. We aim to bridge the gap between
                      agricultural potential and financial resources.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does FarmCredit work?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit works by allowing farmers to create profiles, submit their farming details and
                      financial needs. Our platform evaluates farmers using a proprietary credit scoring system. Lenders
                      can browse verified farmer profiles and choose to fund projects that align with their investment
                      goals.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is my information secure on FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we take security very seriously. All personal and financial information is encrypted and
                      stored securely. We comply with data protection regulations and never share your information with
                      unauthorized third parties.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>How long does the application process take?</AccordionTrigger>
                    <AccordionContent>
                      The initial application takes about 15-20 minutes to complete. After submission, our team reviews
                      applications within 1-3 business days. The entire process from application to funding can take
                      anywhere from 1-2 weeks, depending on the completeness of your application and verification
                      requirements.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>What makes FarmCredit different from traditional banks?</AccordionTrigger>
                    <AccordionContent>
                      Unlike traditional banks, FarmCredit is specifically designed for agricultural financing. We
                      understand the unique challenges and cycles of farming, offer more flexible terms, use alternative
                      credit scoring methods that consider agricultural factors, and connect farmers directly with
                      interested lenders, often resulting in better rates and terms.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>What types of farms does FarmCredit support?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit supports a wide range of agricultural operations including crop farming (grains,
                      vegetables, fruits), livestock farming (poultry, cattle, fish), and specialty farming (herbs,
                      flowers, organic produce). We evaluate each farm based on its specific needs and potential,
                      regardless of size or type.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>Is FarmCredit available throughout Nigeria?</AccordionTrigger>
                    <AccordionContent>
                      Yes, FarmCredit is available to farmers across all states in Nigeria. Our digital platform allows
                      us to serve farmers regardless of their location. However, for physical verification purposes,
                      processing times may vary slightly depending on your location.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>How does FarmCredit make money?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit generates revenue through a small service fee on funded loans, premium membership
                      options for lenders seeking additional features, and partnerships with agricultural input
                      providers. Our fee structure is transparent and designed to keep costs low for farmers while
                      maintaining a sustainable platform.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="farmers">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Who can apply as a farmer on FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      Nigerian youth farmers between the ages of 18-45 who own or operate a farm can apply. You'll need
                      to provide proof of identity, farming activities, and basic financial information to complete your
                      profile.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>What types of loans can I apply for?</AccordionTrigger>
                    <AccordionContent>
                      Farmers can apply for various types of loans including working capital for seeds and fertilizers,
                      equipment financing, infrastructure development, expansion capital, and seasonal financing aligned
                      with harvest cycles.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>What documents do I need to provide?</AccordionTrigger>
                    <AccordionContent>
                      Required documents typically include government-issued ID, proof of farm ownership or lease
                      agreement, photos of your farm, records of previous harvests if available, basic financial
                      statements or records, and a business plan or description of what the loan will fund.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>How is my credit score calculated?</AccordionTrigger>
                    <AccordionContent>
                      Our proprietary credit scoring system considers traditional factors like payment history and
                      existing debt, but also agricultural factors such as crop types, farming experience, land quality,
                      previous harvest yields, and market potential for your products.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>What happens if I can't repay my loan on time?</AccordionTrigger>
                    <AccordionContent>
                      We understand that agricultural businesses can face unexpected challenges. If you anticipate
                      difficulty making a payment, contact us immediately. We can work with you to restructure payments
                      or find solutions based on your specific situation. However, consistent late payments may affect
                      your ability to secure future financing.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>Can I apply for multiple loans at once?</AccordionTrigger>
                    <AccordionContent>
                      While you can have multiple active loan applications, we generally recommend focusing on one loan
                      at a time, especially for new users. This allows you to establish a positive repayment history
                      before taking on additional financing. However, established farmers with good repayment records
                      may qualify for multiple loan products simultaneously.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>How quickly can I receive funds after approval?</AccordionTrigger>
                    <AccordionContent>
                      Once your loan is approved and matched with lenders, funds are typically disbursed within 2-3
                      business days. The exact timing depends on your banking details being accurate and complete. We
                      recommend setting up and verifying your bank account information as soon as you create your
                      profile to avoid delays.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>Do you offer training or support for farmers?</AccordionTrigger>
                    <AccordionContent>
                      Yes, FarmCredit provides access to educational resources, webinars, and in-person training
                      sessions on agricultural best practices, financial management, and business development. We also
                      connect farmers with agricultural experts who can provide guidance specific to your farming
                      operation. These resources are available through our Education Hub section.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="lenders">
                <Accordion type="single" collapsible className="w-full">
                  {/* Lender FAQs content similar to above */}
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Who can become a lender on FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      Individuals, organizations, financial institutions, and impact investors interested in supporting
                      Nigerian agriculture can become lenders. You'll need to complete our verification process, which
                      includes identity verification and compliance with financial regulations.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I choose which farmers to fund?</AccordionTrigger>
                    <AccordionContent>
                      Lenders can browse verified farmer profiles that include details about their farm, business plan,
                      credit score, requested loan amount, and projected returns. You can filter farmers by location,
                      crop type, loan amount, risk level, and other criteria to find opportunities that match your
                      investment goals.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>What returns can I expect as a lender?</AccordionTrigger>
                    <AccordionContent>
                      Returns vary based on the risk profile of the farmers you choose to fund. Typically, lenders can
                      expect annual returns ranging from 8-15%, which is competitive with other investment opportunities
                      while also creating positive social impact.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>How is my investment protected?</AccordionTrigger>
                    <AccordionContent>
                      We implement several safeguards including thorough farmer verification, credit scoring, monitoring
                      of funded projects, diversification options to spread risk across multiple farmers, and structured
                      repayment plans aligned with harvest cycles. While all investments carry risk, our system is
                      designed to minimize default rates.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="technical">
                <Accordion type="single" collapsible className="w-full">
                  {/* Technical FAQs */}
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is the FarmCredit platform mobile-friendly?</AccordionTrigger>
                    <AccordionContent>
                      Yes, the FarmCredit platform is fully responsive and works on smartphones, tablets, and desktop
                      computers. We've optimized the experience for mobile users, knowing that many farmers and lenders
                      prefer to access our services via mobile devices. All features are available across all devices.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>What browsers are supported by FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit supports all modern browsers including Chrome, Firefox, Safari, and Edge. For the best
                      experience, we recommend using the latest version of these browsers. Internet Explorer is not
                      fully supported due to its limited capabilities with modern web technologies.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                    <AccordionContent>
                      To reset your password, click on the "Forgot Password" link on the login page. Enter the email
                      address associated with your account, and we'll send you a password reset link. Click the link in
                      the email and follow the instructions to create a new password. For security reasons, password
                      reset links expire after 24 hours.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>What payment methods are accepted on FarmCredit?</AccordionTrigger>
                    <AccordionContent>
                      FarmCredit supports various payment methods including bank transfers, debit cards, and select
                      mobile payment solutions popular in Nigeria. For lenders funding accounts, we accept major debit
                      cards and bank transfers. For farmers receiving funds, disbursements are made directly to verified
                      bank accounts.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
