import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface FlagCardProps {
  flag: Doc<"flags">
}

export function FlagCard({ flag }: FlagCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="aspect-square relative flex items-center justify-center p-6 bg-muted/10 border-b">
        <div className="relative w-full h-full flex items-center justify-center"> 
             <Image 
              src={flag.imagePath} 
              alt={flag.name}
              fill
              className="object-contain drop-shadow-sm"
              unoptimized
            />
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-semibold leading-tight">{flag.name}</CardTitle>
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
  )
}
