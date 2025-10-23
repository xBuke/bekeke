import { Resend } from 'resend';
import { createEmailTemplate, createInfoBox } from './email-template';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // Initialize Resend client inside the function to avoid build-time issues
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Email error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email template funkcije
export const emailTemplates = {
  newBooking: (providerName: string, clientName: string, service: string, date: string, time: string, isEmergency: boolean) => {
    const emergencyInfo = isEmergency ? createInfoBox(
      '<p style="color: #dc2626; font-weight: bold; margin: 0;">🚨 HITNA INTERVENCIJA</p>',
      'error'
    ) : '';
    
    const content = `
      <p>Poštovani ${providerName},</p>
      <p>Imate novi zahtjev za uslugu:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Klijent:</strong> ${clientName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
      </div>
      ${emergencyInfo}
      <p>Molimo prihvatite ili odbijte zahtjev u vašem dashboardu.</p>
    `;
    
    return createEmailTemplate({
      title: 'Novi zahtjev za uslugu!',
      content,
      ctaText: 'Pogledaj zahtjev',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/partner`
    });
  },
  
  bookingAccepted: (clientName: string, providerName: string, service: string, date: string, time: string) => {
    const content = `
      <p>Poštovani ${clientName},</p>
      <p>Pružatelj <strong>${providerName}</strong> je prihvatio vaš zahtjev za uslugu <strong>${service}</strong>.</p>
      ${createInfoBox(`
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
      `, 'success')}
      <p>Molimo dovršite plaćanje kako biste potvrdili booking.</p>
    `;
    
    return createEmailTemplate({
      title: 'Vaš zahtjev je prihvaćen!',
      content,
      ctaText: 'Plati sada',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/klijent`
    });
  },
  
  bookingRejected: (clientName: string, providerName: string, service: string, date: string, rejectionReason?: string) => {
    const reasonInfo = rejectionReason ? createInfoBox(
      `<p><strong>Razlog:</strong> ${rejectionReason}</p>`,
      'error'
    ) : '';
    
    const content = `
      <p>Poštovani ${clientName},</p>
      <p>Nažalost, pružatelj <strong>${providerName}</strong> nije mogao prihvatiti vaš zahtjev za uslugu <strong>${service}</strong> za ${date}.</p>
      ${reasonInfo}
      <p>Možete pronaći druge pružatelje usluga na našoj platformi.</p>
    `;
    
    return createEmailTemplate({
      title: 'Zahtjev je odbijen',
      content,
      ctaText: 'Pretraži druge pružatelje',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/usluge`
    });
  },
  
  providerVerified: (providerName: string, onboardingLink: string) => {
    const content = `
      <p>Poštovani ${providerName},</p>
      <p>Čestitamo! Vaš profil je uspješno verificiran od strane administratora. Sada možete primati zahtjeve za usluge.</p>
      ${createInfoBox(`
        <p><strong>Sljedeći korak:</strong> Povežite svoj Stripe račun za primanje plaćanja.</p>
      `, 'success')}
      <p>Ili pristupite vašem dashboardu:</p>
    `;
    
    return createEmailTemplate({
      title: 'Vaš profil je verificiran!',
      content,
      ctaText: 'Poveži Stripe račun',
      ctaUrl: onboardingLink,
      footerText: `Ili pristupite vašem dashboardu: ${process.env.NEXT_PUBLIC_APP_URL}/partner`
    });
  },
  
  providerRejected: (providerName: string, rejectionReason?: string) => {
    const reasonInfo = rejectionReason ? createInfoBox(
      `<p><strong>Razlog:</strong> ${rejectionReason}</p>`,
      'error'
    ) : '';
    
    const content = `
      <p>Poštovani ${providerName},</p>
      <p>Nažalost, vaš profil nije mogao biti verificiran od strane administratora.</p>
      ${reasonInfo}
      <p>Možete kontaktirati našu podršku ako imate pitanja ili želite ponovno podnijeti zahtjev.</p>
    `;
    
    return createEmailTemplate({
      title: 'Profil nije odobren',
      content,
      ctaText: 'Kontaktiraj podršku',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contact`
    });
  },
  
  paymentSuccessClient: (clientName: string, providerName: string, service: string, date: string, time: string, amount: number) => {
    const content = `
      <p>Poštovani ${clientName},</p>
      <p>Vaše plaćanje je uspješno obrađeno. Booking je potvrđen!</p>
      ${createInfoBox(`
        <p><strong>Pružatelj:</strong> ${providerName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
        <p><strong>Iznos:</strong> ${amount.toFixed(2)}€</p>
      `, 'success')}
      <p>Pružatelj će vas kontaktirati prije termina. Možete pregledati sve svoje bookinge u dashboardu.</p>
    `;
    
    return createEmailTemplate({
      title: 'Plaćanje uspješno!',
      content,
      ctaText: 'Moji bookingi',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/klijent`
    });
  },
  
  paymentSuccessProvider: (providerName: string, clientName: string, service: string, date: string, time: string, amount: number, providerAmount: number) => {
    const content = `
      <p>Poštovani ${providerName},</p>
      <p>Klijent je uspješno platio vašu uslugu. Booking je potvrđen!</p>
      ${createInfoBox(`
        <p><strong>Klijent:</strong> ${clientName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
        <p><strong>Ukupno plaćeno:</strong> ${amount.toFixed(2)}€</p>
        <p><strong>Vaš iznos:</strong> ${providerAmount.toFixed(2)}€</p>
      `, 'success')}
      <p>Kontaktirajte klijenta prije termina. Novac će biti prebačen na vaš račun u roku od 2-3 radna dana.</p>
    `;
    
    return createEmailTemplate({
      title: 'Novo plaćanje primljeno!',
      content,
      ctaText: 'Pružatelj Dashboard',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/partner`
    });
  },

  // New email templates for password reset and welcome
  passwordReset: (userName: string, resetUrl: string) => {
    const content = `
      <p>Poštovani ${userName},</p>
      <p>Primili smo zahtjev za resetiranje lozinke za vaš račun.</p>
      <p>Kliknite na gumb ispod kako biste postavili novu lozinku:</p>
      ${createInfoBox(`
        <p><strong>Važno:</strong> Link za resetiranje je valjan 24 sata.</p>
        <p>Ako niste zatražili resetiranje lozinke, zanemarite ovaj email.</p>
      `, 'warning')}
    `;
    
    return createEmailTemplate({
      title: 'Resetiranje lozinke',
      content,
      ctaText: 'Postavi novu lozinku',
      ctaUrl: resetUrl,
      footerText: 'Ako gumb ne radi, kopirajte i zalijepite ovaj link u svoj preglednik: ' + resetUrl
    });
  },

  welcomeClient: (clientName: string) => {
    const content = `
      <p>Poštovani ${clientName},</p>
      <p>Dobrodošli na Uslugo! Vaš račun je uspješno kreiran.</p>
      <p>Sada možete:</p>
      <ul>
        <li>Pretraživati provjerene majstore u vašem gradu</li>
        <li>Slati zahtjeve za usluge</li>
        <li>Pratiti sve svoje bookinge</li>
        <li>Ostavljati recenzije</li>
      </ul>
    `;
    
    return createEmailTemplate({
      title: 'Dobrodošli na Uslugo!',
      content,
      ctaText: 'Počni pretraživati',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/usluge`,
      footerText: 'Ako imate pitanja, kontaktirajte našu podršku.'
    });
  },

  welcomeProvider: (providerName: string) => {
    const content = `
      <p>Poštovani ${providerName},</p>
      <p>Dobrodošli na Uslugo kao pružatelj usluga!</p>
      <p>Vaš profil je kreiran i čeka verifikaciju od strane administratora.</p>
      ${createInfoBox(`
        <p><strong>Sljedeći koraci:</strong></p>
        <ul>
          <li>Administrator će pregledati vaš profil</li>
          <li>Nakon verifikacije, moći ćete primati zahtjeve</li>
          <li>Povezati Stripe račun za primanje plaćanja</li>
        </ul>
      `, 'info')}
      <p>Proces verifikacije obično traje 1-2 radna dana.</p>
    `;
    
    return createEmailTemplate({
      title: 'Dobrodošli kao pružatelj!',
      content,
      ctaText: 'Pregledaj profil',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/partner`,
      footerText: 'Ako imate pitanja o procesu verifikacije, kontaktirajte našu podršku.'
    });
  },
};
