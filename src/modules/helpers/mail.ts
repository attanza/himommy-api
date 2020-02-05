import * as nodemailer from 'nodemailer';

class Mailer {
  transporter;
  constructor() {
    this.setTransporter();
  }

  setTransporter() {
    const { username, password, host, port } = this.getConfig();
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: username, // generated ethereal user
        pass: password, // generated ethereal password
      },
    });
  }

  getConfig() {
    const NODE_ENV = process.env.NODE_ENV;
    let username: string;
    let password: string;
    let from: string;
    let host: string;
    let port: number;

    if (NODE_ENV === 'development') {
      username = process.env.MAIL_TRAP_USERNAME;
      password = process.env.MAIL_TRAP_PASSWORD;
      from = process.env.MAIL_FROM;
      port = Number(process.env.Mail_TRAP_PORT);
      host = process.env.Mail_TRAP_HOST;
    }

    return { username, password, from, host, port };
  }

  async sendMail(to: string, subject: string, content: string) {
    try {
      const { from } = this.getConfig();
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html: content,
      });
    } catch (e) {
      console.log('e', e);
    }
  }
}

export default new Mailer();
