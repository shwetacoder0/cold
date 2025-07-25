import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface EmailGenerationRequest {
  prompt: string;
  attachmentContext?: string;
  template?: string;
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
  fullEmail: string;
}

const DEFAULT_COLD_EMAIL_TEMPLATE = `
You are an expert cold email writer. Generate a professional, personalized cold email based on the user's requirements.

Guidelines:
- Keep it concise (150-200 words max)
- Make it personal and relevant
- Include a clear value proposition
- Have a specific call-to-action
- Use a professional but friendly tone
- Include placeholders like [Name], [Company] where appropriate
- Start with an engaging subject line

Structure:
1. Subject line
2. Personal greeting
3. Brief context/connection
4. Value proposition
5. Social proof (if relevant)
6. Clear call-to-action
7. Professional closing

User Request: {prompt}

{attachmentContext}

Generate a cold email that follows best practices and is likely to get a response.
`;

export const generateColdEmail = async (request: EmailGenerationRequest): Promise<EmailGenerationResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const attachmentContext = request.attachmentContext
      ? `\nAdditional Context from attachments: ${request.attachmentContext}`
      : '';

    const fullPrompt = DEFAULT_COLD_EMAIL_TEMPLATE
      .replace('{prompt}', request.prompt)
      .replace('{attachmentContext}', attachmentContext);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract subject and body
    const lines = text.split('\n').filter(line => line.trim());
    let subject = '';
    let body = '';
    let isBody = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('subject:') || line.toLowerCase().startsWith('subject:')) {
        subject = line.replace(/subject:\s*/i, '').trim();
      } else if (subject && !isBody && (line.trim().startsWith('Hi ') || line.trim().startsWith('Hello ') || line.trim().startsWith('Dear '))) {
        isBody = true;
        body = line.trim();
      } else if (isBody) {
        body += '\n' + line.trim();
      }
    }

    // If parsing fails, use the full text as body and generate a subject
    if (!subject || !body) {
      const subjectMatch = text.match(/subject:\s*(.+)/i);
      subject = subjectMatch ? subjectMatch[1].trim() : 'Quick question about collaboration';
      body = text.replace(/subject:\s*.+/i, '').trim();
    }

    const fullEmail = `Subject: ${subject}\n\n${body}`;

    return {
      subject,
      body,
      fullEmail
    };
  } catch (error) {
    console.error('Error generating email with Gemini:', error);
    throw new Error('Failed to generate email. Please try again.');
  }
};

export const generateColdEmailWithUserContext = async (
  request: EmailGenerationRequest,
  userDetails: string
): Promise<EmailGenerationResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const attachmentContext = request.attachmentContext
      ? `\nAdditional Context from attachments: ${request.attachmentContext}`
      : '';

    const userContext = userDetails
      ? `\nUser Background: ${userDetails}`
      : '';

    const enhancedPrompt = `
You are an expert cold email writer. Generate a professional, personalized cold email based on the user's requirements and their background.

Guidelines:
- Keep it concise (150-200 words max)
- Make it personal and relevant using the user's background
- Include a clear value proposition based on user's expertise
- Have a specific call-to-action
- Use a professional but friendly tone
- Include placeholders like [Name], [Company] where appropriate
- Start with an engaging subject line
- Leverage the user's background to establish credibility

Structure:
1. Subject line
2. Personal greeting
3. Brief context/connection (use user background when relevant)
4. Value proposition (based on user's skills/experience)
5. Social proof (from user's background if available)
6. Clear call-to-action
7. Professional closing

User Request: ${request.prompt}
${userContext}
${attachmentContext}

Generate a cold email that follows best practices and leverages the user's background for maximum impact.
`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract subject and body
    const lines = text.split('\n').filter(line => line.trim());
    let subject = '';
    let body = '';
    let isBody = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('subject:') || line.toLowerCase().startsWith('subject:')) {
        subject = line.replace(/subject:\s*/i, '').trim();
      } else if (subject && !isBody && (line.trim().startsWith('Hi ') || line.trim().startsWith('Hello ') || line.trim().startsWith('Dear '))) {
        isBody = true;
        body = line.trim();
      } else if (isBody) {
        body += '\n' + line.trim();
      }
    }

    // If parsing fails, use the full text as body and generate a subject
    if (!subject || !body) {
      const subjectMatch = text.match(/subject:\s*(.+)/i);
      subject = subjectMatch ? subjectMatch[1].trim() : 'Quick question about collaboration';
      body = text.replace(/subject:\s*.+/i, '').trim();
    }

    const fullEmail = `Subject: ${subject}\n\n${body}`;

    return {
      subject,
      body,
      fullEmail
    };
  } catch (error) {
    console.error('Error generating email with user context:', error);
    throw new Error('Failed to generate email. Please try again.');
  }
};

export const generateUserDetails = async (inputText: string, documentContext: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI assistant that creates concise professional summaries. Based on the user's input and any document context, create a brief professional summary that captures the key information for cold email generation.

Focus on:
- Professional background and experience
- Key skills and expertise
- Notable achievements or credentials
- Industry or domain focus
- What services/products they offer
- Target audience or market

Keep it concise (2-3 sentences max) and professional. This will be used to personalize cold emails.

User Input: ${inputText}
${documentContext ? `\nDocument Context: ${documentContext}` : ''}

Generate a professional summary:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating user details:', error);
    throw new Error('Failed to process user information. Please try again.');
  }
};

export const generateEmailFromTemplate = async (template: string, userPrompt: string): Promise<EmailGenerationResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are an expert cold email writer. Use the following template as a base and customize it based on the user's specific requirements.

    Template:
    ${template}

    User Requirements:
    ${userPrompt}

    Instructions:
    - Customize the template to match the user's specific needs
    - Keep the professional tone and structure
    - Make it personal and relevant
    - Ensure it's concise and actionable
    - Include a clear subject line

    Generate the customized email:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse similar to above
    const lines = text.split('\n').filter(line => line.trim());
    let subject = '';
    let body = '';
    let isBody = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('subject:') || line.toLowerCase().startsWith('subject:')) {
        subject = line.replace(/subject:\s*/i, '').trim();
      } else if (subject && !isBody && (line.trim().startsWith('Hi ') || line.trim().startsWith('Hello ') || line.trim().startsWith('Dear '))) {
        isBody = true;
        body = line.trim();
      } else if (isBody) {
        body += '\n' + line.trim();
      }
    }

    if (!subject || !body) {
      const subjectMatch = text.match(/subject:\s*(.+)/i);
      subject = subjectMatch ? subjectMatch[1].trim() : 'Quick question about collaboration';
      body = text.replace(/subject:\s*.+/i, '').trim();
    }

    const fullEmail = `Subject: ${subject}\n\n${body}`;

    return {
      subject,
      body,
      fullEmail
    };
  } catch (error) {
    console.error('Error generating email from template:', error);
    throw new Error('Failed to generate email from template. Please try again.');
  }
};
