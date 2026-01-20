import * as brevo from "@getbrevo/brevo";

function initializeBrevoClient() {
  const apiKey = process.env.NEXT_BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Brevo API key: NEXT_BREVO_API_KEY");
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return apiInstance;
}

export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  const apiInstance = initializeBrevoClient();
  const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
  const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Wove";

  if (!senderEmail) {
    throw new Error("Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL");
  }

  const recipients = to.split(",").map(email => ({ email: email.trim() }));

  const brevoAttachments = attachments.map(file => ({
    name: file.filename,
    content: Buffer.from(file.content).toString("base64"), // ✅ REQUIRED
  }));

  const sendSmtpEmail = {
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: recipients,
    subject,
    htmlContent: html,
    textContent: text,
    attachment: brevoAttachments.length ? brevoAttachments : undefined,
  };

  const { body } = await apiInstance.sendTransacEmail(sendSmtpEmail);
  return body;
}
