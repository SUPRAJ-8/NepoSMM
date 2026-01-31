"use client"

import { CreditCard, Bitcoin, DollarSign, Building2, Globe, Banknote, Plus, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const supportOptions: {
  id: string
  icon: any
  title: string
  content: string
}[] = []

export function SupportOptionsCard() {
  if (supportOptions.length === 0) return null;

  return (
    <Card className="border-border bg-card h-fit">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold">Support Options</h2>
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-2">
        <Accordion type="single" collapsible className="w-full">
          {supportOptions.map((option) => (
            <AccordionItem key={option.id} value={option.id} className="border-border">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-secondary/50 rounded-lg transition-colors [&[data-state=open]]:bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <option.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{option.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pl-12 text-sm text-muted-foreground leading-relaxed">
                  {option.content}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
