import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, TrendingUp, MessageCircle, Volume2, VolumeX, 
  Users, Target, CheckSquare, AlertTriangle, BarChart3,
  Activity, Smile, Meh, Frown, Mic, MicOff, Timer,
  Brain, Zap, Award, Calendar, FileText, ChevronDown,
  PieChart, TrendingDown
} from 'lucide-react';
import { MeetingAnalytics as MeetingAnalyticsType } from '../types';

const MeetingAnalytics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sentiment' | 'engagement' | 'outcomes'>('overview');

  // Mock data based on Johnson Family meeting transcript
  const meetingAnalytics: MeetingAnalyticsType = {
    id: 'analytics-123',
    meetingId: 'meeting-123',
    duration: 75, // 1 hour 15 minutes
    sentimentBreakdown: {
      happy: { percentage: 68, minutes: 51 },
      neutral: { percentage: 24, minutes: 18 },
      dissatisfied: { percentage: 8, minutes: 6 }
    },
    silenceMetrics: {
      totalSilenceMinutes: 4.2,
      silencePercentage: 5.6,
      longestSilenceDuration: 0.8,
      silenceFrequency: 12
    },
    engagementMetrics: {
      speakingTime: {
        'Emma Thompson (Advisor)': 32,
        'Sarah Johnson': 18,
        'Michael Johnson': 16,
        'David Chen (Tax Specialist)': 9
      },
      interruptionCount: 3,
      questionCount: 24,
      actionItemsGenerated: 8
    },
    communicationMetrics: {
      wordsPerMinute: 145,
      totalWords: 10875,
      vocabularyDiversity: 0.72,
      clarificationRequests: 5
    },
    outcomeMetrics: {
      objectivesMet: 4,
      followUpTasks: 3,
      decisionsReached: 2,
      nextMeetingScheduled: true
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSentimentColor = (type: 'happy' | 'neutral' | 'dissatisfied') => {
    switch (type) {
      case 'happy': return 'bg-green-500';
      case 'neutral': return 'bg-yellow-500';
      case 'dissatisfied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentIcon = (type: 'happy' | 'neutral' | 'dissatisfied') => {
    switch (type) {
      case 'happy': return Smile;
      case 'neutral': return Meh;
      case 'dissatisfied': return Frown;
      default: return Meh;
    }
  };

  const participantColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Analytics</h1>
          <p className="text-gray-600 mt-1">Johnson Family Quarterly Review - Performance Analysis</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Duration: {formatDuration(meetingAnalytics.duration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{Object.keys(meetingAnalytics.engagementMetrics.speakingTime).length} Participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{meetingAnalytics.engagementMetrics.actionItemsGenerated} Action Items</span>
          </div>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sentiment', label: 'Sentiment Analysis', icon: Smile },
          { id: 'engagement', label: 'Engagement', icon: MessageCircle },
          { id: 'outcomes', label: 'Outcomes', icon: Target }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Overall Satisfaction',
                  value: '92%',
                  icon: Award,
                  color: 'bg-green-100 text-green-600',
                  description: 'Based on sentiment analysis'
                },
                {
                  label: 'Engagement Score',
                  value: '8.4/10',
                  icon: Activity,
                  color: 'bg-blue-100 text-blue-600',
                  description: 'Participation & interaction'
                },
                {
                  label: 'Efficiency Rating',
                  value: '85%',
                  icon: Zap,
                  color: 'bg-purple-100 text-purple-600',
                  description: 'Talk time vs silence ratio'
                },
                {
                  label: 'Action Completion',
                  value: '100%',
                  icon: CheckSquare,
                  color: 'bg-orange-100 text-orange-600',
                  description: 'Objectives achieved'
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{metric.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Silence & Communication Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <VolumeX className="h-5 w-5 mr-2 text-gray-600" />
                  Silence & Flow Analysis
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Timer className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Total Silence Time</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatDuration(meetingAnalytics.silenceMetrics.totalSilenceMinutes)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {meetingAnalytics.silenceMetrics.silencePercentage}% of meeting
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MicOff className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-gray-700">Longest Silent Period</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {meetingAnalytics.silenceMetrics.longestSilenceDuration}m
                      </div>
                      <div className="text-xs text-gray-500">
                        {meetingAnalytics.silenceMetrics.silenceFrequency} silent moments
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Communication Flow</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {meetingAnalytics.communicationMetrics.wordsPerMinute} WPM
                      </div>
                      <div className="text-xs text-gray-500">
                        {meetingAnalytics.communicationMetrics.totalWords.toLocaleString()} total words
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Effectiveness */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Meeting Effectiveness
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-700">Objectives Met</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-700">
                        {meetingAnalytics.outcomeMetrics.objectivesMet}/4
                      </div>
                      <div className="text-xs text-green-600">100% success rate</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Questions Asked</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-700">
                        {meetingAnalytics.engagementMetrics.questionCount}
                      </div>
                      <div className="text-xs text-blue-600">High engagement</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Action Items</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-700">
                        {meetingAnalytics.engagementMetrics.actionItemsGenerated}
                      </div>
                      <div className="text-xs text-orange-600">Clear next steps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sentiment Analysis Tab */}
        {selectedTab === 'sentiment' && (
          <motion.div
            key="sentiment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Sentiment Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Analysis Breakdown</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sentiment Chart */}
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-4">
                    <svg width="256" height="256" viewBox="0 0 256 256">
                      {Object.entries(meetingAnalytics.sentimentBreakdown).map(([sentiment, data], index) => {
                        const totalPercentage = Object.values(meetingAnalytics.sentimentBreakdown)
                          .reduce((sum, s) => sum + s.percentage, 0);
                        const normalizedPercentage = (data.percentage / totalPercentage) * 100;
                        const startAngle = Object.entries(meetingAnalytics.sentimentBreakdown)
                          .slice(0, index)
                          .reduce((sum, [, s]) => sum + (s.percentage / totalPercentage) * 360, 0);
                        const endAngle = startAngle + (normalizedPercentage / 100) * 360;
                        const largeArcFlag = normalizedPercentage > 50 ? 1 : 0;
                        
                        const x1 = 128 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                        const y1 = 128 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                        const x2 = 128 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                        const y2 = 128 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                        
                        const color = sentiment === 'happy' ? '#10b981' :
                                     sentiment === 'neutral' ? '#f59e0b' : '#ef4444';
                        
                        return (
                          <path
                            key={sentiment}
                            d={`M 128 128 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={color}
                            className="hover:opacity-80 transition-opacity"
                          />
                        );
                      })}
                      <circle cx="128" cy="128" r="40" fill="white" />
                      <text x="128" y="120" textAnchor="middle" className="text-sm font-medium fill-gray-900">
                        Overall
                      </text>
                      <text x="128" y="136" textAnchor="middle" className="text-xs fill-gray-500">
                        92% Positive
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Sentiment Details */}
                <div className="space-y-4">
                  {Object.entries(meetingAnalytics.sentimentBreakdown).map(([sentiment, data]) => {
                    const SentimentIcon = getSentimentIcon(sentiment as any);
                    return (
                      <div key={sentiment} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getSentimentColor(sentiment as any)}`}>
                            <SentimentIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 capitalize">
                              {sentiment} Sentiment
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDuration(data.minutes)} of meeting time
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{data.percentage}%</div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full ${getSentimentColor(sentiment as any)}`}
                              style={{ width: `${data.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sentiment Timeline */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Sentiment Flow Throughout Meeting</h4>
                <div className="h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="bg-green-500 h-full" style={{ width: '68%' }}></div>
                    <div className="bg-yellow-500 h-full" style={{ width: '24%' }}></div>
                    <div className="bg-red-500 h-full" style={{ width: '8%' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm mix-blend-difference">
                      Meeting Sentiment Timeline
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Meeting Start</span>
                  <span>Most positive during portfolio review</span>
                  <span>Meeting End</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Engagement Tab */}
        {selectedTab === 'engagement' && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Speaking Time Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Speaking Time Distribution</h3>
              
              <div className="space-y-4">
                {Object.entries(meetingAnalytics.engagementMetrics.speakingTime).map(([participant, minutes], index) => {
                  const percentage = (minutes / meetingAnalytics.duration) * 100;
                  return (
                    <div key={participant} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${participantColors[index]}`}></div>
                          <span className="font-medium text-gray-900">{participant}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{formatDuration(minutes)}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${participantColors[index]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Quality</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Questions Asked</span>
                    <span className="font-semibold text-blue-600">{meetingAnalytics.engagementMetrics.questionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Clarifications Requested</span>
                    <span className="font-semibold text-yellow-600">{meetingAnalytics.communicationMetrics.clarificationRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Interruptions</span>
                    <span className="font-semibold text-red-600">{meetingAnalytics.engagementMetrics.interruptionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vocabulary Diversity</span>
                    <span className="font-semibold text-purple-600">
                      {(meetingAnalytics.communicationMetrics.vocabularyDiversity * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participation Analysis</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Excellent Engagement</span>
                    </div>
                    <p className="text-sm text-green-700">
                      All participants actively contributed to the discussion
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Balanced Conversation</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Good balance between advisor guidance and client input
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Minor Interruptions</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {meetingAnalytics.engagementMetrics.interruptionCount} interruptions detected - within normal range
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Outcomes Tab */}
        {selectedTab === 'outcomes' && (
          <motion.div
            key="outcomes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Outcomes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Meeting Outcomes & Achievements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Objectives Met',
                    value: `${meetingAnalytics.outcomeMetrics.objectivesMet}/4`,
                    percentage: (meetingAnalytics.outcomeMetrics.objectivesMet / 4) * 100,
                    icon: Target,
                    color: 'green'
                  },
                  {
                    label: 'Follow-up Tasks',
                    value: meetingAnalytics.outcomeMetrics.followUpTasks.toString(),
                    percentage: 75,
                    icon: FileText,
                    color: 'blue'
                  },
                  {
                    label: 'Decisions Made',
                    value: meetingAnalytics.outcomeMetrics.decisionsReached.toString(),
                    percentage: 100,
                    icon: CheckSquare,
                    color: 'purple'
                  },
                  {
                    label: 'Next Meeting',
                    value: meetingAnalytics.outcomeMetrics.nextMeetingScheduled ? 'Scheduled' : 'Pending',
                    percentage: meetingAnalytics.outcomeMetrics.nextMeetingScheduled ? 100 : 0,
                    icon: Calendar,
                    color: 'orange'
                  }
                ].map((outcome, index) => (
                  <motion.div
                    key={outcome.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 text-center"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                      outcome.color === 'green' ? 'bg-green-100 text-green-600' :
                      outcome.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      outcome.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <outcome.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{outcome.value}</div>
                    <div className="text-sm font-medium text-gray-600 mb-2">{outcome.label}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-full rounded-full ${
                          outcome.color === 'green' ? 'bg-green-500' :
                          outcome.color === 'blue' ? 'bg-blue-500' :
                          outcome.color === 'purple' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${outcome.percentage}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Meeting Quality Score */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Meeting Quality Assessment</h3>
              
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">92</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="92, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Excellent</div>
                  <div className="text-sm text-green-600">Client satisfaction achieved</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Productive</div>
                  <div className="text-sm text-blue-600">All objectives accomplished</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">Efficient</div>
                  <div className="text-sm text-purple-600">Optimal time utilization</div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Recommendations for Future Meetings
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Consider extending discussion time for complex topics (detected some rushed explanations)</li>
                  <li>• Excellent client engagement - maintain current interactive approach</li>
                  <li>• Follow-up documentation quality is strong - continue current practice</li>
                  <li>• Sentiment analysis shows high satisfaction - successful advisor-client relationship</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingAnalytics;