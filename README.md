# Woolf Assessment: Back-End Engineer

## Overview
This Node.js backend server uses tRPC and Express. It exposes endpoints to analyze a job description and a CV (PDFs) using Gemini 1.5 Flash AI, returning strengths, weaknesses, and alignment.

## Features
- Accepts two PDF files (job description & CV)
- Extracts text from PDFs
- Calls Gemini 1.5 Flash endpoint for analysis
- Returns structured AI analysis
- Easy to test (HTTP file, Postman, curl, tRPC)
- Global error handling for robust API responses
- Helper script for base64 encoding
- **Clean codebase:** All unnecessary and unused code has been removed for clarity and maintainability.

## Quick Start: Commands & Steps

### 1. Install dependencies
```bash
npm install
```

### 2. Update your `.env` file
Create a `.env` file in the project root:
```
GEMINI_AUTH_TOKEN=<YOUR TOKEN>
PORT=4000
```

### 3. Run the server
- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run build
  npm start
  ```

### 4. Run tests
```bash
npm test
```

### 5. Use the Postman collection
- Import `test/WoolfAssessment.postman_collection.json` into Postman.
- Use the three requests:
  - Health Check
  - Analyze CV and Job Description (REST)
  - Analyze CV and Job Description (tRPC)
- For tRPC, use the helper script to get base64 strings for your PDFs:
  ```bash
  node tests/base64encode.js /path/to/job.pdf
  node tests/base64encode.js /path/to/cv.pdf
  ```
  Paste the outputs into the tRPC request body in Postman.

### 6. Try the HTTP files
- Use `test/test.http` for REST
- Use `test/trpc-analyze.http` for tRPC

## API Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Returns `{ status: 'ok' }` if the server is running.
- **Example:**
  ```bash
  curl http://localhost:4000/health
  ```

### 2. Analyze (REST, recommended for Postman/curl)
- **Endpoint:** `POST /analyze`
- **Description:** Accepts two PDF files (`jobDescription`, `cv`) as `multipart/form-data`. Returns AI analysis.
- **Example (curl):**
  ```bash
  curl -X POST http://localhost:4000/analyze \
    -F "jobDescription=@/path/to/job.pdf" \
    -F "cv=@/path/to/cv.pdf"
  ```
- **Example (Postman):**
  - Import the provided Postman collection from `test/WoolfAssessment.postman_collection.json`.
  - Set `jobDescription` and `cv` to your PDF files in the form-data body.
- **Response:**
  ```json
  {
    "result": { /* AI analysis result */ }
  }
  ```

### 3. Analyze (tRPC, for typed clients and advanced DX)
- **Endpoint:** `POST /trpc/analyzeCV`
- **Description:** Accepts base64-encoded PDFs in a JSON body. Returns AI analysis. This is the recommended way for type-safe, programmatic access.
- **Example (using HTTP file):** See `test/trpc-analyze.http`.
- **Example (using helper script):** Use `test/base64encode.js` to convert PDFs to base64, then use the output in your HTTP request.
- **Request Body:**
  ```json
  {
    "input": {
      "jobDescription": "<base64 string>",
      "cv": "<base64 string>"
    }
  }
  ```
- **Response:**
  ```json
  {
    "result": { /* AI analysis result */ }
  }
  ```

## Helper Script: Convert PDF to Base64
A helper script is provided at `test/base64encode.js`:
```bash
node test/base64encode.js /path/to/file.pdf
```
This will print the base64 string to use in your tRPC request.

## Sample HTTP File for tRPC
See `test/trpc-analyze.http` for a ready-to-use example to test the tRPC endpoint.

## Error Handling
- All endpoints return JSON error messages with appropriate HTTP status codes.
- Global error handling ensures consistent error responses.

## Setup

1. **Clone the repo**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file:
   ```env
   GEMINI_AUTH_TOKEN=yySJ9EP5HGtg4oKFZVLtJKZYXCmET/He
   PORT=4000
   ```
4. **Run the server (dev):**
   ```bash
   npm run dev
   ```
5. **Build the project:**
   ```bash
   npm run build
   ```
6. **Run the built project:**
   ```bash
   npm start
   ```
7. **Run tests:**
   ```bash
   npm test
   ```

## Testing
- Test cases are in the `test` folder.
- Run all tests with `npm test`.
- Example HTTP requests are in `test/test.http` and `test/trpc-analyze.http`.
- Postman collection: `test/WoolfAssessment.postman_collection.json`.

## Scripts
- `npm run dev` — Start server in development mode
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled server
- `npm test` — Run all test cases

## tRPC & DX
- **tRPC** provides end-to-end type safety between client and server. The `analyzeCV` mutation is strongly typed, so you get autocompletion and validation in your client code. No need to manually define REST routes or schemas.
- **DX**: Easy local testing with HTTP file, Postman, and CLI helpers. Clear error messages and global error handling. Automated tests for confidence. Simple setup and run scripts.

## Development
- TypeScript, tRPC, Express, Multer, pdf-parse
- All logic in `src/server` and `src/utils`

## Notes
- Rate limits: 20 requests/minute, 300 requests/hour (enforced by Gemini endpoint)
- The AI prompt and request shape follow VertexAI's `GenerateContentRequest` type

---

**For questions, see code comments or contact the author.**
# CV-JOB-DESC-MATCH
