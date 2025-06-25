// @ts-nocheck
import supertest from 'supertest';
import { describe, it, expect } from 'vitest';
import express from 'express';

const app = express();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('Health API', () => {
  it('GET /health should return status ok', async () => {
    const res = await supertest(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
}); 