"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';

export function SurveillancePanel() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Surveillance</h1>
                <p className="text-muted-foreground">
                    Advanced real-time monitoring and analysis.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Multi-Camera View</CardTitle>
                    <CardDescription>
                        This feature is under development.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            Coming soon: A grid view for multiple camera feeds.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
