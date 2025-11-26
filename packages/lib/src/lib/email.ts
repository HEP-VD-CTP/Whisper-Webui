
import nodemailer from 'nodemailer'

export type TemplateParams = {
  lang: string
  subject: string
  body: string
  target: string
  targetLabel: string
  footer: string
}

export type SendEmailParams = {
  lang: string
  to: string
  subject: string
  body: string
  target: string
  targetLabel: string
  footer: string
}

const port: number = parseInt(process.env['SMTP_PORT'] || '465')
const secure: boolean = port === 465
const host: string = process.env['SMTP_HOST'] || ``
const user: string = process.env['SMTP_USER'] || ``
const pwd: string = process.env['SMTP_PASSWORD'] || ``

export function getTemplate({ lang, subject, body, target, targetLabel, footer }: TemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 24px;
      border-radius: 8px;
    }

    h1 {
      font-size: 24px;
      margin-top: 0;
    }

    p {
      line-height: 1.5;
      margin: 0 0 12px 0;
    }

    .button {
      display: inline-block;
      padding: 12px 20px;
      margin-top: 16px;
      text-decoration: none;
      border-radius: 4px;
      background-color: #2563eb;
      color: #ffffff !important;
      font-weight: 600;
    }

    .footer {
      font-size: 12px;
      color: #777;
      margin-top: 24px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div style="padding: 16px 0;">
    <div class="container">
      ${body}

      <p>
        <a href="https://${target}" class="button">
          ${targetLabel}
        </a>
      </p>

      <div class="footer">
       ${footer}
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function sendEmail({ lang, to, subject, body, target, targetLabel, footer }: SendEmailParams): Promise<void> {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: pwd
    } 
  })

  const info = await transporter.sendMail({
    from: user,      
    to,          
    subject,
    html: getTemplate({
      lang, 
      subject,
      body,
      target,
      targetLabel,
      footer
    })
  })
}

export default {
  sendEmail
}