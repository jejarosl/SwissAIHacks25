import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, DollarSign, TrendingUp, TrendingDown, 
  Target, Award, AlertTriangle, Phone, Video, MapPin,
  FileText, Star, BarChart3, PieChart, Activity
} from 'lucide-react';

interface JourneyEvent {
  id: string;
  date: string;
  type: 'meeting' | 'milestone' | 'transaction' | 'document' | 'goal';
  title: string;
  description: string;
  value?: number;
  status?: 'completed' | 'in-progress' | 'planned';
  icon: any;
}

interface PortfolioData {
  month: string;
  value: number;
  benchmark: number;
}

interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
  color: string;
}

const ClientJourney: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'performance' | 'analytics'>('timeline');

  const clientInfo = {
    name: 'Johnson Family',
    clientSince: '2020-03-15',
    portfolio: 2500000,
    riskProfile: 'Moderate',
    primaryGoals: ['Retirement Planning', 'Education Funding', 'Wealth Preservation'],
    nextReview: '2025-04-15'
  };

  const journeyEvents: JourneyEvent[] = [
    {
      id: '1',
      date: '2025-01-20',
      type: 'meeting',
      title: 'Quarterly Portfolio Review',
      description: 'Discussed Q4 performance and 2025 strategy',
      icon: User,
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-12-15',
      type: 'transaction',
      title: 'ESG Portfolio Rebalancing',
      description: 'Shifted 15% to sustainable investments',
      value: 375000,
      icon: TrendingUp,
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-11-20',
      type: 'milestone',
      title: 'Portfolio Milestone Achieved',
      description: 'Reached $2.5M portfolio value target',
      value: 2500000,
      icon: Award,
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-10-10',
      type: 'meeting',
      title: 'Estate Planning Session',
      description: 'Updated trust structure and beneficiaries',
      icon: FileText,
      status: 'completed'
    },
    {
      id: '5',
      date: '2024-09-05',
      type: 'document',
      title: 'Investment Policy Statement Update',
      description: 'Revised IPS to reflect new risk tolerance',
      icon: FileText,
      status: 'completed'
    },
    {
      id: '6',
      date: '2025-02-15',
      type: 'goal',
      title: 'Education Funding Review',
      description: 'Assess 529 plan performance and contributions',
      icon: Target,
      status: 'planned'
    },
    {
      id: '7',
      date: '2025-03-01',
      type: 'milestone',
      title: 'Tax Season Preparation',
      description: 'Gather documents and optimize tax strategy',
      icon: AlertTriangle,
      status: 'planned'
    }
  ];

  const portfolioPerformance: PortfolioData[] = [
    { month: 'Jan 2024', value: 2100000, benchmark: 2080000 },
    { month: 'Feb 2024', value: 2150000, benchmark: 2120000 },
    { month: 'Mar 2024', value: 2200000, benchmark: 2160000 },
    { month: 'Apr 2024', value: 2180000, benchmark: 2190000 },
    { month: 'May 2024', value: 2250000, benchmark: 2210000 },
    { month: 'Jun 2024', value: 2300000, benchmark: 2260000 },
    { month: 'Jul 2024', value: 2350000, benchmark: 2300000 },
    { month: 'Aug 2024', value: 2320000, benchmark: 2320000 },
    { month: 'Sep 2024', value: 2400000, benchmark: 2380000 },
    { month: 'Oct 2024', value: 2450000, benchmark: 2420000 },
    { month: 'Nov 2024', value: 2500000, benchmark: 2460000 },
    { month: 'Dec 2024', value: 2500000, benchmark: 2480000 }
  ];

  const assetAllocation: AssetAllocation[] = [
    { category: 'Equities', percentage: 60, value: 1500000, color: 'bg-blue-500' },
    { category: 'Fixed Income', percentage: 25, value: 625000, color: 'bg-green-500' },
    { category: 'Alternatives', percentage: 10, value: 250000, color: 'bg-purple-500' },
    { category: 'Cash', percentage: 5, value: 125000, color: 'bg-gray-500' }
  ];

  const getEventIcon = (event: JourneyEvent) => {
    const IconComponent = event.icon;
    const colorClass = event.status === 'completed' ? 'text-green-600' : 
                      event.status === 'in-progress' ? 'text-blue-600' : 'text-gray-400';
    return <IconComponent className={`h-5 w-5 ${colorClass}`} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMaxValue = () => {
    return Math.max(...portfolioPerformance.map(d => Math.max(d.value, d.benchmark)));
  };

  const maxValue = calculateMaxValue();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Journey Analytics</h1>
          <p className="text-gray-600 mt-1">{clientInfo.name} - Comprehensive relationship overview</p>
        </div>
        
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Client Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Portfolio Value', 
            value: formatCurrency(clientInfo.portfolio), 
            icon: DollarSign, 
            color: 'bg-green-100 text-green-600',
            change: '+8.5%'
          },
          { 
            label: 'Client Since', 
            value: new Date(clientInfo.clientSince).getFullYear().toString(), 
            icon: Calendar, 
            color: 'bg-blue-100 text-blue-600',
            change: `${Math.floor((Date.now() - new Date(clientInfo.clientSince).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
          },
          { 
            label: 'Risk Profile', 
            value: clientInfo.riskProfile, 
            icon: Activity, 
            color: 'bg-purple-100 text-purple-600',
            change: 'Stable'
          },
          { 
            label: 'Goals Progress', 
            value: `${clientInfo.primaryGoals.length}`, 
            icon: Target, 
            color: 'bg-orange-100 text-orange-600',
            change: '2 on track'
          }
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Timeline */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Client Relationship Timeline</h3>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {journeyEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start space-x-4"
                      >
                        <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-md ${
                          event.status === 'completed' ? 'bg-green-100' :
                          event.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getEventIcon(event)}
                        </div>
                        
                        <div className="flex-1 min-w-0 pb-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                              {event.value && (
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  {formatCurrency(event.value)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                event.status === 'completed' ? 'bg-green-100 text-green-700' :
                                event.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {event.status === 'completed' ? 'Completed' :
                                 event.status === 'in-progress' ? 'In Progress' : 'Planned'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Goals & Milestones */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Goals</h3>
                <div className="space-y-3">
                  {clientInfo.primaryGoals.map((goal, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{goal}</span>
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Meetings</span>
                    <span className="text-sm font-semibold text-gray-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portfolio Growth</span>
                    <span className="text-sm font-semibold text-green-600">+19.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction Score</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Review</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {new Date(clientInfo.nextReview).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance vs Benchmark</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Portfolio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Benchmark</span>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-80 mb-8">
              <svg width="100%" height="100%" viewBox="0 0 800 320" className="overflow-visible">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="60"
                    y1={60 + i * 50}
                    x2="740"
                    y2={60 + i * 50}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis labels */}
                {[2500000, 2375000, 2250000, 2125000, 2000000].map((value, i) => (
                  <text
                    key={i}
                    x="50"
                    y={65 + i * 50}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {formatCurrency(value)}
                  </text>
                ))}

                {/* Portfolio line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={portfolioPerformance.map((d, i) => 
                    `${60 + (i * 56.67)},${260 - ((d.value - 2000000) / 500000) * 200}`
                  ).join(' ')}
                />

                {/* Benchmark line */}
                <polyline
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  points={portfolioPerformance.map((d, i) => 
                    `${60 + (i * 56.67)},${260 - ((d.benchmark - 2000000) / 500000) * 200}`
                  ).join(' ')}
                />

                {/* Data points */}
                {portfolioPerformance.map((d, i) => (
                  <circle
                    key={i}
                    cx={60 + (i * 56.67)}
                    cy={260 - ((d.value - 2000000) / 500000) * 200}
                    r="4"
                    fill="#3b82f6"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                ))}

                {/* X-axis labels */}
                {portfolioPerformance.map((d, i) => (
                  <text
                    key={i}
                    x={60 + (i * 56.67)}
                    y={285}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {d.month.split(' ')[0]}
                  </text>
                ))}
              </svg>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Return</p>
                    <p className="text-2xl font-bold text-green-700">+19.2%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">vs Benchmark</p>
                    <p className="text-2xl font-bold text-blue-700">+1.8%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Volatility</p>
                    <p className="text-2xl font-bold text-purple-700">12.4%</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {/* Asset Allocation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Allocation</h3>
              
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-64 h-64">
                  <svg width="256" height="256" viewBox="0 0 256 256">
                    {assetAllocation.map((asset, index) => {
                      const startAngle = assetAllocation
                        .slice(0, index)
                        .reduce((sum, a) => sum + (a.percentage / 100) * 360, 0);
                      const endAngle = startAngle + (asset.percentage / 100) * 360;
                      const largeArcFlag = asset.percentage > 50 ? 1 : 0;
                      
                      const x1 = 128 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = 128 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = 128 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = 128 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      return (
                        <path
                          key={index}
                          d={`M 128 128 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={asset.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                                asset.color.replace('bg-', '').replace('-500', '') === 'green' ? '#10b981' :
                                asset.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#8b5cf6' : '#6b7280'}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                    <circle cx="128" cy="128" r="40" fill="white" />
                    <text x="128" y="120" textAnchor="middle" className="text-sm font-medium fill-gray-900">
                      Portfolio
                    </text>
                    <text x="128" y="136" textAnchor="middle" className="text-xs fill-gray-500">
                      {formatCurrency(clientInfo.portfolio)}
                    </text>
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                {assetAllocation.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${asset.color}`}></div>
                      <span className="font-medium text-gray-900">{asset.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{asset.percentage}%</div>
                      <div className="text-sm text-gray-500">{formatCurrency(asset.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Analytics</h3>
              
              <div className="space-y-6">
                {/* Risk Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Risk Score</span>
                    <span className="text-sm font-bold text-gray-900">6.2/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Moderate Risk Profile</p>
                </div>

                {/* Sharpe Ratio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Sharpe Ratio</span>
                    <span className="text-sm font-bold text-gray-900">1.34</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Excellent risk-adjusted return</p>
                </div>

                {/* Beta */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Beta</span>
                    <span className="text-sm font-bold text-gray-900">0.87</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43.5%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lower volatility than market</p>
                </div>

                {/* Max Drawdown */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Max Drawdown</span>
                    <span className="text-sm font-bold text-red-600">-8.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Worst peak-to-trough decline</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Risk Assessment</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Portfolio demonstrates good diversification with moderate risk levels. 
                      Current allocation aligns well with client's risk tolerance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientJourney;