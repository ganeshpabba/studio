"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const configSchema = z.object({
  camera: z.object({
    source: z.string().min(1, 'Camera source cannot be empty.'),
    fps: z.number().min(1).max(60),
  }),
  detection: z.object({
    confidence: z.number().min(0).max(1),
  }),
  behavior: z.object({
    fall: z.object({
      enabled: z.boolean(),
      velocity_threshold: z.number().min(0).max(2),
    }),
    lying: z.object({
      enabled: z.boolean(),
      seconds: z.number().min(1).max(20),
    }),
    loitering: z.object({
      enabled: z.boolean(),
      seconds: z.number().min(5).max(120),
    }),
  }),
});

export function ConfigPanel() {
  const { config, updateConfig } = useAppContext();
  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: config,
  });

  function onSubmit(values: z.infer<typeof configSchema>) {
    updateConfig(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Configuration</h1>
            <p className="text-muted-foreground">Adjust system parameters and behavior thresholds.</p>
          </div>
          <Button type="submit">Save Changes</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Camera & Detection</CardTitle>
              <CardDescription>
                Core settings for video input and object detection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="camera.source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Source</FormLabel>
                    <FormControl>
                      <Input placeholder="0 or rtsp://..." {...field} className="font-code" />
                    </FormControl>
                    <FormDescription>
                      Use '0' for default webcam or an RTSP URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Controller
                control={form.control}
                name="detection.confidence"
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <FormLabel>Detection Confidence</FormLabel>
                    <FormControl>
                      <>
                        <Slider
                          defaultValue={[value]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                        <div className="text-right text-sm text-muted-foreground font-mono">{value.toFixed(2)}</div>
                      </>
                    </FormControl>
                    <FormDescription>
                      Minimum confidence to consider a detection.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Behavior Analysis</CardTitle>
              <CardDescription>
                Enable and tune anomalous behavior detectors.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['fall', 'lying', 'loitering']} className="w-full">
                <AccordionItem value="fall">
                  <AccordionTrigger>Fall Detection</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField control={form.control} name="behavior.fall.enabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Enable</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <Controller control={form.control} name="behavior.fall.velocity_threshold" render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Velocity Threshold</FormLabel>
                        <FormControl>
                          <>
                            <Slider defaultValue={[value]} min={0} max={2} step={0.1} onValueChange={(vals) => onChange(vals[0])} />
                            <div className="text-right text-sm text-muted-foreground font-mono">{value.toFixed(2)}</div>
                          </>
                        </FormControl>
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="lying">
                  <AccordionTrigger>Lying Motionless Detection</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField control={form.control} name="behavior.lying.enabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Enable</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <Controller control={form.control} name="behavior.lying.seconds" render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Time Threshold (seconds)</FormLabel>
                        <FormControl>
                           <>
                            <Slider defaultValue={[value]} min={1} max={20} step={1} onValueChange={(vals) => onChange(vals[0])} />
                            <div className="text-right text-sm text-muted-foreground font-mono">{value.toFixed(1)}s</div>
                          </>
                        </FormControl>
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="loitering">
                  <AccordionTrigger>Loitering Detection</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField control={form.control} name="behavior.loitering.enabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Enable</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <Controller control={form.control} name="behavior.loitering.seconds" render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Time Threshold (seconds)</FormLabel>
                        <FormControl>
                           <>
                            <Slider defaultValue={[value]} min={5} max={120} step={5} onValueChange={(vals) => onChange(vals[0])} />
                             <div className="text-right text-sm text-muted-foreground font-mono">{value.toFixed(0)}s</div>
                          </>
                        </FormControl>
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
