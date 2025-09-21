import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailTemplate {
  subject: string
  text: string
  html: string
}

const config: EmailConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

const transporter = nodemailer.createTransport(config)

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  from: string = process.env.SMTP_FROM || 'noreply@example.com'
) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    })
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function createEventNotificationEmail(event: {
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
}): EmailTemplate {
  const start = new Date(event.start_at).toLocaleString()
  const end = new Date(event.end_at).toLocaleString()
  
  return {
    subject: `Event Notification: ${event.title}`,
    text: `
      New Event: ${event.title}
      When: ${start} to ${end}
      ${event.location ? `Where: ${event.location}` : ''}
      ${event.description ? `\nDetails: ${event.description}` : ''}
    `.trim(),
    html: `
      <h2>New Event: ${event.title}</h2>
      <p><strong>When:</strong> ${start} to ${end}</p>
      ${event.location ? `<p><strong>Where:</strong> ${event.location}</p>` : ''}
      ${event.description ? `<p><strong>Details:</strong><br>${event.description}</p>` : ''}
    `
  }
}

export function createAlertEmail(alert: {
  type: string
  message: string
}): EmailTemplate {
  return {
    subject: `Alert: ${alert.type}`,
    text: alert.message,
    html: `
      <h2>Alert: ${alert.type}</h2>
      <p>${alert.message}</p>
    `
  }
}
