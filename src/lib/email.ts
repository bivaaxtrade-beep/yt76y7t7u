import nodemailer from 'nodemailer';
import { adminDb } from './firebase-admin.ts';
import logger from './logger.ts';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const settingsDoc = await adminDb.collection('app_config').doc('settings').get();
    const config = settingsDoc.data() || {};
    
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass) {
      logger.warn('SMTP configuration is missing. Cannot send email to ' + to);
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort),
      secure: Number(config.smtpPort) === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    const fromAddress = config.smtpFromEmail 
      ? `"${config.smtpFromName || 'Bivaax Trade'}" <${config.smtpFromEmail}>`
      : config.smtpUser;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
}
