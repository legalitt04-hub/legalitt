/**
 * ============================================================================
 * DEVELOPMENT / DEMO MOCK DATA ONLY — DO NOT USE IN PRODUCTION
 * ============================================================================
 * File: src/data/legalNoticeResponseMock.js
 * Purpose: Centralized mock dataset for the Legal Notice Response workflow
 * in the Advocate Panel (UI testing, state switching, and prototyping).
 * ============================================================================
 */

export const MOCK_LEGAL_NOTICE_STATES = {
  PENDING_RESPONSE: 'pending',
  DRAFT_SAVED: 'draft_saved',
  RESPONSE_READY: 'response_ready',
  SIGNED_RESPONSE_UPLOADED: 'signed_uploaded',
  SUBMITTED: 'submitted',
  SUBMISSION_FAILED: 'failed',
  NO_DOCUMENT: 'no_document',
  NO_RESPONSE_REQUIRED: 'no_response_required',
};

export const MOCK_LEGAL_NOTICE_CASE = {
  // Client Details
  client: {
    id: 'CLIENT-DEMO-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    isVerified: true,
  },

  // Case Details
  caseId: 'CASE-DEMO-001',
  caseTitle: 'Divorce Matter',
  noticeId: 'NOTICE-DEMO-001',
  requestDate: '13 Aug 2026',
  responseDue: '20 Aug 2026',
  receivedFrom: 'Client',
  receivedDate: 'Today',
  noticeType: 'Legal Notice',
  noticeSummary: 'Legal Notice regarding dissolution of marriage submitted by client. Requires structured formal response within statutory 7-day timeline.',

  // Documents
  originalNotice: {
    fileName: 'Divorce_Notice_Rahul.pdf',
    fileType: 'PDF',
    pages: 5,
    uploadedAt: 'Today',
    documentId: 'DOC-NOTICE-001',
  },

  signedResponse: {
    fileName: 'Rahul_Signature.pdf',
    fileType: 'PDF',
    fileSize: '2.5 MB',
    uploadedAt: 'Today',
    documentId: 'DOC-SIGN-001',
  },

  // Final Submission Record
  submission: {
    submittedBy: 'Adv. Ishan Tiwari',
    submittedDate: '13 Aug 2026, 5:30 PM',
    responseDocument: 'Response_Rahul_Sharma.pdf',
  },

  // Advocate Handling the Matter
  advocate: {
    name: 'Adv. Ishan Tiwari',
    barNumber: 'MP/2410/2016',
  },

  // Pre-populated Legal Response Draft Content
  initialDraftContent: `RESPONSE TO LEGAL NOTICE

Date :- 13 August 2026

To
(Name)
(Address)

Subject :- Response to Legal Notice dated 13 Aug 2026

Dear Sir/Madam,

In response to the reference legal notice, our client respectfully submits the following:

1. The contents of the notice have been reviewed carefully.

2. Our client reserves all rights and remedies available under applicable law.

3. The response is being provided based on the information and documents currently available.

4. Further clarification may be provided if required.

Respectfully submitted,

Adv. Ishan Tiwari`,

  // Mock AI Assisted Generated Draft
  aiGeneratedDraftContent: (clientName = 'Rahul Sharma', advocateName = 'Adv. Ishan Tiwari') =>
    `RESPONSE TO LEGAL NOTICE (AI ASSISTED DRAFT)

Date :- 13 August 2026

To
Counsel for the Opposite Party

Subject :- Rebuttal & Detailed Response to Divorce Notice

Dear Sir/Madam,

Under instructions from our client ${clientName}, we respond to your notice dated 13 Aug 2026 as follows:

1. All allegations of desertion or cruelty contained in the captioned notice are unequivocally denied as baseless.

2. Our client has consistently upheld all reciprocal responsibilities.

3. Our client reserves full legal rights to present complete documentation before the Family Court of competent jurisdiction.

Respectfully submitted,
${advocateName}`,
};

export default {
  MOCK_LEGAL_NOTICE_STATES,
  MOCK_LEGAL_NOTICE_CASE,
};
