import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Settings, User, ChevronDown, Globe, Shield, 
  Cpu, Cloud, Smartphone 
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  notificationCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  notificationCount = 0 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Main dashboard tab
  const dashboardTab = { id: 'dashboard' as ViewMode, label: 'Dashboard', description: 'Overview & Calendar' };
  
  // Meeting-specific tabs (only show when an event is selected)
  const meetingTabs = [
    { id: 'prep' as ViewMode, label: 'Pre-Meeting', description: 'Preparation & Planning' },
    { id: 'live' as ViewMode, label: 'Live Meeting', description: 'Active Session' },
    { id: 'post' as ViewMode, label: 'Post-Meeting', description: 'Follow-up & Tasks' }
  ];

  const notifications = [
    { id: '1', message: 'Client asked for a proposal — not yet approved as task', time: '2 min ago', type: 'alert' },
    { id: '2', message: 'Meeting starting in 15 minutes', time: '10 min ago', type: 'reminder' },
    { id: '3', message: 'New document uploaded by client', time: '1 hour ago', type: 'info' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-8"
          >
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="/ubs-logo.svg" 
                alt="UBS Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Client Advisory Intelligence
              </h1>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              {/* Always show Dashboard tab */}
              <motion.button
                key={dashboardTab.id}
                onClick={() => onViewChange(dashboardTab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === dashboardTab.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{dashboardTab.label}</span>
                  <span className={`text-xs ${
                    currentView === dashboardTab.id ? 'text-red-200' : 'text-gray-400'
                  }`}>
                    {dashboardTab.description}
                  </span>
                </div>
              </motion.button>
              
              {/* Show meeting tabs only when not on dashboard */}
              {currentView !== 'dashboard' && (
                <>
                  <div className="w-px h-8 bg-gray-200 mx-2 self-center" />
                  {meetingTabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => onViewChange(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentView === tab.id
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{tab.label}</span>
                        <span className={`text-xs ${
                          currentView === tab.id ? 'text-red-200' : 'text-gray-400'
                        }`}>
                          {tab.description}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </>
              )}
            </div>
          </motion.div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <motion.button 
                onClick={() => setShowNotifications(!showNotifications)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 hover:bg-gray-50 border-b border-gray-50">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Settings */}
            <div className="relative">
              <motion.button 
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </motion.button>

              {/* Settings Dropdown */}
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">AI Model</label>
                        <select className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm">
                          <option value="azure">Azure OpenAI</option>
                          <option value="apertus">Apertus AI</option>
                          <option value="local">On-device Model</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Language</label>
                        <select className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm">
                          <option value="en">English</option>
                          <option value="de">German</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm text-gray-700">Compliance Mode</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* User Profile */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 border-l border-gray-200 pl-4"
            >
              <div className="bg-red-600 rounded-full p-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Emma Thompson</div>
                <div className="text-gray-500">Senior Advisor</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showSettings) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowSettings(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navigation;