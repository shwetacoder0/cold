const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'PDF extraction service is running' });
});

// PDF text extraction endpoint
app.post('/extract-pdf-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No PDF file provided',
        message: 'Please upload a PDF file'
      });
    }

    console.log(`Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract text from PDF buffer
    const data = await pdfParse(req.file.buffer);

    const extractedText = data.text.trim();

    if (!extractedText) {
      return res.status(200).json({
        success: true,
        filename: req.file.originalname,
        text: '',
        pages: data.numpages,
        message: 'PDF processed but no text found. This might be a scanned PDF or image-based PDF.'
      });
    }

    console.log(`Successfully extracted ${extractedText.length} characters from ${req.file.originalname}`);

    res.json({
      success: true,
      filename: req.file.originalname,
      text: extractedText,
      pages: data.numpages,
      characters: extractedText.length
    });

  } catch (error) {
    console.error('PDF extraction error:', error);

    res.status(500).json({
      error: 'PDF extraction failed',
      message: error.message || 'Unable to extract text from PDF',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Batch PDF extraction endpoint (for multiple files)
app.post('/extract-multiple-pdfs', upload.array('pdfs', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No PDF files provided',
        message: 'Please upload at least one PDF file'
      });
    }

    console.log(`Processing ${req.files.length} PDF files`);

    const results = [];

    for (const file of req.files) {
      try {
        const data = await pdfParse(file.buffer);
        const extractedText = data.text.trim();

        results.push({
          filename: file.originalname,
          success: true,
          text: extractedText,
          pages: data.numpages,
          characters: extractedText.length
        });

        console.log(`Successfully processed: ${file.originalname}`);
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({
          filename: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      totalFiles: req.files.length,
      results
    });

  } catch (error) {
    console.error('Batch PDF extraction error:', error);

    res.status(500).json({
      error: 'Batch PDF extraction failed',
      message: error.message || 'Unable to process PDF files'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'PDF file size must be less than 10MB'
      });
    }
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PDF extraction server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Extract endpoint: POST http://localhost:${PORT}/extract-pdf-text`);
});

module.exports = app;
