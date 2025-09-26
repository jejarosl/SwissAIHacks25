import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Clock, User, Calendar, AlertCircle, Filter, Search, Plus, MoreHorizontal, Star, FileText, MessageSquare, CreditCard as Edit, Trash2, Check, X } from 'lucide-react';
import { mockTasks } from '../utils/mockData';
import { Task } from '../types';

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;
    
    const newTasks = tasks.map(task => 
      task.id === draggableId 
        ? { ...task, status: destination.droppableId as Task['status'] }
        : task
    );
    setTasks(newTasks);
  };

  const handleTaskApproval = (taskId: string, approved: boolean) => {
    if (approved) {
      // Simulate sending to Outlook/Planner
      console.log(`Task ${taskId} approved and sent to Outlook`);
    }
    // Remove from tasks or mark as processed
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const categories = Array.from(new Set(tasks.map(task => task.category)));
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const taskColumns = {
    'todo': filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    'done': filteredTasks.filter(task => task.status === 'done')
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500 bg-gray-100';
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your client action items</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: taskStats.total, icon: FileText, color: 'bg-gray-100 text-gray-600' },
          { label: 'To Do', value: taskStats.todo, icon: Clock, color: 'bg-orange-100 text-orange-600' },
          { label: 'In Progress', value: taskStats.inProgress, icon: Star, color: 'bg-blue-100 text-blue-600' },
          { label: 'Completed', value: taskStats.completed, icon: CheckSquare, color: 'bg-green-100 text-green-600' }
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
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Completed</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Tasks List */}
      {/* Task Board (Kanban) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Task Management Board
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTasks.length} tasks across all meetings
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {Object.entries(taskColumns).map(([columnId, columnTasks]) => (
              <div key={columnId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 capitalize flex items-center">
                    {columnId === 'todo' && <Clock className="h-4 w-4 mr-2 text-orange-500" />}
                    {columnId === 'in-progress' && <Star className="h-4 w-4 mr-2 text-blue-500" />}
                    {columnId === 'done' && <CheckSquare className="h-4 w-4 mr-2 text-green-500" />}
                    {columnId.replace('-', ' ')}
                  </h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                      }`}
                    >
                      <AnimatePresence>
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {task.description}
                                    </p>
                                    {task.confidenceScore && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(task.confidenceScore)}`}>
                                        {Math.round(task.confidenceScore * 100)}%
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <User className="h-3 w-3" />
                                    <span>{task.owner}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>

                                  {task.evidence && (
                                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                                      <strong>Evidence:</strong> "{task.evidence}"
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {task.category}
                                      </span>
                                      {task.meetingId && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          Meeting
                                        </span>
                                      )}
                                    </div>
                                    
                                    {columnId === 'todo' && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() => handleTaskApproval(task.id, true)}
                                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                          title="Approve & Send to Outlook"
                                        >
                                          <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleTaskApproval(task.id, false)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Reject Task"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TasksView;