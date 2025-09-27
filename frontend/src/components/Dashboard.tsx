import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, FileText, AlertCircle, ChevronLeft, ChevronRight, Plus, Filter, Search, Video, Phone, Presentation, FileCheck, Star, Send, Upload, CreditCard as Edit, UserPlus, TrendingUp, Bell, BarChart3 } from 'lucide-react';
import { CalendarEvent, ViewMode } from '../types';
import { mockCalendarEvents, mockTasks } from '../utils/mockData';

interface DashboardProps {
  onEventSelect: (event: CalendarEvent) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEventSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState<string>('all');

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        return eventDateTime >= now;
      })
      .filter(event => filterType === 'all' || event.type === filterType)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return Users;
      case 'call': return Phone;
      case 'presentation': return Presentation;
      case 'review': return FileCheck;
      default: return Calendar;
    }
  };

  const getFormatIcon = (format: CalendarEvent['format']) => {
    switch (format) {
      case 'video': return Video;
      case 'in-person': return MapPin;
      case 'phone': return Phone;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'call': return 'bg-green-100 text-green-700 border-green-200';
      case 'presentation': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'review': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFormatColor = (format: CalendarEvent['format']) => {
    switch (format) {
      case 'video': return 'text-blue-600';
      case 'in-person': return 'text-green-600';
      case 'phone': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const endHours = Math.floor((hours * 60 + minutes + duration) / 60);
    const endMinutes = (hours * 60 + minutes + duration) % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Your meetings and events overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="meeting">Meetings</option>
            <option value="call">Calls</option>
            <option value="presentation">Presentations</option>
            <option value="review">Reviews</option>
          </select>
        </div>
      </div>

      {/* Daily Accountability - Compact */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Daily Accountability</h3>
            <p className="text-xs text-gray-500">Your client engagement metrics</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {Math.round(mockCalendarEvents.reduce((sum, event) => sum + event.duration, 0) / 60)}h total this month
            </div>
            <div className="text-xs text-gray-500">Across {mockCalendarEvents.length} meetings</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{events.filter(e => new Date(e.date).toDateString() === today.toDateString()).length}</div>
            <div className="text-xs font-medium text-blue-800">Today's Meetings</div>
            <div className="text-xs text-blue-600">
              {events.filter(e => new Date(e.date).toDateString() === today.toDateString()).reduce((sum, e) => sum + e.duration, 0)}min scheduled
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-600">
              31h
            </div>
            <div className="text-xs font-medium text-green-800">This Week</div>
            <div className="text-xs text-green-600">{events.length} meetings total</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-600">
              15m
            </div>
            <div className="text-xs font-medium text-purple-800">Avg Duration</div>
            <div className="text-xs text-purple-600">Per meeting</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-orange-600">
              45
            </div>
            <div className="text-xs font-medium text-orange-800">Remote Meetings</div>
            <div className="text-xs text-orange-600">
              82% of total
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="xl:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24 p-1"></div>;
                  }

                  const date = new Date(currentYear, currentMonth, day);
                  const dayEvents = getEventsForDate(date);
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.02 }}
                      className={`h-24 p-1 cursor-pointer border rounded-lg transition-colors ${
                        isToday ? 'bg-red-50 border-red-200' :
                        isSelected ? 'bg-blue-50 border-blue-200' :
                        'border-gray-100 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium ${
                        isToday ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                          >
                            <div className="flex items-center space-x-1">
                              {event.format === 'video' && <Video className="h-2 w-2" />}
                              {event.format === 'in-person' && <MapPin className="h-2 w-2" />}
                              {event.format === 'phone' && <Phone className="h-2 w-2" />}
                              <span>{event.title.substring(0, 8)}...</span>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Events List */}
        <div className={viewMode === 'list' ? 'xl:col-span-3' : 'xl:col-span-1'}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <p className="text-sm text-gray-500 mt-1">
                {getUpcomingEvents().length} events scheduled
              </p>
            </div>

            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 640px)' }}>
              <div className="space-y-1 p-2">
                {getUpcomingEvents().map((event, index) => {
                  const EventIcon = getEventTypeIcon(event.type);
                  const eventDate = new Date(event.date);
                  const isToday = eventDate.toDateString() === today.toDateString();
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onEventSelect(event)}
                      className={`p-4 border-l-4 cursor-pointer hover:shadow-md transition-all ${getPriorityColor(event.priority)} bg-white hover:bg-gray-50 rounded-lg border border-gray-100`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <EventIcon className="h-4 w-4 text-gray-500" />
                            <div className={`flex items-center space-x-1 ${getFormatColor(event.format)}`}>
                              {React.createElement(getFormatIcon(event.format), { className: "h-3 w-3" })}
                              <span className="text-xs font-medium capitalize">
                                {event.format.replace('-', ' ')}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEventTypeColor(event.type)}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                            {event.priority === 'high' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {event.title}
                          </h4>
                          
                          <div className="space-y-1 text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {isToday ? 'Today' : eventDate.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(event.time, event.duration)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{event.participants.length} participants</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-2">
                          <div className="flex items-center space-x-1">
                            {event.hasPrep && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has prep materials" />
                            )}
                            {event.hasDocuments && (
                              <FileText className="h-3 w-3 text-gray-400" title="Has documents" />
                            )}
                          </div>
                          
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                            event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            event.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            event.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 mt-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-500">Common advisor workflows</p>
        </div>

        {/* Primary Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {[
            { icon: Plus, label: 'Schedule Meeting', color: 'bg-slate-500 hover:bg-slate-600', action: () => console.log('Schedule meeting') },
            { icon: Edit, label: 'Create Task', color: 'bg-blue-500 hover:bg-blue-600', action: () => console.log('Create task') },
            { icon: UserPlus, label: 'Add Client', color: 'bg-emerald-500 hover:bg-emerald-600', action: () => console.log('Add client') },
            { icon: Send, label: 'Send Email', color: 'bg-amber-500 hover:bg-amber-600', action: () => console.log('Send email') },
            { icon: TrendingUp, label: 'Generate Report', color: 'bg-violet-500 hover:bg-violet-600', action: () => console.log('Generate report') }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`flex flex-col items-center space-y-2 p-4 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${action.color}`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>

        
      </motion.div>

      
    </div>
  );
};

export default Dashboard;