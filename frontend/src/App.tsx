import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import MeetingSubmenu from './components/MeetingSubmenu';
import Dashboard from './components/Dashboard';
import PreMeetingDashboard from './components/PreMeetingDashboard';
import LiveMeetingView from './components/LiveMeetingView';
import ClientJourney from './components/ClientJourney';
import PostMeetingWorkspace from './components/PostMeetingWorkspace';
import TasksView from './components/TasksView';
import ClientDatabase from './components/ClientDatabase';
import AIAssistant from './components/AIAssistant';
import MeetingAnalytics from './components/MeetingAnalytics';
import { ViewMode, CalendarEvent } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [notificationCount] = useState(3);

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setCurrentView('prep'); // Default to prep view when event is selected
  };

  const isMeetingView = ['prep', 'live', 'post', 'analytics'].includes(currentView);

  const renderCurrentView = () => {
    const viewVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    switch (currentView) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Dashboard onEventSelect={handleEventSelect} />
          </motion.div>
        );
      case 'tasks':
        return (
          <motion.div
            key="tasks"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <TasksView />
          </motion.div>
        );
      case 'clients':
        return (
          <motion.div
            key="clients"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ClientDatabase />
          </motion.div>
        );
      case 'assistant':
        return (
          <motion.div
            key="assistant"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <AIAssistant />
          </motion.div>
        );
      case 'prep':
        return (
          <motion.div
            key="prep"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PreMeetingDashboard />
          </motion.div>
        );
      case 'live':
        return (
          <motion.div
            key="live"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <LiveMeetingView />
          </motion.div>
        );
      case 'journey':
        return (
          <motion.div
            key="journey"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ClientJourney />
          </motion.div>
        );
      case 'post':
        return (
          <motion.div
            key="post"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PostMeetingWorkspace />
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div
            key="analytics"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <MeetingAnalytics />
          </motion.div>
        );
      default:
        return <PreMeetingDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        notificationCount={notificationCount}
      />
      
      {/* Meeting Submenu - only show when in meeting views */}
      {isMeetingView && selectedEvent && (
        <MeetingSubmenu
          currentView={currentView}
          onViewChange={setCurrentView}
          meetingTitle={selectedEvent.title}
          meetingTime={`${new Date(selectedEvent.date).toLocaleDateString()} at ${selectedEvent.time}`}
        />
      )}
      
      <AnimatePresence mode="wait">
        {renderCurrentView()}
      </AnimatePresence>
      
      {/* Global Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E60028' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
    </div>
  );
}

export default App;