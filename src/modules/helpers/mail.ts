// tslint:disable:no-console
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';

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

    const handlebarOptions = {
      viewEngine: {
        extName: '.hbs',
        partialsDir: 'views/emails',
        layoutsDir: 'views/emails',
        defaultLayout: 'master.hbs',
      },
      viewPath: 'views',
      extName: '.hbs',
    };

    this.transporter.use('compile', hbs(handlebarOptions));
  }

  getConfig() {
    const NODE_ENV = process.env.NODE_ENV;
    let username: string;
    let password: string;
    let from: string;
    let host: string;
    let port: number;

    from = process.env.MAIL_FROM;
    if (NODE_ENV === 'development') {
      host = process.env.Mail_TRAP_HOST;
      port = Number(process.env.Mail_TRAP_PORT);
      username = process.env.MAIL_TRAP_USERNAME;
      password = process.env.MAIL_TRAP_PASSWORD;
    } else {
      host = process.env.SENDGRID_HOST;
      port = Number(process.env.SENDGRID_PORT);
      username = process.env.SENDGRID_USERNAME;
      password = process.env.SENDGRID_API_KEY;
    }

    return { username, password, from, host, port };
  }

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any = {},
  ) {
    try {
      const { from } = this.getConfig();
      await this.transporter.sendMail({
        from,
        to,
        subject,
        template: `emails/${template}`,
        context,
      });
    } catch (e) {
      console.log('e', e); //tslint:disable
    }
  }
}

export default new Mailer();
