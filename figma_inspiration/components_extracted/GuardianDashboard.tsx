import { useState } from 'react';
import { Search, Home, TrendingUp, MessageSquare, Settings, Phone, AlertCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GuardianTrends } from './GuardianTrends';

interface GuardianDashboardProps {
  onEmergency: (context?: { residentName?: string; alertType?: string }) => void;
}

interface Resident {
  id: string;
  name: string;
  age: number;
  photo: string;
  status: 'normal' | 'warning' | 'alert';
  vitals: {
    heartRate: number;
    glucose: number;
    sleep: number;
    activity: number;
  };
}

export function GuardianDashboard({ onEmergency }: GuardianDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const residents: Resident[] = [
    {
      id: '1',
      name: 'Margaret Chen',
      age: 78,
      photo: 'MC',
      status: 'warning',
      vitals: { heartRate: 72, glucose: 68, sleep: 7.5, activity: 5432 },
    },
    {
      id: '2',
      name: 'Robert Williams',
      age: 82,
      photo: 'RW',
      status: 'normal',
      vitals: { heartRate: 68, glucose: 95, sleep: 8.0, activity: 3200 },
    },
    {
      id: '3',
      name: 'Helen Martinez',
      age: 75,
      photo: 'HM',
      status: 'alert',
      vitals: { heartRate: 95, glucose: 180, sleep: 4.2, activity: 850 },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'alert':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'All Normal';
      case 'warning':
        return 'Trending Concern';
      case 'alert':
        return 'Alert';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {activeTab === 'home' && (
        <div className="p-6 pb-24">
          {/* Header */}
          <h1 className="text-gray-900 mb-6">Guardian Dashboard</h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full bg-white"
            />
          </div>

          {/* Emergency Alert Banner */}
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-3xl shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-red-900 mb-1">Emergency Alert</p>
                <p className="text-red-700 text-sm mb-4">
                  Helen Martinez did not respond. Emergency services contacted.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => onEmergency({ residentName: 'Helen Martinez', alertType: 'no-response' })}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    View Details
                  </Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Residents List */}
          <div className="space-y-4">
            {residents.map((resident) => (
              <div
                key={resident.id}
                className="p-6 bg-white rounded-3xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-4 mb-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-gray-900">{resident.name}</h3>
                        <p className="text-gray-600 text-sm">Age {resident.age}</p>
                      </div>
                      <span
                        className={`px-4 py-1 rounded-full text-sm border ${getStatusColor(
                          resident.status
                        )}`}
                      >
                        {getStatusText(resident.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Heart Rate</p>
                    <p className="text-gray-900">{resident.vitals.heartRate} bpm</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Glucose</p>
                    <p className="text-gray-900">{resident.vitals.glucose} mg/dL</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Sleep</p>
                    <p className="text-gray-900">{resident.vitals.sleep}h</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Activity</p>
                    <p className="text-gray-900">{resident.vitals.activity} steps</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                  Check In
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && <GuardianTrends />}

      {activeTab === 'messages' && (
        <div className="p-6 flex items-center justify-center h-screen">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Messages coming soon</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 flex items-center justify-center h-screen">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Settings coming soon</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'trends' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'messages' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
