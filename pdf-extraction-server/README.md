# PDF Extraction Server

A simple Node.js service for extracting text from PDF files using pdf-parse.

## Features

- Extract text from PDF files
- Support for single and multiple file uploads
- CORS enabled for frontend integration
- File size validation (10MB limit)
- Error handling and logging

## API Endpoints

### Health Check
```
GET /health
```

### Single PDF Extraction
```
POST /extract-pdf-text
Content-Type: multipart/form-data
Body: pdf file (form field name: "pdf")
```

### Multiple PDF Extraction
```
POST /extract-multiple-pdfs
Content-Type: multipart/form-data
Body: pdf files (form field name: "pdfs", max 5 files)
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Response Format

### Success Response
```json
{
  "success": true,
  "filename": "document.pdf",
  "text": "extracted text content...",
  "pages": 5,
  "characters": 1234
}
```

### Error Response
```json
{
  "error": "PDF extraction failed",
  "message": "Error details...",
  "details": "Stack trace (development only)"
}
```

## Deployment

This service can be deployed on:
- Railway
- Render
- Vercel (with serverless functions)
- Heroku
- Any VPS with Node.js support

## Notes

- Only PDF files are accepted
- Maximum file size is 10MB
- Text extraction works best with text-based PDFs
- Scanned PDFs (images) may not extract text properly
