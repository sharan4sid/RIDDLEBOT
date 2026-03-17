'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';

const schema = z.object({
  suggestion: z.string().min(5, 'Suggestion must be at least 5 characters long.'),
});

export async function submitSuggestion(formData: FormData) {
  const suggestionParams = formData.get('suggestion');
  
  const parsed = schema.safeParse({
    suggestion: suggestionParams,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  const suggestion = parsed.data.suggestion;
  
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables.');
    return {
      success: false,
      error: 'Server is not configured to send emails yet.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Prahelika Suggestions" <${user}>`,
      to: user, // Mailing it to the same Google Mail ID as requested
      subject: 'New Suggestion for Prahelika Game',
      text: `You have received a new suggestion from the website:\n\n${suggestion}`,
      html: `
        <h3>New Suggestion for Prahelika Game</h3>
        <p><strong>Suggestion:</strong></p>
        <blockquote style="font-size: 16px; border-left: 4px solid #ccc; margin-left: 0; padding-left: 16px; color: #555;">
          ${suggestion.replace(/\n/g, '<br/>')}
        </blockquote>
        <br/>
        <p><small>Sent via your Prahelika Suggestion Box.</small></p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending suggestion email:', error);
    return {
      success: false,
      error: 'Failed to send suggestion. Please try again later.',
    };
  }
}
