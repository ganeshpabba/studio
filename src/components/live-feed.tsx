"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Video, Maximize } from 'lucide-react'
import { placeholderImages } from '@/lib/placeholder-images'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const cameras = [
  { id: 'cam-01', name: 'Main Entrance', placeholder: placeholderImages['live-feed-1'] },
  { id: 'cam-02', name: 'Warehouse', placeholder: placeholderImages['live-feed-2'] },
  { id: 'cam-03', name: 'Parking Lot', placeholder: placeholderImages['live-feed-3'] },
]

export function LiveFeed() {
  const [mainFeed, setMainFeed] = useState(cameras[0])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
             <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">{mainFeed.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <span className="text-sm font-semibold text-white [text-shadow:0_2px_4px_var(--tw-shadow-color)]">REC</span>
                </div>
            </div>
            <Image
              src={mainFeed.placeholder.imageUrl}
              alt={`Live feed from ${mainFeed.name}`}
              width={1280}
              height={720}
              className="aspect-video w-full object-cover"
              data-ai-hint={mainFeed.placeholder.imageHint}
              priority
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Camera /> All Feeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {cameras.map((cam) => (
            <Card
              key={cam.id}
              className={cn(
                'overflow-hidden cursor-pointer transition-all hover:shadow-primary/50 hover:shadow-lg',
                mainFeed.id === cam.id ? 'ring-2 ring-primary' : 'ring-1 ring-transparent'
              )}
              onClick={() => setMainFeed(cam)}
            >
              <CardContent className="p-0 relative">
                <Image
                  src={cam.placeholder.imageUrl}
                  alt={cam.name}
                  width={640}
                  height={360}
                  className="aspect-video w-full object-cover"
                  data-ai-hint={cam.placeholder.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white">
                  <h4 className="font-semibold">{cam.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Online</span>
                  </div>
                </div>
                {mainFeed.id !== cam.id && (
                  <div className="absolute top-2 right-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/20 hover:bg-black/50 text-white rounded-full">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
