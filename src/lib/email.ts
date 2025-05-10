// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
});

export async function sendMentionNotification(
  mentionedUserEmail: string,
  mentionerName: string,
  alertName: string,
  message: string,
  alertLink: string,
  assignedTo?: string
) {
  try {
    const isAssigned = assignedTo && assignedTo.toLowerCase() === mentionedUserEmail.toLowerCase();
    
    await transporter.sendMail({
      from: `"Alert System" <${process.env.EMAIL_FROM}>`,
      to: mentionedUserEmail,
      subject: `${isAssigned ? '[ACTION REQUIRED] ' : ''}You were mentioned in alert ${alertName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2563eb; padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; background-color: #f9fafb; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
                .footer { padding: 15px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; border-radius: 0 0 8px 8px; }
                .button { background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }
                .mention { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 10px 15px; margin: 15px 0; }
                .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 10px 15px; margin: 15px 0; display: ${isAssigned ? 'block' : 'none'}; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Alert System Notification</h2>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                
                ${isAssigned ? `
                <div class="alert">
                    <strong>❗ Important:</strong> You have been assigned this alert by ${mentionerName}
                </div>
                ` : ''}
                
                <p>You were mentioned by <strong>${mentionerName}</strong> in the chat for alert: <strong>${alertName}</strong></p>
                
                <div class="mention">
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p>Please click the button below to view and respond to the alert:</p>
                
                <a href="${alertLink}" class="button">View Alert</a>
                
                <p>If the button doesn't work, copy and paste this link into your browser:<br>
                <small>${alertLink}</small></p>
            </div>
            
            <div class="footer">
                <p>This is an automated notification. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Alert System</p>
            </div>
        </body>
        </html>
      `,
      text: `Hello,\n\nYou were mentioned by ${mentionerName} in the chat for alert: ${alertName}\n\n${
        isAssigned ? `IMPORTANT: You have been assigned this alert by ${mentionerName}\n\n` : ''
      }Message:\n${message}\n\nView the alert: ${alertLink}\n\nThis is an automated notification. Please do not reply to this email.`,
    });
  } catch (error) {
    console.error("Failed to send mention notification:", error);
  }
}