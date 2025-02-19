import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';  

@Injectable()
export class SendGridClient {
  private readonly logger = new Logger(SendGridClient.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY is not defined.');
      throw new Error('SENDGRID_API_KEY environment variable is required.');
    }
    SendGrid.setApiKey(apiKey);
  }

  async send(mail: SendGrid.MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}