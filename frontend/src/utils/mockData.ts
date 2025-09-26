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
    category: 'Scheduling',
    meetingId: 'meeting-123'
  },
  {
    id: '2',
    description: 'Prepare comprehensive ESG investment proposal',
    owner: 'David Chen',
    dueDate: '2025-01-24',
    status: 'in-progress',
    confidenceScore: 0.95,
    evidence: 'I\'ll prepare a comprehensive ESG proposal by Friday.',
    category: 'Investment',
    meetingId: 'meeting-123'
  },
  {
    id: '3',
    description: 'Review portfolio diversification options',
    owner: 'Emma Thompson',
    dueDate: '2025-01-26',
    status: 'todo',
    confidenceScore: 0.87,
    evidence: 'We should look at diversifying beyond tech sector.',
    category: 'Analysis',
    meetingId: 'meeting-123'
  },
  {
    id: '4',
    description: 'Update client risk profile documentation',
    owner: 'David Chen',
    dueDate: '2025-01-23',
    status: 'done',
    confidenceScore: 0.91,
    evidence: 'Please update the risk questionnaire based on today\'s discussion.',
    category: 'Documentation',
    meetingId: 'meeting-123'
  },
  {
    id: '5',
    description: 'Prepare Q3 performance analysis for Richardson Family',
    owner: 'Emma Thompson',
    dueDate: '2025-09-01',
    status: 'todo',
    confidenceScore: 0.89,
    evidence: 'We need to analyze the Q3 performance before the quarterly review meeting.',
    category: 'Analysis'
  },
  {
    id: '6',
    description: 'Research sustainable investment options for ESG seminar',
    owner: 'ESG Specialist',
    dueDate: '2025-09-03',
    status: 'in-progress',
    confidenceScore: 0.93,
    evidence: 'I want to explore more ESG investment opportunities for the presentation.',
    category: 'Research'
  },
  {
    id: '7',
    description: 'Complete KYC documentation for Taylor Holdings onboarding',
    owner: 'Emma Thompson',
    dueDate: '2025-09-06',
    status: 'todo',
    confidenceScore: 0.96,
    evidence: 'All KYC documents must be completed before the onboarding meeting.',
    category: 'Documentation'
  },
  {
    id: '8',
    description: 'Analyze market trends for September outlook call',
    owner: 'Research Team',
    dueDate: '2025-09-09',
    status: 'in-progress',
    confidenceScore: 0.88,
    evidence: 'We need comprehensive market analysis for the monthly call.',
    category: 'Research'
  },
  {
    id: '9',
    description: 'Draft trust restructuring proposal for Morrison Family',
    owner: 'Estate Specialist',
    dueDate: '2025-09-10',
    status: 'todo',
    confidenceScore: 0.94,
    evidence: 'Please prepare a detailed trust restructuring plan.',
    category: 'Legal'
  },
  {
    id: '10',
    description: 'Update compliance documentation for quarterly review',
    owner: 'Compliance Officer',
    dueDate: '2025-09-13',
    status: 'done',
    confidenceScore: 0.97,
    evidence: 'All compliance documents need to be current for the review.',
    category: 'Compliance'
  },
  {
    id: '11',
    description: 'Research alternative investment options for Park Family',
    owner: 'Alternative Investments Specialist',
    dueDate: '2025-09-16',
    status: 'todo',
    confidenceScore: 0.91,
    evidence: 'We discussed exploring private equity opportunities.',
    category: 'Investment'
  },
  {
    id: '12',
    description: 'Prepare tax optimization strategies presentation',
    owner: 'Tax Planning Team',
    dueDate: '2025-09-18',
    status: 'in-progress',
    confidenceScore: 0.90,
    evidence: 'Year-end tax planning strategies need to be ready.',
    category: 'Tax Planning'
  },
  {
    id: '13',
    description: 'Create corporate wealth management proposal for Stevens Corporation',
    owner: 'Corporate Banking Specialist',
    dueDate: '2025-09-20',
    status: 'todo',
    confidenceScore: 0.95,
    evidence: 'We need a comprehensive corporate wealth management solution.',
    category: 'Business Development'
  },
  {
    id: '14',
    description: 'Review Thompson Family Trust performance metrics',
    owner: 'Emma Thompson',
    dueDate: '2025-09-23',
    status: 'done',
    confidenceScore: 0.86,
    evidence: 'Monthly trust performance review is scheduled.',
    category: 'Analysis'
  },
  {
    id: '15',
    description: 'Prepare dynasty trust optimization analysis for Roberts Family',
    owner: 'Trust Specialist',
    dueDate: '2025-09-26',
    status: 'in-progress',
    confidenceScore: 0.92,
    evidence: 'Multi-generational wealth transfer needs detailed analysis.',
    category: 'Estate Planning'
  },
  {
    id: '16',
    description: 'Compile Q4 market outlook for Garcia Holdings review',
    owner: 'Emma Thompson',
    dueDate: '2025-09-28',
    status: 'todo',
    confidenceScore: 0.88,
    evidence: 'Q4 outlook discussion was mentioned in the agenda.',
    category: 'Analysis'
  },
  {
    id: '17',
    description: 'Schedule follow-up meetings for all September client reviews',
    owner: 'Emma Thompson',
    dueDate: '2025-09-30',
    status: 'todo',
    confidenceScore: 0.85,
    evidence: 'Several clients mentioned need for follow-up discussions.',
    category: 'Scheduling'
  },
  {
    id: '18',
    description: 'Update client database with September meeting outcomes',
    owner: 'Emma Thompson',
    dueDate: '2025-10-01',
    status: 'todo',
    confidenceScore: 0.83,
    evidence: 'All meeting notes need to be documented in the system.',
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

const initialMeetings: CalendarEvent[] = [
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

// Add more meetings for the rest of the week
const nextWeekStart = new Date(today);
nextWeekStart.setDate(today.getDate() + 7);
const twoWeeksOut = new Date(today);
twoWeeksOut.setDate(today.getDate() + 14);

// September 2025 meetings
const septemberMeetings: CalendarEvent[] = [
  {
    id: 'sept-1',
    title: 'Q3 Portfolio Review - Richardson Family',
    type: 'meeting',
    format: 'in-person',
    date: '2025-09-03',
    time: '10:00',
    duration: 120,
    participants: [
      { id: 's1', name: 'Mark Richardson', role: 'Client', email: 'mark.richardson@email.com', isAdvisor: false },
      { id: 's2', name: 'Linda Richardson', role: 'Co-Client', email: 'linda.richardson@email.com', isAdvisor: false },
      { id: 's3', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Executive Conference Room',
    description: 'Quarterly review of investment performance and strategy adjustments',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-2',
    title: 'Virtual ESG Investment Seminar',
    type: 'presentation',
    format: 'video',
    date: '2025-09-05',
    time: '14:30',
    duration: 90,
    participants: [
      { id: 's4', name: 'Multiple Clients', role: 'ESG Investors', email: 'esg.clients@email.com', isAdvisor: false },
      { id: 's5', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's6', name: 'ESG Specialist', role: 'Product Expert', email: 'esg.expert@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Zoom Webinar',
    description: 'Sustainable investing trends and new ESG product offerings',
    priority: 'medium',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-3',
    title: 'High Net Worth Client Onboarding - Taylor Holdings',
    type: 'meeting',
    format: 'in-person',
    date: '2025-09-08',
    time: '11:00',
    duration: 150,
    participants: [
      { id: 's7', name: 'Alexander Taylor', role: 'Client', email: 'alexander.taylor@email.com', isAdvisor: false },
      { id: 's8', name: 'Victoria Taylor', role: 'Co-Client', email: 'victoria.taylor@email.com', isAdvisor: false },
      { id: 's9', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's10', name: 'Private Banking Specialist', role: 'Wealth Advisor', email: 'pb.specialist@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Private Client Suite',
    description: 'Comprehensive onboarding for $50M+ portfolio management',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-4',
    title: 'Monthly Market Analysis Call',
    type: 'call',
    format: 'phone',
    date: '2025-09-10',
    time: '08:30',
    duration: 45,
    participants: [
      { id: 's11', name: 'Research Team', role: 'Market Analysts', email: 'research@ubs.com', isAdvisor: true },
      { id: 's12', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Conference Call',
    description: 'September market outlook and investment opportunities',
    priority: 'medium',
    hasPrep: false,
    hasDocuments: true
  },
  {
    id: 'sept-5',
    title: 'Trust & Estate Planning - Morrison Family',
    type: 'meeting',
    format: 'video',
    date: '2025-09-12',
    time: '15:00',
    duration: 105,
    participants: [
      { id: 's13', name: 'Richard Morrison', role: 'Client', email: 'richard.morrison@email.com', isAdvisor: false },
      { id: 's14', name: 'Patricia Morrison', role: 'Co-Client', email: 'patricia.morrison@email.com', isAdvisor: false },
      { id: 's15', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's16', name: 'Estate Specialist', role: 'Legal Advisor', email: 'estate.specialist@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Microsoft Teams',
    description: 'Complex estate planning and generational wealth transfer',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-6',
    title: 'Compliance Review Meeting',
    type: 'review',
    format: 'in-person',
    date: '2025-09-15',
    time: '09:00',
    duration: 75,
    participants: [
      { id: 's17', name: 'Compliance Officer', role: 'Compliance', email: 'compliance@ubs.com', isAdvisor: true },
      { id: 's18', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Compliance Office',
    description: 'Quarterly compliance review and regulatory updates',
    priority: 'medium',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-7',
    title: 'Alternative Investments Consultation - Park Family',
    type: 'meeting',
    format: 'in-person',
    date: '2025-09-18',
    time: '13:30',
    duration: 90,
    participants: [
      { id: 's19', name: 'Daniel Park', role: 'Client', email: 'daniel.park@email.com', isAdvisor: false },
      { id: 's20', name: 'Jennifer Park', role: 'Co-Client', email: 'jennifer.park@email.com', isAdvisor: false },
      { id: 's21', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's22', name: 'Alternative Investments Specialist', role: 'Product Specialist', email: 'alt.invest@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Client Meeting Room B',
    description: 'Private equity and hedge fund investment opportunities',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-8',
    title: 'Tax Planning Strategy Call',
    type: 'call',
    format: 'video',
    date: '2025-09-20',
    time: '10:30',
    duration: 60,
    participants: [
      { id: 's23', name: 'Tax Planning Team', role: 'Tax Specialists', email: 'tax.team@ubs.com', isAdvisor: true },
      { id: 's24', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Zoom Meeting',
    description: 'Year-end tax planning strategies and optimization',
    priority: 'medium',
    hasPrep: false,
    hasDocuments: true
  },
  {
    id: 'sept-9',
    title: 'New Client Presentation - Stevens Corporation',
    type: 'presentation',
    format: 'in-person',
    date: '2025-09-22',
    time: '14:00',
    duration: 120,
    participants: [
      { id: 's25', name: 'CEO Stevens Corp', role: 'Prospect', email: 'ceo@stevens.corp', isAdvisor: false },
      { id: 's26', name: 'CFO Stevens Corp', role: 'Prospect', email: 'cfo@stevens.corp', isAdvisor: false },
      { id: 's27', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's28', name: 'Corporate Banking Specialist', role: 'Product Specialist', email: 'corp.banking@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Executive Boardroom',
    description: 'Corporate wealth management and executive compensation solutions',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-10',
    title: 'Client Check-in - Thompson Family Trust',
    type: 'call',
    format: 'video',
    date: '2025-09-25',
    time: '11:00',
    duration: 45,
    participants: [
      { id: 's29', name: 'William Thompson', role: 'Client', email: 'william.thompson@email.com', isAdvisor: false },
      { id: 's30', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'confirmed',
    location: 'Teams Call',
    description: 'Monthly trust performance review and updates',
    priority: 'low',
    hasPrep: false,
    hasDocuments: false
  },
  {
    id: 'sept-11',
    title: 'Wealth Transfer Planning - Roberts Dynasty Trust',
    type: 'meeting',
    format: 'in-person',
    date: '2025-09-28',
    time: '15:30',
    duration: 135,
    participants: [
      { id: 's31', name: 'George Roberts', role: 'Client', email: 'george.roberts@email.com', isAdvisor: false },
      { id: 's32', name: 'Elizabeth Roberts', role: 'Co-Client', email: 'elizabeth.roberts@email.com', isAdvisor: false },
      { id: 's33', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
      { id: 's34', name: 'Trust Specialist', role: 'Estate Planning Expert', email: 'trust.specialist@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'Private Advisory Suite',
    description: 'Multi-generational wealth transfer and dynasty trust optimization',
    priority: 'high',
    hasPrep: true,
    hasDocuments: true
  },
  {
    id: 'sept-12',
    title: 'Monthly Portfolio Review - Garcia Holdings',
    type: 'review',
    format: 'video',
    date: '2025-09-30',
    time: '16:00',
    duration: 60,
    participants: [
      { id: 's35', name: 'Carlos Garcia', role: 'Client', email: 'carlos.garcia@email.com', isAdvisor: false },
      { id: 's36', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
    ],
    status: 'scheduled',
    location: 'WebEx Meeting',
    description: 'September performance review and Q4 outlook',
    priority: 'medium',
    hasPrep: true,
    hasDocuments: true
  }
];

// Add additional meetings spread across the next two weeks
const additionalMeetings: CalendarEvent[] = [
    {
      id: '14',
      title: 'Client Onboarding - Smith Holdings',
      type: 'meeting',
      format: 'in-person',
      date: formatDate(tomorrow),
      time: '16:30',
      duration: 60,
      participants: [
        { id: '40', name: 'John Smith', role: 'Client', email: 'john.smith@email.com', isAdvisor: false },
        { id: '41', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
      ],
      status: 'confirmed',
      location: 'Client Suite A',
      description: 'Initial onboarding session for new high-net-worth client',
      priority: 'high',
      hasPrep: true,
      hasDocuments: true
    },
    {
      id: '15',
      title: 'Quarterly Strategy Review',
      type: 'meeting',
      format: 'video',
      date: formatDate(inTwoDays),
      time: '09:30',
      duration: 90,
      participants: [
        { id: '42', name: 'Regional Team', role: 'Advisory Team', email: 'team@ubs.com', isAdvisor: true },
        { id: '43', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
      ],
      status: 'scheduled',
      location: 'Teams Meeting',
      description: 'Review Q1 performance and set Q2 objectives',
      priority: 'medium',
      hasPrep: true,
      hasDocuments: true
    },
    {
      id: '16',
      title: 'Wealth Structuring Consultation - Brown Family',
      type: 'meeting',
      format: 'in-person',
      date: formatDate(inThreeDays),
      time: '11:00',
      duration: 120,
      participants: [
        { id: '44', name: 'Robert Brown', role: 'Client', email: 'robert.brown@email.com', isAdvisor: false },
        { id: '45', name: 'Susan Brown', role: 'Co-Client', email: 'susan.brown@email.com', isAdvisor: false },
        { id: '46', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
        { id: '47', name: 'Tax Specialist', role: 'Tax Advisor', email: 'tax@ubs.com', isAdvisor: true }
      ],
      status: 'confirmed',
      location: 'Executive Board Room',
      description: 'Complex wealth structuring and tax optimization discussion',
      priority: 'high',
      hasPrep: true,
      hasDocuments: true
    },
    {
      id: '17',
      title: 'Market Outlook Call with Research Team',
      type: 'call',
      format: 'phone',
      date: formatDate(inFourDays),
      time: '08:00',
      duration: 45,
      participants: [
        { id: '48', name: 'Research Analyst', role: 'Market Research', email: 'research@ubs.com', isAdvisor: true },
        { id: '49', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true }
      ],
      status: 'scheduled',
      location: 'Conference Call',
      description: 'Weekly market analysis and investment opportunities',
      priority: 'low',
      hasPrep: false,
      hasDocuments: true
    },
    {
      id: '18',
      title: 'Alternative Investments Presentation',
      type: 'presentation',
      format: 'video',
      date: formatDate(inFiveDays),
      time: '14:30',
      duration: 75,
      participants: [
        { id: '50', name: 'Multiple Clients', role: 'HNW Clients', email: 'clients@email.com', isAdvisor: false },
        { id: '51', name: 'Emma Thompson', role: 'Senior Advisor', email: 'emma.thompson@ubs.com', isAdvisor: true },
        { id: '52', name: 'Alternative Investments Specialist', role: 'Product Specialist', email: 'alt.invest@ubs.com', isAdvisor: true }
      ],
      status: 'scheduled',
      location: 'Zoom Webinar',
      description: 'Presentation on private equity and hedge fund opportunities',
      priority: 'medium',
      hasPrep: true,
      hasDocuments: true
    }
  ];
  

export const mockCalendarEvents: CalendarEvent[] = [...initialMeetings, ...additionalMeetings, ...septemberMeetings];