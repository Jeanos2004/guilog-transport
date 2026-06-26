import { Resend } from 'resend';

// Initialize Resend with API Key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Important: Resend requires a verified domain to send FROM.
// For testing/development, you must use 'onboarding@resend.dev' or verify a domain in the Resend dashboard.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const BRAND_NAME = "CFIG Guinée";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const emailHelper = {
  /**
   * Base generic send function
   */
  async sendEmail({ to, subject, html }: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent.");
      return null;
    }
    
    try {
      const { data, error } = await resend.emails.send({
        from: `${BRAND_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });
      if (error) {
        console.error("Resend API returned an error:", error);
        throw new Error(error.message);
      }
      return data;
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      throw error;
    }
  },

  /**
   * 1. Student Welcome Email (Autonomous Signup)
   */
  async sendWelcomeEmail(to: string, name: string) {
    const subject = `Bienvenue chez ${BRAND_NAME} !`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Bienvenue, ${name} ! 🎉</h2>
        <p>Nous sommes ravis de vous compter parmi nos étudiants chez <strong>${BRAND_NAME}</strong>.</p>
        <p>Votre compte a été créé avec succès. Vous pouvez dès à présent vous connecter pour consulter notre catalogue de formations et suivre votre progression.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cfig-guinee.com/student/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon espace</a>
        </div>
        <p style="font-size: 14px; color: #666;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>L'équipe ${BRAND_NAME}</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  },

  /**
   * 2. Devis / Admission Request Acknowledgment
   */
  async sendDevisAcknowledgment(to: string, name: string, courseDomain: string) {
    const subject = `Accusé de réception - Demande d'inscription / Devis`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Demande bien reçue ! 📩</h2>
        <p>Bonjour ${name},</p>
        <p>Nous vous confirmons la bonne réception de votre demande d'inscription / devis pour la formation : <strong>${courseDomain}</strong>.</p>
        <p>Notre équipe administrative étudie actuellement votre dossier et vous recontactera dans les plus brefs délais pour valider votre inscription.</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">Merci de votre confiance.</p>
        <p>L'équipe ${BRAND_NAME}</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  },

  /**
   * 3. Admin Conversion Email (Account + Temporary Password)
   */
  async sendAdminConversionEmail(to: string, name: string, tempPassword: string, courseName: string) {
    const subject = `Votre compte étudiant a été activé !`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #10B981;">Félicitations, ${name} ! 🎓</h2>
        <p>Votre demande d'inscription pour la formation <strong>${courseName}</strong> a été validée par notre administration.</p>
        <p>Votre compte étudiant officiel a été généré. Voici vos identifiants temporaires de connexion :</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>E-mail :</strong> ${to}</p>
          <p style="margin: 5px 0;"><strong>Mot de passe :</strong> <code>${tempPassword}</code></p>
        </div>

        <p style="color: #DC2626; font-size: 13px;"><em>Veuillez modifier votre mot de passe dès votre première connexion pour des raisons de sécurité.</em></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cfig-guinee.com/student/login" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter</a>
        </div>
        
        <p>L'équipe ${BRAND_NAME}</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  },

  /**
   * 4. Invoice Payment Email
   */
  async sendInvoiceEmail(to: string, name: string, courseName: string, amount: number) {
    const subject = `Confirmation de paiement et Facture`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Paiement reçu avec succès ! 🧾</h2>
        <p>Bonjour ${name},</p>
        <p>Nous vous confirmons l'enregistrement de votre paiement pour la formation : <strong>${courseName}</strong>.</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Montant réglé :</strong> ${amount.toLocaleString()} GNF</p>
          <p style="margin: 5px 0;"><strong>Date :</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
        </div>

        <p>Vous pouvez retrouver votre facture officielle ainsi que l'historique complet de vos paiements en vous connectant à votre espace étudiant.</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">Merci pour votre paiement.</p>
        <p>L'équipe ${BRAND_NAME}</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  },
  
  /**
   * 5. New Admin Credentials Email
   */
  async sendNewAdminCredentials(to: string, tempPassword: string) {
    const subject = `Vos identifiants d'administration`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Bienvenue dans l'équipe ${BRAND_NAME} ! 🛡️</h2>
        <p>Un compte administrateur a été créé pour vous.</p>
        <p>Voici vos identifiants temporaires de connexion :</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>E-mail :</strong> ${to}</p>
          <p style="margin: 5px 0;"><strong>Mot de passe :</strong> <code>${tempPassword}</code></p>
        </div>

        <p style="color: #DC2626; font-size: 13px;"><em>Veuillez modifier votre mot de passe dès que possible.</em></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cfig-guinee.com/admin" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder au Tableau de Bord</a>
        </div>
        
        <p>L'équipe ${BRAND_NAME}</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }
};
