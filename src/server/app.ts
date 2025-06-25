import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import multer from 'multer';
import { appRouter } from './router';
import { createContext } from './trpc';
import dotenv from 'dotenv';
import { extractTextFromBase64Pdf } from '../utils/pdf';
import { analyzeWithGemini } from './ai';

dotenv.config();

const app = express();
const upload = multer();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post(
  '/analyze',
  upload.fields([
    { name: 'jobDescription', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const jobFile = (req.files as any)?.jobDescription?.[0];
      const cvFile = (req.files as any)?.cv?.[0];
      if (!jobFile || !cvFile) {
        res.status(400).json({ error: 'Both jobDescription and cv files are required.' });
        return;
      }
      const jobText = await extractTextFromBase64Pdf(jobFile.buffer.toString('base64'));
      const cvText = await extractTextFromBase64Pdf(cvFile.buffer.toString('base64'));
      const aiResult = await analyzeWithGemini(jobText, cvText);
      res.json({ result: aiResult });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Unknown error' });
    }
  }
);

function filesToBase64(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.files && typeof req.files === 'object') {
    const jobFile = (req.files as any)['jobDescription']?.[0];
    const cvFile = (req.files as any)['cv']?.[0];
    if (jobFile && cvFile) {
      req.body = {
        input: {
          jobDescription: jobFile.buffer.toString('base64'),
          cv: cvFile.buffer.toString('base64'),
        },
      };
    }
  }
  next();
}

app.post(
  '/trpc',
  upload.fields([
    { name: 'jobDescription', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
  ]),
  filesToBase64,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app; 