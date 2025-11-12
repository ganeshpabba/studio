'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a weekly security report.
 *
 * The flow summarizes detected anomalies, system performance, and configuration changes.
 * It exports the `generateSecurityReport` function, the `SecurityReportInput` type, and the `SecurityReportOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: SecurityReportInputSchema},
  output: {schema: SecurityReportOutputSchema},
  prompt: `You are a security expert responsible for generating weekly security reports.
  You will summarize detected anomalies, system performance, and configuration changes between {{startDate}} and {{endDate}}.

  Anomalies:
  [List of anomalies from the database]

  System Performance:
  [System performance metrics such as FPS, CPU usage, memory usage]

  Configuration Changes:
  [List of configuration changes made during the week]

  Summary:
  Provide a concise summary of the security report including potential vulnerabilities and compliance with security policies.
  `,
});

const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: SecurityReportInputSchema,
    outputSchema: SecurityReportOutputSchema,
  },
  async input => {
    // TODO: Fetch anomalies, system performance, and configuration changes from the database and other sources
    // Replace the following placeholders with actual data
    const anomalies = 'No anomalies detected.';
    const systemPerformance = 'System performance was normal.';
    const configurationChanges = 'No configuration changes were made.';

    const promptInput = {
      ...input,
      anomalies,
      systemPerformance,
      configurationChanges,
    };

    const {output} = await generateSecurityReportPrompt(promptInput);
    return output!;
  }
);
