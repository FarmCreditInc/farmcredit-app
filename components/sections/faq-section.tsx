"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "Who is eligible to register on the platform?",
      answer:
        "Nigerian youth farmers between the ages of 18-35 who own or operate agricultural businesses are eligible to register. You'll need basic personal information, details about your farm, and some financial history.",
    },
    {
      question: "How is my credit score calculated?",
      answer:
        "Your credit score is calculated based on multiple factors including your farm size, crop types, years of experience, past loan history, income estimates, farming practices, and membership in cooperatives. The scoring system is transparent, and you'll receive a breakdown of factors affecting your score.",
    },
    {
      question: "What types of loans are available?",
      answer:
        "The platform offers various types of agricultural loans including working capital loans for inputs (seeds, fertilizers), equipment financing, expansion loans, and emergency funds. Loan amounts, interest rates, and terms vary based on your credit score and specific needs.",
    },
    {
      question: "How long does the loan approval process take?",
      answer:
        "Once you submit a complete application, the initial assessment typically takes 3-5 business days. If approved, fund disbursement can take an additional 2-3 business days depending on the financial institution and your banking details.",
    },
    {
      question: "What happens if I can't repay my loan on time?",
      answer:
        "We understand that agricultural businesses face unique challenges. If you anticipate difficulty making a payment, contact us immediately. We can work with you to restructure your repayment plan. However, consistent late payments or defaults will negatively impact your credit score.",
    },
    {
      question: "How can I improve my credit score?",
      answer:
        "You can improve your score by: joining a registered cooperative, adopting modern farming practices, maintaining accurate records of your farm activities and finances, building a positive repayment history with smaller loans, and completing educational modules on our platform.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-green-50 dark:bg-green-950/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about our platform and services.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
