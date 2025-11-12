"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { placeholderImages } from '@/lib/placeholder-images';
import { analyzeImage, AnalyzeImageOutput } from '@/ai/flows/analyze-image-flow';
import { useToast } from '@/hooks/use-toast';
import { Activity, Camera, Loader2, Smile, Video, VideoOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const cameras = [
  { id: 'cam-01', name: 'Main Entrance', feed: placeholderImages['live-feed-1'] },
  { id: 'cam-02', name: 'Warehouse', feed: placeholderImages['live-feed-2'] },
  { id: 'cam-03', name: 'Parking Lot', feed: placeholderImages['live-feed-3'] },
  { id: 'cam-04', name: 'Local Webcam', feed: null },
];

export function SurveillancePanel() {
  const [activeCameraId, setActiveCameraId] = useState<string>('cam-01');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageOutput | null>(null);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string>('');
  const { toast } = useToast();

  const activeCamera = cameras.find((cam) => cam.id === activeCameraId);

  const runAnalysis = useCallback(async (camera: (typeof cameras)[0]) => {
    if (!camera || !camera.feed) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Cannot analyze a webcam feed or empty source in this demo.',
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage({ photoDataUri: camera.feed.imageUrl });
      setAnalysisResult(result);
      setLastAnalysisTimestamp(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the image.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (activeCamera && activeCamera.feed) {
      runAnalysis(activeCamera); // Initial analysis on camera switch
      const interval = setInterval(() => runAnalysis(activeCamera), 10000); // Analyze every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeCameraId, activeCamera, runAnalysis]);


  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-8rem)] rounded-lg border">
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full flex-col">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">Multi-Camera Surveillance</h1>
            <div className="flex items-center gap-2">
              <Select value={activeCameraId} onValueChange={setActiveCameraId}>
                <SelectTrigger className="w-[200px]">
                  <Camera className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((cam) => (
                    <SelectItem key={cam.id} value={cam.id}>
                      {cam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex-1 p-4 bg-muted/40">
              <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {activeCamera?.feed ? (
                    <Image
                    src={activeCamera.feed.imageUrl}
                    alt={activeCamera.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={activeCamera.feed.imageHint}
                    />
                ) : (
                    <div className='text-center text-muted-foreground'>
                        <VideoOff className="mx-auto h-12 w-12" />
                        <p>Webcam feed not available in this view.</p>
                        <p className="text-xs">Go to Live Feed page for webcam access.</p>
                    </div>
                )}
                 <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-lg font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">
                      {activeCamera?.name}
                    </h3>
                  </div>
              </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <div className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Real-Time Analysis</CardTitle>
            <CardDescription>
              AI-powered breakdown of the active feed.
            </CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent>
              {isAnalyzing && !analysisResult && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {analysisResult ? (
                <div className="space-y-6">
                  <div className="text-xs text-muted-foreground">
                    Last updated: {lastAnalysisTimestamp}
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-2">Scene Description</h4>
                    <p className="text-sm text-muted-foreground">{analysisResult.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                            <CardTitle className="text-sm font-medium">Action</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="text-md font-bold">{analysisResult.action}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                            <CardTitle className="text-sm font-medium">Emotion</CardTitle>
                            <Smile className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="text-md font-bold">{analysisResult.emotion}</div>
                        </CardContent>
                    </Card>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-2">Objects & Animals Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.objects.length > 0 ? (
                        analysisResult.objects.map((obj, i) => <Badge key={i} variant="secondary">{obj}</Badge>)
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific objects detected.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                !isAnalyzing && (
                    <div className="text-center text-muted-foreground py-12">
                        <p>No analysis data available.</p>
                    </div>
                )
              )}
            </CardContent>
          </ScrollArea>
           <CardContent className="border-t pt-4">
              <Button onClick={() => activeCamera && runAnalysis(activeCamera)} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                Analyze Now
              </Button>
            </CardContent>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
