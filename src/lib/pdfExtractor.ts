export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For now, we'll return a placeholder since pdf-parse requires Node.js
    // In a real implementation, you'd use a browser-compatible PDF parser
    // or send the file to a server endpoint for processing
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // This is a simplified approach - in production you'd use a proper PDF parser
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // For now, we'll extract basic text content
          // You might want to use libraries like PDF.js or send to backend
          const text = `Extracted content from ${file.name}`;
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