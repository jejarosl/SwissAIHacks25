import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import PreMeetingDashboard from './components/PreMeetingDashboard';
import LiveMeetingView from './components/LiveMeetingView';
import PostMeetingWorkspace from './components/PostMeetingWorkspace';
import { ViewMode } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('prep');
  const [notificationCount] = useState(3);

  const renderCurrentView = () => {
    const viewVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    switch (currentView) {
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