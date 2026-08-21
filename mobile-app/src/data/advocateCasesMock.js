/**
 * ============================================================================
 * DEVELOPMENT / DEMO MOCK DATA ONLY — DO NOT USE IN PRODUCTION
 * ============================================================================
 * File: src/data/advocateCasesMock.js
 * Purpose: Centralized mock dataset for Today's Cases and Case Requests
 * in the Advocate Panel (UI testing, filtering, and workflow integration).
 * ============================================================================
 */

export const MOCK_ADVOCATE_CASES = {
  // ─── 1. TODAY'S CASES / APPOINTMENTS ───────────────────────────────────────
  todayCases: [
    {
      _id: 'CASE-DEMO-001',
      caseId: 'CASE-DEMO-001',
      bookingId: 'BOOKING-DEMO-001',
      type: 'video',
      isBooking: true,
      status: 'confirmed',
      issue: 'Divorce Matter',
      title: 'Divorce Matter',
      consultationType: 'Legal Consultation',
      date: new Date().toISOString(),
      timeSlot: {
        startTime: '4:00 PM',
        endTime: '4:30 PM',
      },
      payment: {
        amount: 1500,
        status: 'completed',
      },
      client: {
        _id: 'CLIENT-DEMO-001',
        id: 'CLIENT-DEMO-001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        city: 'Mumbai',
      },
      documents: [
        {
          _id: 'DOC-NOTICE-001',
          name: 'Divorce_Notice_Rahul.pdf',
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
      timeline: [
        {
          title: 'Case Request Received',
          date: '2026-08-21T10:00:00.000Z',
          status: 'completed',
          description: 'Client submitted Divorce Matter consultation request.',
        },
        {
          title: 'Consultation Scheduled',
          date: '2026-08-21T16:00:00.000Z',
          status: 'scheduled',
          description: 'Scheduled video legal consultation.',
        },
      ],
      notes: [],
    },
  ],

  // ─── 2. CASE REQUESTS (PENDING, ACCEPTED, REJECTED) ────────────────────────
  caseRequests: [
    // REQUEST 1 — PENDING (Rahul Sharma)
    {
      _id: 'REQUEST-DEMO-001',
      requestId: 'REQUEST-DEMO-001',
      caseId: 'CASE-DEMO-001',
      status: 'pending', // normalized: 'pending' | 'accepted' | 'rejected'
      issue: 'Divorce Matter',
      caseType: 'Divorce Matter',
      category: 'Family Law',
      description: 'Client has requested legal assistance regarding a divorce matter and requires review of the received legal notice.',
      requestDate: '21 Aug 2026',
      responseDue: '25 Aug 2026',
      priority: 'High',
      createdAt: '2026-08-21T09:30:00.000Z',
      isBooking: true,
      client: {
        _id: 'CLIENT-DEMO-001',
        id: 'CLIENT-DEMO-001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        city: 'Mumbai',
      },
      document: {
        documentId: 'NOTICE-DEMO-001',
        name: 'Divorce_Notice_Rahul.pdf',
        type: 'PDF',
        pages: 5,
        status: 'Available',
      },
      documents: [
        {
          _id: 'NOTICE-DEMO-001',
          name: 'Divorce_Notice_Rahul.pdf',
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },

    // REQUEST 2 — ACCEPTED (Priya Mehta)
    {
      _id: 'REQUEST-DEMO-002',
      requestId: 'REQUEST-DEMO-002',
      caseId: 'CASE-DEMO-002',
      status: 'accepted', // normalized: 'accepted'
      issue: 'Property Dispute',
      caseType: 'Property Dispute',
      category: 'Property Law',
      description: 'Partition suit and property boundary dispute consultation.',
      requestDate: '20 Aug 2026',
      responseDue: '27 Aug 2026',
      priority: 'Medium',
      createdAt: '2026-08-20T11:15:00.000Z',
      isBooking: true,
      client: {
        _id: 'CLIENT-DEMO-002',
        id: 'CLIENT-DEMO-002',
        name: 'Priya Mehta',
        email: 'priya.mehta@example.com',
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        city: 'Delhi',
      },
      document: {
        documentId: 'NOTICE-DEMO-002',
        name: 'Property_Notice_Priya.pdf',
        type: 'PDF',
        pages: 3,
        status: 'Available',
      },
      documents: [
        {
          _id: 'NOTICE-DEMO-002',
          name: 'Property_Notice_Priya.pdf',
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },

    // REQUEST 3 — REJECTED (Akash Verma)
    {
      _id: 'REQUEST-DEMO-003',
      requestId: 'REQUEST-DEMO-003',
      caseId: 'CASE-DEMO-003',
      status: 'rejected', // normalized: 'rejected'
      issue: 'Consumer Dispute',
      caseType: 'Consumer Dispute',
      category: 'Consumer Law',
      description: 'Defective consumer product and service claim dispute.',
      requestDate: '19 Aug 2026',
      responseDue: '26 Aug 2026',
      priority: 'Low',
      createdAt: '2026-08-19T14:45:00.000Z',
      isBooking: true,
      client: {
        _id: 'CLIENT-DEMO-003',
        id: 'CLIENT-DEMO-003',
        name: 'Akash Verma',
        email: 'akash.verma@example.com',
        phone: '+91 98222 33445',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        city: 'Bengaluru',
      },
      document: {
        documentId: 'NOTICE-DEMO-003',
        name: 'Consumer_Notice_Akash.pdf',
        type: 'PDF',
        pages: 2,
        status: 'Available',
      },
      documents: [
        {
          _id: 'NOTICE-DEMO-003',
          name: 'Consumer_Notice_Akash.pdf',
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },
  ],
};

export default MOCK_ADVOCATE_CASES;
