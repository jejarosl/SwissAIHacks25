import { MeetingBrief, Task, TranscriptEntry, Document, RiskFlag } from '../types';

export const mockMeetingBrief: MeetingBrief = {
  id: '1',
  title: 'Quarterly Portfolio Review - Johnson Family',
  date: '2025-01-20T14:00:00Z',
  participants: [
    { id: '1', name: 'Sarah Johnson', role: 'Client', email: 'sarah.johnson@email.com', isAdvisor: false },
    { id: '2', name: 'Michael Johnson', role: 'Co-Client', email: 'michael.johnson@email.com', isAdvisor: false },
    { id: '3', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
    { id: '4', name: 'David Chen', role: 'Tax Specialist', email: 'david.chen@ubs.com', isAdvisor: true }
  ],
  previousHighlights: [
    'Discussed diversification of tech holdings',
    'Reviewed estate planning options',
    'Explored ESG investment opportunities',
    'Addressed concerns about market volatility'
  ],
  openTasks: [
    {
      id: '1',
      description: 'Review and update risk tolerance questionnaire',
      owner: 'Emma Thompson',
      dueDate: '2025-01-25',
      status: 'todo',
      category: 'Documentation'
    },
    {
      id: '2',
      description: 'Prepare ESG portfolio proposal',
      owner: 'David Chen',
      dueDate: '2025-01-22',
      status: 'in-progress',
      category: 'Investment'
    }
  ],
  riskFlags: [
    {
      id: '1',
      type: 'compliance',
      message: 'KYC documentation expires in 30 days',
      severity: 'medium'
    },
    {
      id: '2',
      type: 'risk',
      message: 'Portfolio concentration in tech sector above threshold',
      severity: 'high'
    }
  ],
  suggestedServices: [
    'UBS Tax-Optimized Portfolios',
    'Private Banking Credit Solutions',
    'Wealth Planning Advisory',
    'Alternative Investment Platform'
  ]
};

export const mockTranscript: TranscriptEntry[] = [
  {
    id: '1',
    timestamp: '14:02:15',
    speaker: 'Emma Thompson',
    text: 'Good afternoon, Sarah and Michael. Thank you for joining us today for your quarterly review.'
  },
  {
    id: '2',
    timestamp: '14:02:28',
    speaker: 'Sarah Johnson',
    text: 'Thank you, Emma. We\'re looking forward to discussing our portfolio performance.'
  },
  {
    id: '3',
    timestamp: '14:02:45',
    speaker: 'Emma Thompson',
    text: 'Let\'s schedule a follow-up meeting to discuss the tax implications in detail.',
    isActionItem: true,
    confidenceScore: 0.92
  },
  {
    id: '4',
    timestamp: '14:03:12',
    speaker: 'Michael Johnson',
    text: 'I\'d like to explore more ESG investment options. Can you prepare a proposal?',
    isActionItem: true,
    confidenceScore: 0.88
  },
  {
    id: '5',
    timestamp: '14:03:35',
    speaker: 'David Chen',
    text: 'Absolutely. I\'ll prepare a comprehensive ESG proposal by Friday.',
    isActionItem: true,
    confidenceScore: 0.95
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    description: 'Schedule follow-up tax planning meeting',
    owner: 'Emma Thompson',
    dueDate: '2025-01-25',
    status: 'todo',
    confidenceScore: 0.92,
    evidence: 'Let\'s schedule a follow-up meeting to discuss the tax implications...',
    category: 'Scheduling'
  },
  {
    id: '2',
    description: 'Prepare comprehensive ESG investment proposal',
    owner: 'David Chen',
    dueDate: '2025-01-24',
    status: 'in-progress',
    confidenceScore: 0.95,
    evidence: 'I\'ll prepare a comprehensive ESG proposal by Friday.',
    category: 'Investment'
  },
  {
    id: '3',
    description: 'Review portfolio diversification options',
    owner: 'Emma Thompson',
    dueDate: '2025-01-26',
    status: 'todo',
    confidenceScore: 0.87,
    evidence: 'We should look at diversifying beyond tech sector.',
    category: 'Analysis'
  },
  {
    id: '4',
    description: 'Update client risk profile documentation',
    owner: 'David Chen',
    dueDate: '2025-01-23',
    status: 'done',
    confidenceScore: 0.91,
    evidence: 'Please update the risk questionnaire based on today\'s discussion.',
    category: 'Documentation'
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Q4_2024_Portfolio_Report.pdf',
    type: 'PDF',
    uploadDate: '2025-01-15',
    size: '2.4 MB'
  },
  {
    id: '2',
    name: 'Tax_Planning_Strategy.docx',
    type: 'DOCX',
    uploadDate: '2025-01-18',
    size: '856 KB'
  },
  {
    id: '3',
    name: 'ESG_Investment_Options.xlsx',
    type: 'XLSX',
    uploadDate: '2025-01-19',
    size: '1.2 MB'
  }
];