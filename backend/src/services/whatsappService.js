// src/services/whatsappService.js
// WhatsApp Business messaging via MSG91
// Templates must be pre-approved by WhatsApp Business API

const axios = require('axios');
const logger = require('../utils/logger');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER; // Your registered WhatsApp Business number

/**
 * Send WhatsApp message via MSG91 API
 */
const sendWhatsAppMessage = async ({ phone, templateName, variables = [] }) => {
  if (!MSG91_AUTH_KEY || !WHATSAPP_NUMBER) {
    logger.warn('[WhatsApp] MSG91_AUTH_KEY or MSG91_WHATSAPP_NUMBER not configured. Skipping WhatsApp send.');
    return { success: false, reason: 'WhatsApp not configured' };
  }

  // Normalize phone: ensure 91 prefix for India
  let normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = '91' + normalizedPhone.slice(1);
  if (!normalizedPhone.startsWith('91')) normalizedPhone = '91' + normalizedPhone;

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      {
        integrated_number: WHATSAPP_NUMBER,
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp',
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: variables.length > 0 ? [{
              type: 'body',
              parameters: variables.map(v => ({ type: 'text', text: String(v) })),
            }] : [],
          },
          to: normalizedPhone,
        },
      },
      {
        headers: {
          authkey: MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    logger.info(`[WhatsApp] Sent '${templateName}' to ${normalizedPhone} | Status: ${response.data?.message}`);
    return { success: true, data: response.data };
  } catch (err) {
    logger.error(`[WhatsApp] Failed to send to ${normalizedPhone}:`, err.response?.data || err.message);
    return { success: false, reason: err.message };
  }
};

/**
 * Notify nearby advocates about a new legal advice request in their city
 * Template: "new_legal_request" 
 * Variables: [city, consultationMode]
 * Message: "New legal advice request in {{1}} for {{2}} consultation. Open Legalitt app to view & accept."
 */
const notifyNearbyAdvocates = async ({ advocates = [], city, consultationMode, bookingId }) => {
  const results = [];
  for (const advocate of advocates) {
    if (!advocate?.user?.phone) continue;
    
    const result = await sendWhatsAppMessage({
      phone: advocate.user.phone,
      templateName: 'legalitt_new_request', // Pre-approved template name
      variables: [city || 'your city', consultationMode || 'chat'],
    });
    results.push({ advocateId: advocate._id, phone: advocate.user.phone, ...result });
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  logger.info(`[WhatsApp] Notified ${results.filter(r => r.success).length}/${results.length} nearby advocates`);
  return results;
};

/**
 * Notify assigned advocate about their new booking
 * Template: "advocate_assigned"
 * Variables: [advocateName, clientName, consultationMode]
 * Message: "Hi {{1}}, you've been assigned a legal consultation with {{2}} via {{3}}. Open Legalitt app for details."
 */
const notifyAdvocateAssigned = async ({ phone, advocateName, clientName, consultationMode, bookingId }) => {
  return sendWhatsAppMessage({
    phone,
    templateName: 'legalitt_advocate_assigned',
    variables: [advocateName, clientName, consultationMode || 'chat'],
  });
};

/**
 * Notify client that their advocate has been assigned
 * Template: "client_advocate_assigned"
 * Variables: [clientName, advocateName]
 * Message: "Hi {{1}}, advocate {{2}} has been assigned to your legal request. Open Legalitt to start chatting."
 */
const notifyClientAdvocateAssigned = async ({ phone, clientName, advocateName }) => {
  return sendWhatsAppMessage({
    phone,
    templateName: 'legalitt_client_assigned',
    variables: [clientName, advocateName],
  });
};

module.exports = {
  notifyNearbyAdvocates,
  notifyAdvocateAssigned,
  notifyClientAdvocateAssigned,
  sendWhatsAppMessage,
};
