"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

export function LiveFeed() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-lg font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">
              Live Feed
            </h3>
            {hasCameraPermission && (
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-sm font-semibold text-white [text-shadow:0_2px_4px_var(--tw-shadow-color)]">
                  REC
                </span>
              </div>
            )}
          </div>
          <video
            ref={videoRef}
            className="w-full aspect-video rounded-md bg-card"
            autoPlay
            muted
            playsInline
          />
        </CardContent>
      </Card>
      {!hasCameraPermission && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            This feature requires access to your camera. Please grant permission in your browser to view the live feed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
