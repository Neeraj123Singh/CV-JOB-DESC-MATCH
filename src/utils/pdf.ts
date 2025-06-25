import pdfParse from 'pdf-parse';

export async function extractTextFromBase64Pdf(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const data = await pdfParse(buffer);
  return data.text;
}
