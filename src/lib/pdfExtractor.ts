export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          let text = '';
          
          // Simple text extraction - look for readable text patterns
          for (let i = 0; i < uint8Array.length - 1; i++) {
            const char = uint8Array[i];
            // Extract printable ASCII characters
            if (char >= 32 && char <= 126) {
              text += String.fromCharCode(char);
            } else if (char === 10 || char === 13) {
              text += ' '; // Replace line breaks with spaces
            }
          }
          
          // Clean up the extracted text
          text = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[^\w\s.,!?@-]/g, '') // Keep only alphanumeric, spaces, and basic punctuation
            .trim();
          
          // If we got some meaningful text, return it, otherwise return file info
          if (text.length > 50) {
            resolve(text.substring(0, 2000)); // Limit to 2000 characters
          } else {
            resolve(`Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Content could not be extracted`);
          }
          resolve(text);
        } catch (error) {
          console.error('Error extracting PDF text:', error);
          resolve(`Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return `Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }
};

export const extractTextFromDocument = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.includes('pdf')) {
    return await extractTextFromPDF(file);
  } else if (fileType.includes('text') || file.name.endsWith('.txt')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(file);
    });
  } else {
    // For other document types, return file info
    return `Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }
};