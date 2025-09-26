import React from 'react';
import { Calendar, FileText, Users, AlertTriangle, TrendingUp, Clock, Plus } from 'lucide-react';
import { mockMeetingBrief } from '../utils/mockData';

const PreMeetingDashboard: React.FC = () => {
  const brief = mockMeetingBrief;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pre-Meeting Preparation</h2>
        <div className="text-sm text-gray-500">
          Meeting in 45 minutes
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Brief Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-red-600" />
                Meeting Brief
              </h3>
              <span className="text-sm text-gray-500">{formatDate(brief.date)}</span>
            </div>
            <p className="text-gray-600 mt-1">{brief.title}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Participants */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brief.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      participant.isAdvisor ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {participant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{participant.name}</div>
                      <div className="text-sm text-gray-500">{participant.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Highlights */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Previous Meeting Highlights</h4>
              <ul className="space-y-2">
                {brief.previousHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Open Tasks */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pending Tasks</h4>
              <div className="space-y-2">
                {brief.openTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-gray-700">{task.description}</span>
                    </div>
                    <div className="text-xs text-yellow-600 font-medium">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Flags */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk & Compliance Flags</h4>
              <div className="space-y-2">
                {brief.riskFlags.map((flag) => (
                  <div key={flag.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${getRiskColor(flag.severity)}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">{flag.message}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white">
                      {flag.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Services */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Upsell Opportunities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {brief.suggestedServices.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Quick Access
            </h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">Client Contracts</div>
                <div className="text-sm text-gray-500">View agreements & terms</div>
              </button>
              
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">Previous Notes</div>
                <div className="text-sm text-gray-500">Meeting history & insights</div>
              </button>
              
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">Uploaded Documents</div>
                <div className="text-sm text-gray-500">Client-provided materials</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Calendar Integration
            </h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Agenda Item</span>
              </button>
              
              <div className="text-sm text-gray-500 text-center">
                Next available slot: Tomorrow 2:00 PM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreMeetingDashboard;