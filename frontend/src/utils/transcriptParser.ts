import { Task } from '../types';

export interface TranscriptData {
  id: string;
  title: string;
  content: string;
  language: 'en' | 'fr' | 'de';
  extractedTasks: ExtractedTask[];
  participants: string[];
  topics: string[];
  summary: string;
}

export interface ExtractedTask {
  task_type: string;
  parameters?: {
    [key: string]: any;
  };
  confidence?: number;
  description?: string;
}

export const transcriptDatabase: TranscriptData[] = [
  {
    id: 'o9KDT4mzeBnPzrCQ2ouZTc',
    title: 'Client Account Issues & KYC Update',
    language: 'en',
    content: `Client called regarding unrecognized charges on their card and needed to update KYC information for inheritance received. Key topics discussed:

**Card Security Issues:**
- Unrecognized charge investigation
- Fraud prevention measures
- Transaction alert setup

**KYC Updates:**
- Large inheritance received from relative
- Documentation provided: https://example.com/doc/8003
- Asset origin verification required

**Communication Preferences:**
- Switch to email communication
- Block postal delivery for legal correspondence
- Updated contact: +41000000000

**Next Steps:**
- Client will upload inheritance documents
- Set up transaction alerts
- Complete dispute form for unrecognized charge`,
    extractedTasks: [
      {
        task_type: "update_kyc_origin_of_assets",
        parameters: {
          origin: "Inheritance",
          details: "Client inherited a large sum of money.",
          corroboration_or_evidence: ["https://example.com/doc/8003"]
        },
        confidence: 0.95,
        description: "Update client KYC records with inheritance information"
      },
      {
        task_type: "update_contact_info_non_postal",
        confidence: 0.90,
        description: "Switch client to email communication and block postal delivery"
      }
    ],
    participants: ['UBS Advisor', 'Client'],
    topics: ['Card Security', 'KYC Update', 'Inheritance', 'Communication Preferences'],
    summary: 'Client called to resolve card security issues and update KYC information for a substantial inheritance received.'
  },
  {
    id: 'o8ikcJwspFJHnFT89wiWrR',
    title: 'Découvert Extension & KYC Update (French)',
    language: 'fr',
    content: `Client français a appelé pour une extension de découvert et mise à jour KYC. Points clés:

**Extension de Découvert:**
- Montant demandé pour dépenses imprévues
- Explication des taux d'intérêt et frais
- Configuration d'alertes email/SMS

**Mise à jour KYC:**
- Actifs totaux: 3,356,139 CHF
- Répartition: Immobilier (2,340,903), Liquidités (1,457,097), Autres (983,719)
- Origine: Héritage
- Objectif: Investissement et trading pour la retraite

**Rendez-vous:**
- Planifié pour le 6 octobre 2025
- Préférence pour notifications par email`,
    extractedTasks: [
      {
        task_type: "update_kyc_total_assets",
        confidence: 0.92,
        description: "Update client's total asset information in KYC records"
      },
      {
        task_type: "plan_contact",
        parameters: {
          contact_date: "2025-10-06",
          contact_note: "Philanthropy & charitable giving – explore UBS Optimus Foundation or donor-advised funds.",
          channel: "In-person at branch",
          duration_minutes: 90
        },
        confidence: 0.88,
        description: "Schedule follow-up meeting for October 6th"
      },
      {
        task_type: "update_kyc_origin_of_assets",
        parameters: {
          origin: "Inheritance",
          details: "Client inherited a large sum of money.",
          corroboration_or_evidence: ["https://example.com/doc/7441"]
        },
        confidence: 0.94,
        description: "Update asset origin information for inheritance"
      },
      {
        task_type: "update_kyc_purpose_of_businessrelation",
        parameters: {
          purpose_category: "investing & securities trading",
          details: "Client wants to invest for retirement."
        },
        confidence: 0.91,
        description: "Update business relationship purpose for retirement investing"
      }
    ],
    participants: ['Conseiller UBS', 'Client Français'],
    topics: ['Découvert Bancaire', 'KYC', 'Patrimoine', 'Investissement Retraite'],
    summary: 'Client français demande une extension de découvert et met à jour ses informations KYC avec un patrimoine important d\'origine héréditaire.'
  },
  {
    id: 'o6ojG3v5XTEWgmAjWkvxpE',
    title: 'Kartenblockierung & Premium-Konto (German)',
    language: 'de',
    content: `Deutscher Kunde rief wegen Kartenblockierung an und interessierte sich für Premium-Konto. Hauptpunkte:

**Kartenblockierung:**
- Präventive Sicherheitsmaßnahme
- Keine unauthorisierten Transaktionen festgestellt
- Mehrere Freischaltungsoptionen erklärt

**Sicherheitstipps:**
- Starke, einzigartige Passwörter verwenden
- Keine verdächtigen E-Mails öffnen
- Regelmäßige Passwort-Updates

**Premium-Konto Interesse:**
- Erweiterte Sicherheitsfunktionen
- Zusätzliche Authentifizierungsschritte
- Sekundäre Karte für Notfälle
- Virtuelle Karten für Online-Einkäufe

**Nächste Schritte:**
- Premium-Konto Upgrade-Prozess erklärt
- Sekundäre Karte kann online beantragt werden`,
    extractedTasks: [],
    participants: ['UBS Berater', 'Deutscher Kunde'],
    topics: ['Kartensicherheit', 'Premium-Konto', 'Sicherheitstipps', 'Kontosicherheit'],
    summary: 'Deutscher Kunde löste Kartenblockierung und zeigte Interesse an Premium-Konto mit erweiterten Sicherheitsfunktionen.'
  }
];

export const getTranscriptById = (id: string): TranscriptData | undefined => {
  return transcriptDatabase.find(t => t.id === id);
};

export const getTranscriptsByLanguage = (language: 'en' | 'fr' | 'de'): TranscriptData[] => {
  return transcriptDatabase.filter(t => t.language === language);
};

export const searchTranscripts = (query: string): TranscriptData[] => {
  const lowercaseQuery = query.toLowerCase();
  return transcriptDatabase.filter(transcript => 
    transcript.title.toLowerCase().includes(lowercaseQuery) ||
    transcript.content.toLowerCase().includes(lowercaseQuery) ||
    transcript.topics.some(topic => topic.toLowerCase().includes(lowercaseQuery)) ||
    transcript.summary.toLowerCase().includes(lowercaseQuery)
  );
};

export const getAllExtractedTasks = (): Array<ExtractedTask & { transcriptId: string; transcriptTitle: string }> => {
  return transcriptDatabase.flatMap(transcript => 
    transcript.extractedTasks.map(task => ({
      ...task,
      transcriptId: transcript.id,
      transcriptTitle: transcript.title
    }))
  );
};