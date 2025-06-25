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

// Health check for DX
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// REST endpoint for file upload (DX for Postman/curl)
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

// Middleware to convert uploaded files to base64 and inject into req.body
function filesToBase64(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.files && typeof req.files === 'object' && Object.keys(req.files).length > 0) {
    const jobFile = (req.files as any)['jobDescription']?.[0];
    const cvFile = (req.files as any)['cv']?.[0];
    if (jobFile && cvFile) {
      // For tRPC, the body should be the input object itself.
      req.body = {
        jobDescription: jobFile.buffer.toString('base64'),
        cv: cvFile.buffer.toString('base64'),
      };
    }
  }
  next();
}

// tRPC endpoint with file upload support (for typed clients)
app.use(
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
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
