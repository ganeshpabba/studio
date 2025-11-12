'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  generateSecurityReport,
  type SecurityReportOutput,
} from '@/ai/flows/generate-security-report';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const reportSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: 'A start date is required.',
    }),
    to: z.date({
      required_error: 'An end date is required.',
    }),
  }),
});

export function ReportGenerator() {
  const [report, setReport] = useState<SecurityReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
  });

  async function onSubmit(values: z.infer<typeof reportSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateSecurityReport({
        startDate: format(values.dateRange.from, 'yyyy-MM-dd'),
        endDate: format(values.dateRange.to, 'yyyy-MM-dd'),
      });
      setReport(result);
    } catch (error) {
      console.error('Failed to generate report:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Security Report Generator</h1>
        <p className="text-muted-foreground">
          Generate a summary of security activities for a selected date range.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Report Parameters</CardTitle>
                  <CardDescription>
                    Select the date range for the report.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date range</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value?.from ? (
                                  field.value.to ? (
                                    <>
                                      {format(field.value.from, 'LLL dd, y')} -{' '}
                                      {format(field.value.to, 'LLL dd, y')}
                                    </>
                                  ) : (
                                    format(field.value.from, 'LLL dd, y')
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={field.value?.from}
                              selected={{from: field.value.from, to: field.value.to}}
                              onSelect={field.onChange}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the start and end date for the report.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Report</CardTitle>
              <CardDescription>
                The generated security report will appear below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {report ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.summary}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Anomalies</h3>
                     <Textarea readOnly value={report.anomalies} rows={5}/>
                  </div>
                  <div>
                    <h3 className="font-semibold">System Performance</h3>
                     <Textarea readOnly value={report.systemPerformance} rows={3}/>
                  </div>
                  <div>
                    <h3 className="font-semibold">Configuration Changes</h3>
                     <Textarea readOnly value={report.configurationChanges} rows={3}/>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="text-center text-muted-foreground p-8">
                    Please generate a report to see the results.
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
