// Branded email template system for Uslugo
// Matches site design with blue-600 primary color and clean typography

export interface EmailTemplateProps {
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
}

export function createEmailTemplate({
  title,
  content,
  ctaText,
  ctaUrl,
  footerText
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 24px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
      margin: 0;
    }
    .content {
      padding: 32px 24px;
    }
    .title {
      color: #1e293b;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    .text {
      color: #475569;
      font-size: 16px;
      margin: 16px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .info-box {
      background-color: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-links {
      margin: 16px 0;
    }
    .footer-links a {
      color: #2563eb;
      text-decoration: none;
      margin: 0 12px;
      font-size: 14px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .footer-text {
      color: #64748b;
      font-size: 14px;
      margin: 16px 0 0 0;
    }
    .unsubscribe {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 16px;
    }
    .unsubscribe a {
      color: #94a3b8;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 24px 16px;
      }
      .header {
        padding: 20px 16px;
      }
      .footer {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">Uslugo</h1>
    </div>
    
    <!-- Content -->
    <div class="content">
      <h2 class="title">${title}</h2>
      <div class="text">
        ${content}
      </div>
      ${ctaText && ctaUrl ? `
        <div style="text-align: center;">
          <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
        </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}">Početna</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/usluge">Pretraži usluge</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/register">Postani partner</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">Kontakt</a>
      </div>
      ${footerText ? `<p class="footer-text">${footerText}</p>` : ''}
      <p class="footer-text">
        Uslugo - Vaš pouzdani partner za lokalne usluge u Hrvatskoj
      </p>
      <div class="unsubscribe">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Odjavi se od email obavještenja</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Helper function to create info boxes for important information
export function createInfoBox(content: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const colors = {
    info: { bg: '#f1f5f9', border: '#2563eb' },
    success: { bg: '#f0fdf4', border: '#16a34a' },
    warning: { bg: '#fffbeb', border: '#f59e0b' },
    error: { bg: '#fef2f2', border: '#dc2626' }
  };
  
  const color = colors[type];
  
  return `
    <div style="
      background-color: ${color.bg};
      border-left: 4px solid ${color.border};
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    ">
      ${content}
    </div>
  `;
}
