"use client";

import { BarChart, Users, AlertTriangle, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAppContext } from '@/contexts/AppContext';
import { AlertLogTable } from './alert-log-table';
import { useState, useMemo, useEffect } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { summarizeAlertsForOperator } from '@/ai/flows/summarize-alerts-for-operator';
import { Button } from './ui/button';

const chartConfig = {
  count: {
    label: 'Count',
  },
  fall: {
    label: 'Fall',
    color: 'hsl(var(--chart-1))',
  },
  lying_motionless: {
    label: 'Lying',
    color: 'hsl(var(--chart-2))',
  },
  loitering: {
    label: 'Loitering',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function Dashboard() {
  const { stats, alerts } = useAppContext();
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const behaviorData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.behaviors_detected).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: value,
      fill: `var(--color-${key})`,
    }));
  }, [stats]);

  const generateSummary = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeAlertsForOperator({ alerts });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate summary", error);
      setSummary("Could not generate summary at this time.");
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (alerts.length > 0) {
      generateSummary();
    }
  }, [alerts]);


  if (!stats) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_alerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.alerts_today} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Cameras
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_cameras}</div>
            <p className="text-xs text-muted-foreground">Online and streaming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Confidence
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.average_confidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all detections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Behavior Analysis
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.behaviors_detected).length} Types
            </div>
            <p className="text-xs text-muted-foreground">
              Fall, Lying, Loitering
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>An AI-generated summary of today's alerts.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateSummary} disabled={isSummarizing}>
            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Regenerate
          </Button>
        </CardHeader>
        <CardContent>
          {isSummarizing && !summary ? (
             <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating summary...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{summary || "No summary available."}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Behavior Distribution</CardTitle>
            <CardDescription>
              A summary of detected anomalous behaviors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={behaviorData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                   <CartesianGrid vertical={false} />
                   <XAxis dataKey="name" tickLine={false} axisLine={false} />
                   <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="count" radius={4} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              The 5 most recent alerts detected by the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertLogTable alerts={recentAlerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
