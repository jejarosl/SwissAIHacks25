import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, User, Phone, Mail, MapPin, Calendar, DollarSign, TrendingUp, Star, MoreHorizontal, Eye, CreditCard as Edit, Archive, Users, Building, CreditCard } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect';
  type: 'individual' | 'family' | 'corporate';
  portfolio: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  lastMeeting: string;
  nextMeeting?: string;
  advisor: string;
  location: string;
  joinDate: string;
  notes?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Johnson Family',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    type: 'family',
    portfolio: 2500000,
    riskTolerance: 'moderate',
    lastMeeting: '2025-01-15',
    nextMeeting: '2025-04-15',
    advisor: 'Emma Thompson',
    location: 'New York, NY',
    joinDate: '2020-03-15'
  },
  {
    id: '2',
    name: 'Williams Estate',
    email: 'robert.williams@email.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    type: 'family',
    portfolio: 8750000,
    riskTolerance: 'conservative',
    lastMeeting: '2025-01-18',
    nextMeeting: '2025-02-18',
    advisor: 'Emma Thompson',
    location: 'Greenwich, CT',
    joinDate: '2018-08-22'
  },
  {
    id: '3',
    name: 'Peterson Holdings',
    email: 'james.peterson@email.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    type: 'individual',
    portfolio: 1800000,
    riskTolerance: 'aggressive',
    lastMeeting: '2025-01-20',
    advisor: 'Emma Thompson',
    location: 'Boston, MA',
    joinDate: '2021-11-10'
  },
  {
    id: '4',
    name: 'Anderson Family',
    email: 'michael.anderson@email.com',
    phone: '+1 (555) 456-7890',
    status: 'prospect',
    type: 'family',
    portfolio: 0,
    riskTolerance: 'moderate',
    lastMeeting: '2025-01-19',
    nextMeeting: '2025-01-25',
    advisor: 'Emma Thompson',
    location: 'Philadelphia, PA',
    joinDate: '2025-01-19'
  },
  {
    id: '5',
    name: 'Martinez Family',
    email: 'carlos.martinez@email.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    type: 'family',
    portfolio: 5200000,
    riskTolerance: 'moderate',
    lastMeeting: '2024-12-15',
    nextMeeting: '2025-03-15',
    advisor: 'Emma Thompson',
    location: 'Miami, FL',
    joinDate: '2019-05-30'
  },
  {
    id: '6',
    name: 'Stevens Corporation',
    email: 'ceo@stevens.corp',
    phone: '+1 (555) 678-9012',
    status: 'prospect',
    type: 'corporate',
    portfolio: 0,
    riskTolerance: 'moderate',
    lastMeeting: '2025-01-10',
    nextMeeting: '2025-09-22',
    advisor: 'Emma Thompson',
    location: 'Chicago, IL',
    joinDate: '2025-01-10'
  },
  {
    id: '7',
    name: 'Thompson Industries',
    email: 'jennifer.thompson@email.com',
    phone: '+1 (555) 789-0123',
    status: 'active',
    type: 'individual',
    portfolio: 950000,
    riskTolerance: 'conservative',
    lastMeeting: '2024-12-20',
    advisor: 'Emma Thompson',
    location: 'Seattle, WA',
    joinDate: '2022-07-18'
  },
  {
    id: '8',
    name: 'Davis Trust',
    email: 'richard.davis@email.com',
    phone: '+1 (555) 890-1234',
    status: 'active',
    type: 'family',
    portfolio: 12000000,
    riskTolerance: 'conservative',
    lastMeeting: '2025-01-05',
    nextMeeting: '2025-04-05',
    advisor: 'Emma Thompson',
    location: 'San Francisco, CA',
    joinDate: '2017-02-14'
  }
];

const ClientDatabase: React.FC = () => {
  const [clients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'family' | 'corporate'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: Client['type']) => {
    switch (type) {
      case 'individual': return User;
      case 'family': return Users;
      case 'corporate': return Building;
      default: return User;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAssets = () => {
    return clients.reduce((total, client) => total + client.portfolio, 0);
  };

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    totalAssets: getTotalAssets()
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Database</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and portfolios</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clients', value: clientStats.total, icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Active Clients', value: clientStats.active, icon: Star, color: 'bg-green-100 text-green-600' },
          { label: 'Prospects', value: clientStats.prospects, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
          { label: 'Total Assets', value: formatCurrency(clientStats.totalAssets), icon: DollarSign, color: 'bg-red-100 text-red-600' }
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
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="family">Family</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
      </motion.div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredClients.map((client, index) => {
            const TypeIcon = getTypeIcon(client.type);
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TypeIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{client.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{client.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{client.location}</span>
                  </div>
                  
                  {client.portfolio > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Portfolio Value</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(client.portfolio)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Last Meeting</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(client.lastMeeting).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {client.nextMeeting && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Next Meeting</span>
                      <span className="text-sm font-medium text-blue-600">
                        {new Date(client.nextMeeting).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">No clients found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search criteria' : 'Add your first client to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientDatabase;