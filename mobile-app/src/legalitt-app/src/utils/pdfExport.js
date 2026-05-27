import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export const exportFIRToPDF = async (draft) => {
  let logoBase64 = '';
  try {
    // Try to load the logo if it exists
    const logoUri = FileSystem.documentDirectory + 'logo.png'; 
    // Note: For production, we'd bundle this as an asset, but for local testing:
    const base64 = await FileSystem.readAsStringAsync(logoUri, { encoding: FileSystem.EncodingType.Base64 });
    logoBase64 = `data:image/png;base64,${base64}`;
  } catch (e) {
    console.log('Logo not found, using text header');
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 50px; 
            color: #1e293b; 
            line-height: 1.5;
          }
          
          .page-border {
            border: 4px solid #0d9488;
            padding: 30px;
            position: relative;
          }

          .header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0d9488; 
            padding-bottom: 15px; 
            margin-bottom: 40px; 
          }
          
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-img { width: 50px; height: 50px; object-fit: contain; }
          .brand { color: #0d9488; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .doc-type { text-align: right; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          
          .title-box { text-align: center; margin-bottom: 40px; }
          .main-title { font-size: 22px; font-weight: 700; color: #0f172a; text-decoration: underline; margin-bottom: 5px; }
          .ref-no { font-size: 11px; color: #94a3b8; }

          .section { margin-bottom: 25px; }
          .section-title { 
            background: #f1f5f9; 
            padding: 8px 12px; 
            font-size: 13px; 
            font-weight: 700; 
            color: #0d9488; 
            border-left: 4px solid #0d9488;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          
          .field-row { display: flex; margin-bottom: 8px; font-size: 13px; }
          .field-label { font-weight: 700; width: 150px; color: #475569; }
          .field-value { flex: 1; color: #1e293b; }

          .content-box { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            padding: 20px; 
            font-size: 14px; 
            color: #334155; 
            white-space: pre-wrap; 
            margin-top: 10px;
            font-style: italic;
          }

          .footer { 
            margin-top: 60px; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px; 
            color: #94a3b8; 
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(13, 148, 136, 0.03);
            font-weight: 900;
            z-index: -1;
            pointer-events: none;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="page-border">
          <div class="watermark">LEGALITT</div>
          
          <div class="header">
            <div class="logo-box">
              ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : ''}
              <div class="brand">LEGALITT<span style="color:#0f172a">.AI</span></div>
            </div>
            <div class="doc-type">
              Draft ID: ${draft._id.toString().slice(-8).toUpperCase()}<br/>
              Status: Draft Consultation
            </div>
          </div>

          <div class="title-box">
            <div class="main-title">FIRST INFORMATION REPORT (DRAFT)</div>
            <div class="ref-no">Generated on ${new Date(draft.createdAt).toLocaleString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Incident Information</div>
            <div class="field-row">
              <span class="field-label">Incident Type:</span>
              <span class="field-value">${draft.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Date & Time:</span>
              <span class="field-value">${draft.incident.date} at ${draft.incident.time}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Location:</span>
              <span class="field-value">${draft.incident.location}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Drafted FIR Content</div>
            <div class="content-box">
              ${draft.aiDraft}
            </div>
          </div>

          <p style="font-size: 11px; color: #ef4444; margin-top: 30px; font-weight: 600;">
            ⚠️ LEGAL DISCLAIMER: This document is a draft generated for guidance purposes only. 
            It is NOT a registered FIR. Please visit the nearest police station with this draft 
            to file a formal complaint.
          </p>

          <div class="footer">
            <div>Generated via Legalitt AI Assistant</div>
            <div>&copy; ${new Date().getFullYear()} legalitt.com</div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};
