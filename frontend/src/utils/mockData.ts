import { MeetingBrief, Task, TranscriptEntry, Document, RiskFlag, CalendarEvent } from '../types';

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

// Get today's date for current meetings
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const inTwoDays = new Date(today);
inTwoDays.setDate(today.getDate() + 2);
const inThreeDays = new Date(today);
inThreeDays.setDate(today.getDate() + 3);
const inFourDays = new Date(today);
inFourDays.setDate(today.getDate() + 4);
const inFiveDays = new Date(today);
inFiveDays.setDate(today.getDate() + 5);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockCalendarEvents: CalendarEvent[] = [
  // TODAY'S MEETINGS (3 total)
  {
    id: '1',
    title: 'Morning Investment Review - Johnson Family',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(today),
    time: '09:00',
    duration: 90,
    participants: [
      { id: '1', name: 'Sarah Johnson', role: 'Client', email: 'sarah.johnson@email.com', isAdvisor: false },
      { id: '2', name: 'Michael Johnson', role: 'Co-Client', email: 'michael.johnson@email.com', isAdvisor: false },
      { id: '3', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '4', name: 'David Chen', role: 'Investment Analyst', email: 'david.chen@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Executive Conference Room',
    description: 'Comprehensive quarterly portfolio review and 2025 strategy planning',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: '2',
    title: 'Video Consultation - Williams Estate Planning',
    type: 'call',
    format: 'video',
    date: formatDate(today),
    time: '13:30',
    duration: 75,
    participants: [
      { id: '5', name: 'Robert Williams', role: 'Client', email: 'robert.williams@email.com', isAdvisor: false },
      { id: '6', name: 'Margaret Williams', role: 'Co-Client', email: 'margaret.williams@email.com', isAdvisor: false },
      { id: '7', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '8', name: 'Lisa Chen', role: 'Estate Specialist', email: 'lisa.chen@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Microsoft Teams',
    description: 'Discuss trust restructuring and tax optimization strategies',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: '3',
    title: 'Client Risk Assessment - Peterson Holdings',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(today),
    time: '16:00',
    duration: 45,
    participants: [
      { id: '9', name: 'James Peterson', role: 'Client', email: 'james.peterson@email.com', isAdvisor: false },
      { id: '10', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '11', name: 'Risk Specialist', role: 'Risk Analyst', email: 'risk.analyst@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Private Office 8',
    description: 'Annual risk tolerance review and investment profile update',
    priority: 'medium',
    hasPrep: true,
    hasDocuments: true
  },
  
  // TOMORROW'S MEETINGS
  {
    id: '4',
    title: 'Investment Committee Call',
    type: 'call',
    format: 'video',
    date: formatDate(tomorrow),
    time: '08:30',
    duration: 60,
    participants: [
      { id: '12', name: 'David Chen', role: 'Investment Analyst', email: 'david.chen@ubs.com', isAdvisor: true },
      { id: '13', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '14', name: 'Committee Members', role: 'Investment Team', email: 'committee@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Zoom Conference',
    description: 'Weekly market outlook and portfolio strategy alignment',
    priority: 'medium',
    hasPrep: false,
    hasDocuments: true
  },
  {
    id: '5',
    title: 'New Client Presentation - Anderson Family',
    type: 'presentation',
    format: 'in-person',
    date: formatDate(tomorrow),
    time: '14:00',
    duration: 90,
    participants: [
      { id: '15', name: 'Michael Anderson', role: 'Prospect', email: 'michael.anderson@email.com', isAdvisor: false },
      { id: '16', name: 'Sarah Anderson', role: 'Prospect', email: 'sarah.anderson@email.com', isAdvisor: false },
      { id: '17', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Client Presentation Suite',
    description: 'Initial wealth planning presentation and service overview',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  
  // IN TWO DAYS
  {
    id: '6',
    title: 'Market Review - Technology Sector',
    type: 'review',
    format: 'video',
    date: formatDate(inTwoDays),
    time: '11:00',
    duration: 45,
    participants: [
      { id: '18', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '19', name: 'Market Analyst', role: 'Research Team', email: 'research@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Teams Meeting',
    description: 'Analysis of tech sector performance and implications',
    priority: 'low',
    hasPrep: false,
    hasDocuments: true
  },
  {
    id: '7',
    title: 'Private Wealth Consultation - Martinez Family',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(inTwoDays),
    time: '13:30',
    duration: 120,
    participants: [
      { id: '20', name: 'Carlos Martinez', role: 'Client', email: 'carlos.martinez@email.com', isAdvisor: false },
      { id: '21', name: 'Isabella Martinez', role: 'Co-Client', email: 'isabella.martinez@email.com', isAdvisor: false },
      { id: '22', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Private Client Suite',
    description: 'Comprehensive wealth planning and investment strategy session',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  
  // IN THREE DAYS
  {
    id: '8',
    title: 'Video Call - Thompson Industries Check-in',
    type: 'call',
    format: 'video',
    date: formatDate(inThreeDays),
    time: '10:00',
    duration: 30,
    participants: [
      { id: '23', name: 'Jennifer Thompson', role: 'Client', email: 'jennifer.thompson@email.com', isAdvisor: false },
      { id: '24', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Zoom Call',
    description: 'Monthly portfolio update and market discussion',
    priority: 'low',
    hasPrep: false,
    hasDocuments: false
  },
  {
    id: '9',
    title: 'Tax Strategy Planning - Davis Trust',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(inThreeDays),
    time: '14:00',
    duration: 105,
    participants: [
      { id: '25', name: 'Richard Davis', role: 'Client', email: 'richard.davis@email.com', isAdvisor: false },
      { id: '26', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '27', name: 'Tax Specialist', role: 'Tax Advisor', email: 'tax.specialist@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Private Office 12',
    description: 'Year-end tax planning and optimization strategies',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  
  // IN FOUR DAYS
  {
    id: '10',
    title: 'Compliance Training Session',
    type: 'review',
    format: 'video',
    date: formatDate(inFourDays),
    time: '09:00',
    duration: 90,
    participants: [
      { id: '28', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '29', name: 'Compliance Team', role: 'Compliance Officer', email: 'compliance@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'WebEx Training',
    description: 'Quarterly regulatory updates and best practices',
    priority: 'medium',
    hasPrep: false,
    hasDocuments: true
  },
  {
    id: '11',
    title: 'ESG Investment Review - Green Portfolio Clients',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(inFourDays),
    time: '15:30',
    duration: 75,
    participants: [
      { id: '30', name: 'Multiple Clients', role: 'ESG Investors', email: 'esg.clients@email.com', isAdvisor: false },
      { id: '31', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '32', name: 'ESG Specialist', role: 'Sustainable Investment Advisor', email: 'esg.advisor@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Conference Room C',
    description: 'Review sustainable investment performance and new ESG opportunities',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  
  // IN FIVE DAYS
  {
    id: '12',
    title: 'Weekly Team Standup',
    type: 'call',
    format: 'video',
    date: formatDate(inFiveDays),
    time: '08:30',
    duration: 30,
    participants: [
      { id: '33', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '34', name: 'David Chen', role: 'Investment Analyst', email: 'david.chen@ubs.com', isAdvisor: true },
      { id: '35', name: 'Team Lead', role: 'Management', email: 'team.lead@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Microsoft Teams',
    description: 'Weekly coordination and priority alignment',
    priority: 'medium',
    hasPrep: false,
    hasDocuments: false
  },
  {
    id: '13',
    title: 'High Net Worth Client Meeting - Wilson Estate',
    type: 'meeting',
    format: 'in-person',
    date: formatDate(inFiveDays),
    time: '13:00',
    duration: 120,
    participants: [
      { id: '36', name: 'Robert Wilson', role: 'Client', email: 'robert.wilson@email.com', isAdvisor: false },
      { id: '37', name: 'Catherine Wilson', role: 'Co-Client', email: 'catherine.wilson@email.com', isAdvisor: false },
      { id: '38', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: '39', name: 'Private Banking Specialist', role: 'Wealth Advisor', email: 'pb.specialist@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Executive Private Suite',
    description: 'Comprehensive wealth management strategy and private banking services review',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  }
];