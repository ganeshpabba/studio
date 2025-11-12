"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Alert } from "@/lib/types"
import { formatDistanceToNow } from 'date-fns'

type BehaviorVariant = "default" | "secondary" | "destructive" | "outline";

const getBehaviorVariant = (type: Alert['behaviour_type']): BehaviorVariant => {
    switch (type) {
        case 'fall':
            return 'destructive';
        case 'lying_motionless':
            return 'secondary';
        case 'loitering':
            return 'outline';
        default:
            return 'default';
    }
}

export function AlertLogTable({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No alerts to display.</div>
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Behavior</TableHead>
            <TableHead>Person</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell>
                <Badge variant={getBehaviorVariant(alert.behaviour_type)}>
                    {alert.behaviour_type.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                P-{String(alert.person_id).padStart(3, '0')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {(alert.confidence * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
