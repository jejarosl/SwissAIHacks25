import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Search, FileText, 
  Calendar, Users, TrendingUp, Clock, Lightbulb,
  BookOpen, Shield, Globe, Cpu, Mic, Volume2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  category?: 'meeting' | 'service' | 'client' | 'general';
  sources?: string[];
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your UBS AI Assistant. I have access to your meeting history, client data, and comprehensive knowledge of UBS services. How can I help you today?',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      category: 'general'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'meetings' | 'services' | 'clients'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    {
      category: 'meetings',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700',
      questions: [
        'What were the key action items from my last meeting with the Johnson Family?',
        'Summarize the main topics discussed in client meetings this week',
        'What follow-up tasks are pending from previous meetings?',
        'Show me the client concerns raised in recent meetings'
      ]
    },
    {
      category: 'services',
      icon: BookOpen,
      color: 'bg-green-100 text-green-700',
      questions: [
        'What UBS ESG investment options are available for moderate risk clients?',
        'Explain UBS wealth planning services for high net worth families',
        'What are the tax advantages of UBS trust and estate planning?',
        'Compare UBS alternative investment platforms and eligibility'
      ]
    },
    {
      category: 'clients',
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
      questions: [
        'Which clients are due for their quarterly portfolio review?',
        'Show me clients with similar risk profiles to the Martinez Family',
        'What clients might benefit from ESG investment opportunities?',
        'Identify clients approaching major life milestones'
      ]
    },
    {
      category: 'analytics',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-700',
      questions: [
        'Which clients have underperforming portfolios that need attention?',
        'Show portfolio allocation trends across my client base',
        'Identify upselling opportunities based on client profiles',
        'What are the common themes in client feedback?'
      ]
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response with realistic UBS-specific answers
    setTimeout(() => {
      const response = generateResponse(inputMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        category: response.category,
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string): { content: string; category: ChatMessage['category']; sources: string[] } => {
    const lowerQuery = query.toLowerCase();

    // Meeting-related queries
    if (lowerQuery.includes('meeting') || lowerQuery.includes('action item') || lowerQuery.includes('follow-up')) {
      return {
        content: `Based on your recent meetings, I found several key action items:

**Johnson Family (Jan 20, 2025)**:
- Schedule follow-up tax planning meeting (Due: Jan 25)
- Prepare comprehensive ESG proposal (Due: Jan 24) 
- Review portfolio diversification options (Due: Jan 26)

**Williams Estate (Jan 18, 2025)**:
- Update trust structure documentation
- Finalize tax optimization strategies

The most urgent items are the ESG proposal preparation for the Johnson Family and scheduling their tax planning follow-up. Would you like me to help prioritize these tasks or create calendar invitations?`,
        category: 'meeting',
        sources: ['Meeting Transcripts - Jan 2025', 'Task Management System', 'Calendar Integration']
      };
    }

    // UBS Services queries
    if (lowerQuery.includes('esg') || lowerQuery.includes('investment') || lowerQuery.includes('ubs') || lowerQuery.includes('service')) {
      return {
        content: `Here are relevant UBS investment solutions:

**ESG Investment Options**:
- **UBS Sustainable Investment Portfolios**: Diversified ESG-focused mutual funds
- **Impact Investing Strategies**: Direct investment in companies with positive social/environmental impact
- **ESG-Screened Alternatives**: Private equity and hedge funds with sustainability criteria

**For Moderate Risk Clients**:
- Target allocation: 60% ESG equities, 30% sustainable bonds, 10% impact investments
- Expected returns: 7-9% annually with reduced volatility
- Minimum investment: $500,000 for comprehensive ESG portfolio

**Tax Advantages**:
- ESG municipal bonds offer tax-free income
- Opportunity zones provide capital gains deferral
- Charitable remainder trusts enhance ESG impact

Would you like specific recommendations for any of your clients, or shall I prepare a detailed ESG presentation deck?`,
        category: 'service',
        sources: ['UBS Product Catalog', 'Investment Guidelines', 'ESG Research Reports']
      };
    }

    // Client-related queries
    if (lowerQuery.includes('client') || lowerQuery.includes('portfolio') || lowerQuery.includes('review')) {
      return {
        content: `Here's your client portfolio overview:

**Upcoming Reviews**:
- **Johnson Family**: April 15, 2025 (Quarterly review)
- **Martinez Family**: March 15, 2025 (Semi-annual review)  
- **Davis Trust**: April 5, 2025 (Annual review)

**Performance Alerts**:
- Peterson Holdings: Portfolio concentration risk (75% tech sector)
- Thompson Industries: Underperforming vs benchmark (-2.3% YTD)

**Opportunity Clients**:
- Anderson Family (Prospect): $3M+ portfolio ready for onboarding
- Stevens Corporation: Corporate wealth management expansion potential

**ESG Candidates**:
- Johnson Family: Already expressed interest in sustainable investing
- Martinez Family: Values-aligned investment profile
- Williams Estate: Philanthropic giving history

Would you like me to prioritize any of these opportunities or generate specific client action plans?`,
        category: 'client',
        sources: ['Client Database', 'Portfolio Analytics', 'CRM System']
      };
    }

    // General response
    return {
      content: `I can help you with various aspects of your advisory practice:

📊 **Client Management**: Portfolio reviews, risk assessments, and relationship insights
📅 **Meeting Support**: Action items, follow-ups, and preparation materials  
💼 **UBS Services**: Product recommendations, compliance guidance, and market insights
📈 **Analytics**: Performance tracking, opportunity identification, and trend analysis

What specific area would you like to explore? I have access to your complete meeting history, client database, and the full UBS product ecosystem.`,
      category: 'general',
      sources: ['Knowledge Base', 'UBS Systems Integration']
    };
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const getCategoryIcon = (category?: ChatMessage['category']) => {
    switch (category) {
      case 'meeting': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'service': return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'client': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <Bot className="h-4 w-4 text-red-600" />;
    }
  };

  const filteredMessages = messages.filter(message => 
    selectedCategory === 'all' || 
    (selectedCategory === 'meetings' && message.category === 'meeting') ||
    (selectedCategory === 'services' && message.category === 'service') ||
    (selectedCategory === 'clients' && message.category === 'client')
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-1">Ask questions about meetings, clients, and UBS services</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="meetings">Meetings</option>
            <option value="services">Services</option>
            <option value="clients">Clients</option>
          </select>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Online</span>
            </div>
            <span>•</span>
            <span>UBS Knowledge Base Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Suggested Questions Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Suggested Questions
            </h3>
            
            <div className="space-y-4">
              {suggestedQuestions.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.category}>
                    <div className={`flex items-center space-x-2 p-2 rounded-lg ${category.color} mb-2`}>
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{category.category}</span>
                    </div>
                    <div className="space-y-2">
                      {category.questions.slice(0, 2).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="block w-full text-left text-xs text-gray-600 hover:text-red-600 hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
              Quick Insights
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Clients</span>
                <span className="font-semibold text-gray-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Tasks</span>
                <span className="font-semibold text-orange-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Week's Meetings</span>
                <span className="font-semibold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total AUM</span>
                <span className="font-semibold text-green-600">$52.3M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: '600px' }}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">UBS AI Assistant</h3>
                    <p className="text-sm text-gray-500">Ask me about meetings, clients, and services</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Search className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-red-600" />
                          ) : (
                            getCategoryIcon(message.category)
                          )}
                        </div>
                        
                        <div className={`p-4 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-50 text-gray-900'
                        }`}>
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className={`${i > 0 ? 'mt-2' : ''} ${message.role === 'user' ? 'text-white' : ''}`}>
                                {line.startsWith('**') && line.endsWith('**') ? (
                                  <strong>{line.slice(2, -2)}</strong>
                                ) : (
                                  line
                                )}
                              </p>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20 border-gray-200">
                            <span className={`text-xs ${
                              message.role === 'user' ? 'text-red-200' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            
                            {message.sources && (
                              <div className="flex items-center space-x-1">
                                <FileText className={`h-3 w-3 ${message.role === 'user' ? 'text-red-200' : 'text-gray-400'}`} />
                                <span className={`text-xs ${message.role === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
                                  {message.sources.length} sources
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about meetings, clients, UBS services, or portfolio insights..."
                    disabled={isLoading}
                    className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
                <motion.button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send • AI responses are based on UBS knowledge and your data</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3 text-blue-500" />
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Cpu className="h-3 w-3 text-purple-500" />
                    <span>GPT-4</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;