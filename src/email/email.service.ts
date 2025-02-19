// types/email.types.ts

  export interface IEmailSend {
    to: string;
    cc?: string;
    subject:string
    text:string;
  }
  
  // email.service.ts
  import { Injectable } from '@nestjs/common';
  import { MailDataRequired } from '@sendgrid/mail';
  import { SendGridClient } from './sendgrid-client';

  
  @Injectable()
  export class EmailService {
    constructor(private readonly sendGridClient: SendGridClient) {}
  
    async sendEmail(data: IEmailSend): Promise<void> {
      const mail: MailDataRequired = {
        from: process.env.SENDGRID_SENDER,
        subject: data.subject,
        to: data.to,
        text: data.text,
      };
  
      await this.sendGridClient.send(mail);
    }
  }