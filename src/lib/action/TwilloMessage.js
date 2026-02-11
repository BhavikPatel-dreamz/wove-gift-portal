"use server";

import twilio from "twilio";
import * as brevo from "@getbrevo/brevo";

// ==================== CUSTOM ERROR CLASSES ====================
// class MessageServiceError extends Error {
//   constructor(message, service, originalError) {
//     super(message);
//     this.name = "MessageServiceError";
//     this.service = service;
//     this.originalError = originalError;
//     this.statusCode = 500;
//   }
// }

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
    this.statusCode = 500;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

// ==================== SERVICE INITIALIZATION ====================
function initializeTwilioClient() {
  const accountSid = process.env.NEXT_TWILIO_ACCOUNT_SID;
  const authToken = process.env.NEXT_TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new ConfigurationError(
      "Missing Twilio credentials: NEXT_TWILIO_ACCOUNT_SID or NEXT_TWILIO_AUTH_TOKEN"
    );
  }

  return twilio(accountSid, authToken);
}

function initializeBrevoClient() {
  const apiKey = process.env.NEXT_BREVO_API_KEY;

  if (!apiKey) {
    throw new ConfigurationError("Missing Brevo API key: NEXT_BREVO_API_KEY");
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return apiInstance;
}

// ==================== VALIDATION FUNCTIONS ====================
function formatPhoneNumber(number, countryCode = "+91") {
  if (!number) {
    return null;
  }
  // Remove common formatting characters.
  let cleanedNumber = number.toString().replace(/[\s()\-]/g, "");

  // If the number doesn't start with a '+', it's a local number.
  if (!cleanedNumber.startsWith("+")) {
    // remove any leading zeros for local numbers before adding country code.
    cleanedNumber = cleanedNumber.replace(/^0+/, "");
    const code = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
    cleanedNumber = `${code}${cleanedNumber}`;
  }

  return cleanedNumber;
}

function validateWhatsAppInput(data) {
  if (!data?.deliveryDetails?.recipientWhatsAppNumber) {
    throw new ValidationError("Recipient WhatsApp number is required");
  }

  if (!data?.selectedAmount?.value) {
    throw new ValidationError("Gift amount is required");
  }

  const recipientNumber = formatPhoneNumber(
    data.deliveryDetails.recipientWhatsAppNumber,
    data.deliveryDetails.recipientCountryCode
  );

  if (!recipientNumber) {
    throw new ValidationError("Invalid recipient WhatsApp number");
  }

  const whatsappNumber = `whatsapp:${recipientNumber}`;

  const senderNumber = process.env.NEXT_TWILIO_WHATSAPP_NUMBER;
  if (!senderNumber) {
    throw new ConfigurationError(
      "Missing Twilio WhatsApp number: NEXT_TWILIO_WHATSAPP_NUMBER"
    );
  }

  return { whatsappNumber, senderNumber };
}

function validateEmailInput(data) {
  if (!data?.deliveryDetails?.recipientEmailAddress) {
    throw new ValidationError("Recipient email address is required");
  }

  if (!data?.selectedAmount?.value) {
    throw new ValidationError("Gift amount is required");
  }

  const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
  if (!senderEmail) {
    throw new ConfigurationError(
      "Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL"
    );
  }

  return { senderEmail };
}

// ==================== HELPER FUNCTIONS ====================
function isValidMediaUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === "https:" &&
      urlObj.hostname !== "localhost" &&
      !urlObj.hostname.startsWith("192.168.")
    );
  } catch {
    return false;
  }
}

function getAbsoluteUrl(relativeUrl) {
  if (!relativeUrl) return null;

  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  if (relativeUrl.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.warn("No NEXT_PUBLIC_BASE_URL configured for relative image path");
      return null;
    }

    const fullBaseUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    return `${fullBaseUrl}${relativeUrl}`;
  }

  return null;
}

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug ? `https://${selectedBrand.slug}.myshopify.com` : null);

  if (!claimUrl) {
    throw new ValidationError("Brand website or domain not configured");
  }

  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

// ==================== WHATSAPP MESSAGE BUILDER ====================
function buildWhatsAppTemplateVariables(data, giftCard) {
  const friendName = data?.deliveryDetails?.yourName || "A Friend";
  const recipientName = data?.deliveryDetails?.recipientName || "You";
  const currency = data?.selectedAmount?.currency || "₹";
  const amount = data?.selectedAmount?.value || "100";
  const personalMessage = data?.personalMessage || "";
  const giftCode = giftCard?.code || "XXXX XXXX XXXX";
  const brandName = data?.selectedBrand?.brandName || "Brand";

  return {
    "1": friendName,
    "2": recipientName,
    "3": `${currency} ${amount}`,
    "4": personalMessage,
    "5": giftCode,
    "6": brandName,
  };
}

function buildWhatsAppTextMessage(data, giftCard) {
  const friendName = data?.deliveryDetails?.yourName || "A Friend";
  const currency = data?.selectedAmount?.currency || "₹";
  const amount = data?.selectedAmount?.value || "100";
  const personalMessage = data?.personalMessage || "";
  const giftCode = giftCard?.code || "XXXX XXXX XXXX";
 // const brandName = data?.selectedBrand?.brandName || "Brand";
  const claimUrl = getClaimUrl(data?.selectedBrand);

  let messageBody = `*${friendName} Sent you a gift card*\n\n`;
  messageBody += `*${currency} ${amount}*\n`;

  if (personalMessage) {
    messageBody += `_"${personalMessage}"_\n\n`;
  }

  messageBody += `🎁 *Gift Code*\n`;
  messageBody += `${giftCode}\n\n`;
  messageBody += `────────────────────\n\n`;
  messageBody += `*Claim Your Gift* 👇\n${claimUrl}`;

  return messageBody;
}

// ==================== WHATSAPP SERVICE ====================
export const SendWhatsappMessages = async (data, giftCard) => {
  const LOG_PREFIX = "[WHATSAPP_SERVICE]";

  try {
    console.info(`${LOG_PREFIX} Incoming request`, {
      hasData: !!data,
      hasGiftCard: !!giftCard,
      shop: data?.shop,
      category: data?.selectedSubCategory?.name,
    });

    /* ----------------------------- Step 1: Validate input ----------------------------- */
    const { whatsappNumber, senderNumber } = validateWhatsAppInput(data);

    console.info(`${LOG_PREFIX} Validation successful`, {
      to: maskPhone(whatsappNumber),
      from: maskPhone(senderNumber),
    });

    /* --------------------------- Step 2: Initialize Twilio ---------------------------- */
    const client = initializeTwilioClient();

    if (!client) {
      throw new ConfigurationError("Twilio client initialization failed");
    }

    /* --------------------------- Step 3: Resolve Content SID --------------------------- */
    const contentSid = process.env.NEXT_TWILIO_CONTENT_SID;
    let message;

    if (contentSid && contentSid !== "HX...") {
      console.info(`${LOG_PREFIX} Sending WhatsApp via template`, {
        contentSid,
      });

      const templateVariables = buildWhatsAppTemplateVariables(data, giftCard);

      console.debug(`${LOG_PREFIX} Template variables`, templateVariables);

      message = await client.messages.create({
        contentSid,
        from: senderNumber,
        to: whatsappNumber,
        contentVariables: JSON.stringify(templateVariables),
      });
    } else {
      console.info(`${LOG_PREFIX} Sending WhatsApp via text/media`);

      const messageBody = buildWhatsAppTextMessage(data, giftCard);
      const mediaUrl = getAbsoluteUrl(data?.selectedSubCategory?.image);

      const messagePayload = {
        from: senderNumber,
        to: whatsappNumber,
        body: messageBody,
      };

      if (mediaUrl && isValidMediaUrl(mediaUrl)) {
        messagePayload.mediaUrl = [mediaUrl];
      } else if (mediaUrl) {
        console.warn(`${LOG_PREFIX} Invalid media URL skipped`, mediaUrl);
      }

      console.debug(`${LOG_PREFIX} Message payload`, {
        ...messagePayload,
        to: maskPhone(messagePayload.to),
        from: maskPhone(messagePayload.from),
      });

      message = await client.messages.create(messagePayload);
    }

    console.info(`${LOG_PREFIX} Message sent successfully`, {
      sid: message.sid,
      status: message.status,
      to: maskPhone(whatsappNumber),
    });

    return {
      success: true,
      data: {
        service: "whatsapp",
        messageSid: message.sid,
        to: whatsappNumber,
        from: senderNumber,
        status: message.status,
      },
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Message failed`, {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      moreInfo: error?.moreInfo,
    });

    return normalizeWhatsAppError(error);
  }
};

const maskPhone = (phone = "") =>
  phone.replace(/(\+\d{2})\d{6}(\d{2})/, "$1******$2");

const normalizeWhatsAppError = (error) => {
  if (error instanceof ValidationError || error instanceof ConfigurationError) {
    return {
      success: false,
      service: "whatsapp",
      error: error.message,
      errorType: error.name,
      statusCode: error.statusCode || 400,
    };
  }

  // Twilio-specific error
  if (error?.code && error?.moreInfo) {
    return {
      success: false,
      service: "whatsapp",
      error: error.message,
      errorType: "TwilioError",
      statusCode: error.status || 502,
      twilioCode: error.code,
      moreInfo: error.moreInfo,
    };
  }

  return {
    success: false,
    service: "whatsapp",
    error: "WhatsApp delivery failed",
    errorType: "MessageServiceError",
    statusCode: 500,
    originalError: error?.message,
  };
};


// ==================== EMAIL TEMPLATE BUILDER ====================
function buildEmailHtmlContent(data, giftCard) {
  const friendName = data?.deliveryDetails?.yourName || "A Friend";
  const recipientName = data?.deliveryDetails?.recipientName || "You";
  const currency = data?.selectedAmount?.currency || "₹";
  const amount = data?.selectedAmount?.value || "100";
  const personalMessage = data?.personalMessage || "";
  const giftCode = giftCard?.code || "XXXX-XXX-XXX";
  const brandName = data?.selectedBrand?.brandName || "Brand";
  const claimUrl = getClaimUrl(data?.selectedBrand);

  const brandLogoUrl = getAbsoluteUrl(data?.selectedBrand?.logo);
  const giftCardImageUrl = getAbsoluteUrl(data?.selectedSubCategory?.image);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">You have received a Gift card!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">hi ${recipientName.toLowerCase()},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">Congratulations, you've received gift card from ${friendName}.</p>
              
              ${personalMessage ? `<div style="margin-bottom: 32px;"><p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.6;">"${personalMessage}"</p></div>` : ''}
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${giftCardImageUrl ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px; display: block;">` : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #00d4ff 0%, #00a8ff 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;"><h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2></div>`}
                  </td>
                  
                  <td style="width: 40%; vertical-align: top;">
                    ${brandLogoUrl ? `<div style="margin-bottom: 20px;"><img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 80px; height: auto; display: block;"></div>` : `<div style="margin-bottom: 20px;"><h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #e50914;">${brandName}</h3></div>`}
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Gift Code</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a; letter-spacing: 0.5px;">${giftCode}</p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${currency}${amount}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display: inline-block; padding: 14px 0; width: 100%; max-width: 400px; background: linear-gradient(90deg, #ff6b9d 0%, #ff8f6b 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);">Redeem Now →</a>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">Click the button above to redeem your gift card<br>Or visit: <a href="${claimUrl}" style="color: #ff6b9d; text-decoration: none;">${claimUrl}</a></p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">This gift card was sent to you by ${friendName}.<br>If you have any questions, please contact our support team.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailTextContent(data, giftCard) {
  const friendName = data?.deliveryDetails?.yourName || "A Friend";
  const recipientName = data?.deliveryDetails?.recipientName || "You";
  const currency = data?.selectedAmount?.currency || "₹";
  const amount = data?.selectedAmount?.value || "100";
  const personalMessage = data?.personalMessage || "";
  const giftCode = giftCard?.code || "XXXX-XXX-XXX";
  const brandName = data?.selectedBrand?.brandName || "Brand";
  const claimUrl = getClaimUrl(data?.selectedBrand);

  return `You have received a Gift card!

hi ${recipientName.toLowerCase()},
Congratulations, you've received gift card from ${friendName}.

${personalMessage ? `"${personalMessage}"\n` : ''}
${brandName}

Gift Code: ${giftCode}
Amount: ${currency}${amount}

Redeem Now: ${claimUrl}

This gift card was sent to you by ${friendName}.`;
}

// ==================== EMAIL SERVICE ====================
export const SendGiftCardEmail = async (data, giftCard) => {
  try {

    // Step 1: Validate input
    validateEmailInput(data);

    console.log("data",data)

    // Step 2: Initialize Brevo
    const apiInstance = initializeBrevoClient();
    const { senderEmail } = validateEmailInput(data);

    const recipientEmail = data?.deliveryDetails?.recipientEmailAddress;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";
    const recipientName = data?.deliveryDetails?.recipientName || "Recipient";

    if (!recipientEmail) {
      throw new ValidationError("Recipient email address is required");
    }

    // Step 3: Check for Brevo template
    const templateId = process.env.NEXT_BREVO_TEMPLATE_ID;

    let sendSmtpEmail;

    if (templateId && templateId !== "YOUR_TEMPLATE_ID") {
      // Method 1: Using Brevo Dynamic Template

      const currency = data?.selectedAmount?.currency || "₹";
      const amount = data?.selectedAmount?.value || "100";
      const personalMessage = data?.personalMessage || "";
      const giftCode = giftCard?.code || "XXXX-XXX-XXX";
      const brandName = data?.selectedBrand?.brandName || "Brand";
      const claimUrl = getClaimUrl(data?.selectedBrand);
      const brandLogoUrl = getAbsoluteUrl(data?.selectedBrand?.logo);
      const giftCardImageUrl = getAbsoluteUrl(data?.selectedSubCategory?.image);
      const friendName = data?.deliveryDetails?.yourName || "A Friend";

      sendSmtpEmail = {
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName,
          },
        ],
        templateId: parseInt(templateId),
        params: {
          friendName,
          recipientName,
          amount: `${currency}${amount}`,
          personalMessage,
          giftCode,
          brandName,
          claimUrl,
          brandLogoUrl: brandLogoUrl || "",
          giftCardImageUrl: giftCardImageUrl || "",
          currency,
          amountValue: amount,
        },
      };
    } else {
      // Method 2: Custom HTML email

      sendSmtpEmail = {
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName,
          },
        ],
        subject: `🎁 ${data?.deliveryDetails?.yourName || "A Friend"} sent you a ${data?.selectedAmount?.currency || "₹"}${data?.selectedAmount?.value || "100"} gift card!`,
        textContent: buildEmailTextContent(data, giftCard),
        htmlContent: buildEmailHtmlContent(data, giftCard),
      };
    }

    // Step 4: Send email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);


    return {
      success: true,
      data: {
        service: "email",
        messageId: response.messageId,
        to: recipientEmail,
        from: senderEmail,
      },
    };
  } catch (error) {
    console.error("❌ Email send failed:", error);

    if (error instanceof ValidationError) {
      throw {
        success: false,
        error: error.message,
        errorType: error.name,
        statusCode: error.statusCode,
        service: "email",
      };
    } else if (error instanceof ConfigurationError) {
      throw {
        success: false,
        error: error.message,
        errorType: error.name,
        statusCode: error.statusCode,
        service: "email",
      };
    } else if (error.response?.body) {
      // Brevo API error
      throw {
        success: false,
        error: error.response.body.message || "Email delivery failed",
        errorType: "BrevoAPIError",
        statusCode: error.response.code || 500,
        service: "email",
        originalError: error.message,
      };
    } else {
      throw {
        success: false,
        error: `Email delivery failed: ${error.message}`,
        errorType: "MessageServiceError",
        statusCode: 500,
        service: "email",
        originalError: error.message,
      };
    }
  }
};