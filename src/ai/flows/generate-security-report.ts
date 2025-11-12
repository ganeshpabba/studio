'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a weekly security report.
 *
 * The flow summarizes detected anomalies, system performance, and configuration changes.
 * It exports the `generateSecurityReport` function, the `SecurityReportInput` type, and the `SecurityReportOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import { mockAlerts, mockStats } from '@/lib/data';

const SecurityReportInputSchema = z.object({
  startDate: z.string().describe('The start date for the report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the report (YYYY-MM-DD).'),
});

export type SecurityReportInput = z.infer<typeof SecurityReportInputSchema>;

const SecurityReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the security report.'),
  anomalies: z.string().describe('A summary of detected anomalies.'),
  systemPerformance: z.string().describe('A summary of system performance.'),
  configurationChanges: z.string().describe('A summary of configuration changes.'),
});

export type SecurityReportOutput = z.infer<typeof SecurityReportOutputSchema>;

export async function generateSecurityReport(input: SecurityReportInput): Promise<SecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const generateSecurityReportPrompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  input: {
    schema: SecurityReportInputSchema.extend({
      anomalies: z.string(),
      systemPerformance: z.string(),
      configurationChanges: z.string(),
    }),
  },
  output: {schema: SecurityReportOutputSchema},
  prompt: `You are a security expert responsible for generating weekly security reports.
  You will summarize detected anomalies, system performance, and configuration changes between {{startDate}} and {{endDate}}.

  Anomalies:
  {{{anomalies}}}

  System Performance:
  {{{systemPerformance}}}

  Configuration Changes:
  {{{configurationChanges}}}

  Based on the data provided, generate a comprehensive security report.
  
  Summary:
  Provide a concise summary of the security report including potential vulnerabilities and compliance with security policies.

  Anomalies Summary:
  Provide a detailed breakdown of the detected anomalies.

  System Performance Summary:
  Summarize the system performance metrics.

  Configuration Changes Summary:
  Detail any configuration changes made during the period.
  `,
});

const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: SecurityReportInputSchema,
    outputSchema: SecurityReportOutputSchema,
  },
  async (input) => {
    // In a real app, you'd fetch this data from a database based on the date range.
    // For now, we'll use mock data.
    const anomalies = mockAlerts
      .filter(alert => {
        const alertDate = new Date(alert.timestamp);
        return alertDate >= new Date(input.startDate) && alertDate <= new Date(input.endDate);
      })
      .map(
        (a) =>
          `- ${a.timestamp}: ${a.behaviour_type} detected for person ${a.person_id} on camera ${a.camera_id} with ${a.confidence * 100}% confidence.`
      )
      .join('\n');

    const systemPerformance = `- Total Alerts: ${mockStats.total_alerts}\n- Alerts Today: ${mockStats.alerts_today}\n- Active Cameras: ${mockStats.active_cameras}\n- Average Confidence: ${mockStats.average_confidence * 100}%`;
    
    const configurationChanges = 'No configuration changes were made during this period.';

    const promptInput = {
      ...input,
      anomalies: anomalies || "No anomalies detected.",
      systemPerformance,
      configurationChanges,
    };

    const {output} = await generateSecurityReportPrompt(promptInput);
    return output!;
  }
);
