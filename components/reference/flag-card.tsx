import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

import Link from "next/link"
// This component used in the flags index page and the flag detail page. It displays a card with the flag's image, name, and phonetic (if available). It also has a badge for special pennants and substitutes.
interface FlagCardProps {
  flag: Doc<"flags">
}

export function FlagCard({ flag }: FlagCardProps) {
  return (
    <Link href={`/dashboard/reference/flags/${flag.key}`} className="block h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className="overflow-hidden hover:shadow-md hover:border-primary/50 transition-all h-full flex flex-col group">
        <div className="aspect-square relative flex items-center justify-center p-6 bg-muted/10 border-b group-hover:bg-muted/20 transition-colors">
          <div className="relative w-full h-full flex items-center justify-center"> 
               <Image 
                src={flag.imagePath} 
                alt={flag.name}
                fill
                className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
          </div>
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">{flag.name}</CardTitle>
              {(flag.type === 'special-pennant' || flag.type === 'substitute') && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Special</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 mt-auto">
          {flag.phonetic && (
            <p className="text-sm text-muted-foreground font-mono">
              {flag.phonetic}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
