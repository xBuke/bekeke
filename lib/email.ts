import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
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
  newBooking: (providerName: string, clientName: string, service: string, date: string, time: string, isEmergency: boolean) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Novi zahtjev za uslugu!</h2>
      <p>Poštovani ${providerName},</p>
      <p>Imate novi zahtjev za uslugu:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Klijent:</strong> ${clientName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
        ${isEmergency ? '<p style="color: #dc2626; font-weight: bold;">🚨 HITNA INTERVENCIJA</p>' : ''}
      </div>
      <p>Molimo prihvatite ili odbijte zahtjev u vašem dashboardu.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Pogledaj zahtjev
      </a>
    </div>
  `,
  
  bookingAccepted: (clientName: string, providerName: string, service: string, date: string, time: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">Vaš zahtjev je prihvaćen!</h2>
      <p>Poštovani ${clientName},</p>
      <p>Pružatelj <strong>${providerName}</strong> je prihvatio vaš zahtjev za uslugu <strong>${service}</strong>.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
      </div>
      <p>Molimo dovršite plaćanje kako biste potvrdili booking.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/klijent" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Plati sada
      </a>
    </div>
  `,
  
  bookingRejected: (clientName: string, providerName: string, service: string, date: string, rejectionReason?: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Zahtjev je odbijen</h2>
      <p>Poštovani ${clientName},</p>
      <p>Nažalost, pružatelj <strong>${providerName}</strong> nije mogao prihvatiti vaš zahtjev za uslugu <strong>${service}</strong> za ${date}.</p>
      ${rejectionReason ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Razlog:</strong> ${rejectionReason}</p>
        </div>
      ` : ''}
      <p>Možete pronaći druge pružatelje usluga na našoj platformi.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/usluge" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Pretraži druge pružatelje
      </a>
    </div>
  `,
  
  providerVerified: (providerName: string, onboardingLink: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">Vaš profil je verificiran!</h2>
      <p>Poštovani ${providerName},</p>
      <p>Čestitamo! Vaš profil je uspješno verificiran od strane administratora. Sada možete primati zahtjeve za usluge.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <p><strong>Sljedeći korak:</strong> Povežite svoj Stripe račun za primanje plaćanja.</p>
      </div>
      <a href="${onboardingLink}" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Poveži Stripe račun
      </a>
      <p style="margin-top: 20px;">Ili pristupite vašem dashboardu:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
        Pružatelj Dashboard
      </a>
    </div>
  `,
  
  providerRejected: (providerName: string, rejectionReason?: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Profil nije odobren</h2>
      <p>Poštovani ${providerName},</p>
      <p>Nažalost, vaš profil nije mogao biti verificiran od strane administratora.</p>
      ${rejectionReason ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Razlog:</strong> ${rejectionReason}</p>
        </div>
      ` : ''}
      <p>Možete kontaktirati našu podršku ako imate pitanja ili želite ponovno podnijeti zahtjev.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Kontaktiraj podršku
      </a>
    </div>
  `,
  
  paymentSuccessClient: (clientName: string, providerName: string, service: string, date: string, time: string, amount: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">Plaćanje uspješno!</h2>
      <p>Poštovani ${clientName},</p>
      <p>Vaše plaćanje je uspješno obrađeno. Booking je potvrđen!</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <p><strong>Pružatelj:</strong> ${providerName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
        <p><strong>Iznos:</strong> ${amount.toFixed(2)}€</p>
      </div>
      <p>Pružatelj će vas kontaktirati prije termina. Možete pregledati sve svoje bookinge u dashboardu.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/klijent" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Moji bookingi
      </a>
    </div>
  `,
  
  paymentSuccessProvider: (providerName: string, clientName: string, service: string, date: string, time: string, amount: number, providerAmount: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">Novo plaćanje primljeno!</h2>
      <p>Poštovani ${providerName},</p>
      <p>Klijent je uspješno platio vašu uslugu. Booking je potvrđen!</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <p><strong>Klijent:</strong> ${clientName}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>
        <p><strong>Ukupno plaćeno:</strong> ${amount.toFixed(2)}€</p>
        <p><strong>Vaš iznos:</strong> ${providerAmount.toFixed(2)}€</p>
      </div>
      <p>Kontaktirajte klijenta prije termina. Novac će biti prebačen na vaš račun u roku od 2-3 radna dana.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Pružatelj Dashboard
      </a>
    </div>
  `,
};
