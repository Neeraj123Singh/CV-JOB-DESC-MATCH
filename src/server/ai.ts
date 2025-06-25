import axios from 'axios';

type GenerateContentRequest = {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
};

const GEMINI_ENDPOINT = 'https://intertest.woolf.engineering/invoke';


export async function analyzeWithGemini(jobText: string, cvText: string) {
  let AUTH_TOKEN = process.env.GEMINI_AUTH_TOKEN;
  if (!AUTH_TOKEN) throw new Error('Missing Gemini auth token');

  const prompt = `You are an expert recruiter. Analyze the following job description and CV. Identify the candidate's strengths and weaknesses, and evaluate how well they align with the job description.\n\nJob Description:\n${jobText}\n\nCV:\n${cvText}`;

  const req: GenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await axios.post(GEMINI_ENDPOINT, req, {
    headers: {
      Authorization: `${process.env.GEMINI_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}
