// PDF extraction service utilities

const PDF_EXTRACTION_SERVER_URL = import.meta.env.VITE_PDF_EXTRACTION_URL || 'http://localhost:3001';

export interface PDFExtractionResult {
  success: boolean;
  filename: string;
  text: string;
  pages?: number;
  characters?: number;
  error?: string;
  message?: string;
}

export interface BatchPDFExtractionResult {
  success: boolean;
  totalFiles: number;
  results: PDFExtractionResult[];
}

/**
 * Extract text from a single PDF file
 */
export const extractPDFText = async (file: File): Promise<PDFExtractionResult> => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${PDF_EXTRACTION_SERVER_URL}/extract-pdf-text`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'PDF extraction failed');
    }

    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      filename: file.name,
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to extract text from PDF'
    };
  }
};

/**
 * Extract text from multiple PDF files
 */
export const extractMultiplePDFText = async (files: File[]): Promise<BatchPDFExtractionResult> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('pdfs', file);
    });

    const response = await fetch(`${PDF_EXTRACTION_SERVER_URL}/extract-multiple-pdfs`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Batch PDF extraction failed');
    }

    return result;
  } catch (error) {
    console.error('Batch PDF extraction error:', error);
    return {
      success: false,
      totalFiles: files.length,
      results: files.map(file => ({
        success: false,
        filename: file.name,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    };
  }
};

/**
 * Check if PDF extraction server is available
 */
export const checkPDFExtractionService = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PDF_EXTRACTION_SERVER_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('PDF extraction service check failed:', error);
    return false;
  }
};

/**
 * Process documents and extract text from PDFs, return document context for AI
 */
export const processDocumentsForContext = async (files: File[]): Promise<string> => {
  if (files.length === 0) return '';

  const documentContexts: string[] = [];

  for (const file of files) {
    if (file.type === 'application/pdf') {
      // Extract text from PDF
      const result = await extractPDFText(file);

      if (result.success && result.text.trim()) {
        documentContexts.push(`Document: ${file.name}\nContent: ${result.text.trim()}`);
      } else {
        // Fallback to basic file info if extraction fails
        documentContexts.push(`Document: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB) - Text extraction failed`);
      }
    } else {
      // For non-PDF files, just include basic info
      documentContexts.push(`Document: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`);
    }
  }

  return documentContexts.join('\n\n');
};
