import { t } from './trpc';
import { z } from 'zod';
import { extractTextFromBase64Pdf } from '../utils/pdf';
import { analyzeWithGemini } from './ai';

export const appRouter = t.router({
  analyzeCV: t.procedure
    .input(
      z.object({
        jobDescription: z.string(), // base64-encoded PDF
        cv: z.string(), // base64-encoded PDF
      })
    )
    .mutation(async ({ input }) => {
      try {
        const [jobText, cvText] = await Promise.all([
          extractTextFromBase64Pdf(input.jobDescription),
          extractTextFromBase64Pdf(input.cv),
        ]);
        const aiResult = await analyzeWithGemini(jobText, cvText);
        return { result: aiResult };
      } catch (error: any) {
        return { error: error.message || 'Unknown error' };
      }
    }),
});

export type AppRouter = typeof appRouter;
