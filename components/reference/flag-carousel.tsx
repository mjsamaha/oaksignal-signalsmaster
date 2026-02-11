"use client"

import * as React from "react"
import Image from "next/image"
import { Doc } from "@/convex/_generated/dataModel"
import { Swiper as SwiperType } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Keyboard, A11y, Autoplay, EffectCoverflow } from "swiper/modules"
import { Shuffle, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"

interface FlagCarouselProps {
  flags: Doc<"flags">[]
}

export function FlagCarousel({ flags: initialFlags }: FlagCarouselProps) {
  const [activeFlags, setActiveFlags] = React.useState(initialFlags)
  const [isAutoplay, setIsAutoplay] = React.useState(false)
  const swiperRef = React.useRef<{ swiper: SwiperType } | null>(null)

  // Update internal state when props change
  React.useEffect(() => {
    setActiveFlags(initialFlags)
  }, [initialFlags])

  const handleShuffle = () => {
    const shuffled = [...activeFlags].sort(() => Math.random() - 0.5)
    setActiveFlags(shuffled)
    // Reset to first slide to avoid confusion
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(0)
    }
  }

  const toggleAutoplay = () => {
    if (!swiperRef.current?.swiper) return
    
    if (isAutoplay) {
      swiperRef.current.swiper.autoplay.stop()
    } else {
      swiperRef.current.swiper.autoplay.start()
    }
    setIsAutoplay(!isAutoplay)
  }

  if (activeFlags.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No flags found in this category.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-muted-foreground font-medium">
            {activeFlags.length} Flags
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoplay}
            className="gap-2"
            title="Toggle Autoplay"
          >
            {isAutoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="hidden sm:inline">{isAutoplay ? "Pause" : "Auto"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="gap-2"
            title="Shuffle Flags"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Shuffle</span>
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group">
        <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Keyboard, A11y, Autoplay, EffectCoverflow]}
            spaceBetween={30}
            slidesPerView={1}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
            }}
            keyboard={{
                enabled: true,
            }}
            pagination={{
                clickable: true,
                dynamicBullets: true,
            }}
            navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
            }}
            autoplay={{
                delay: 3000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
            }}
            breakpoints={{
                640: {
                    slidesPerView: 1.5,
                },
                1024: {
                    slidesPerView: 2,
                },
            }}
            onAutoplayStart={() => setIsAutoplay(true)}
            onAutoplayStop={() => setIsAutoplay(false)}
            className="w-full py-8"
            style={{ overflow: 'visible' }}
        >
          {activeFlags.map((flag) => (
            <SwiperSlide key={flag._id} className="h-auto">
              <div className="h-full flex justify-center">
                  <Card className="w-full max-w-sm overflow-hidden border-2 shadow-lg h-full flex flex-col">
                    <div className="aspect-square relative bg-muted/10 p-8 border-b">
                      <Image
                        src={flag.imagePath}
                        alt={flag.name}
                        fill
                        className="object-contain drop-shadow-md"
                        // Optimize loading for the first few slides
                        priority={activeFlags.indexOf(flag) < 2}
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-6 text-center space-y-4 flex-1 flex flex-col justify-center">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">{flag.name}</h3>
                        {flag.phonetic && (
                            <Badge variant="secondary" className="font-mono text-xs">
                                {flag.phonetic}
                            </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Meaning</div>
                        <p className="font-medium text-lg leading-snug">{flag.meaning}</p>
                      </div>

                      {flag.tips && (
                          <div className="pt-2 mt-auto">&quot;{flag.tips}&quot;
                             <p className="text-sm text-muted-foreground italic">&quot;{flag.tips}&quot;</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 md:-ml-12 w-10 h-10 bg-background/80 hover:bg-background border rounded-full shadow-md flex items-center justify-center transition-all disabled:opacity-0">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous flag</span>
        </button>
        <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 md:-mr-12 w-10 h-10 bg-background/80 hover:bg-background border rounded-full shadow-md flex items-center justify-center transition-all disabled:opacity-0">
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next flag</span>
        </button>
      </div>
      
      {/* Keyboard Instructions */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        <span className="hidden sm:inline">Use arrow keys to navigate • </span>Swipe to browse
      </div>
    </div>
  )
}
