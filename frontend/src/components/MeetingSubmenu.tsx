import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, CheckSquare, Clock, Users } from 'lucide-react';
import { ViewMode } from '../types';

interface MeetingSubmenuProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  meetingTitle?: string;
  meetingTime?: string;
}

const MeetingSubmenu: React.FC<MeetingSubmenuProps> = ({
  currentView,
  onViewChange,
  meetingTitle = "Johnson Family Quarterly Review",
  meetingTime = "Today at 2:00 PM"
}) => {
  const meetingTabs = [
    { 
      id: 'prep' as ViewMode, 
      label: 'Pre-Meeting', 
      description: 'Preparation & Planning',
      icon: Calendar,
      color: 'text-blue-600'
    },
    { 
      id: 'live' as ViewMode, 
      label: 'Live Meeting', 
      description: 'Active Session',
      icon: Play,
      color: 'text-green-600'
    },
    { 
      id: 'journey' as ViewMode, 
      label: 'Client Journey', 
      description: 'Analytics & History',
      icon: Users,
      color: 'text-purple-600'
    },
    { 
      id: 'post' as ViewMode, 
      label: 'Post-Meeting', 
      description: 'Follow-up & Tasks',
      icon: CheckSquare,
      color: 'text-orange-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Meeting Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h2 className="font-semibold text-gray-900">{meetingTitle}</h2>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{meetingTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>4 participants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Phase Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {meetingTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    currentView === tab.id
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className={`h-4 w-4 ${currentView === tab.id ? 'text-red-600' : tab.color}`} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MeetingSubmenu;