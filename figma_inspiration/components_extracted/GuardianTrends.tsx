import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from './ui/button';
import { Heart, Droplet, Moon, Activity } from 'lucide-react';

const heartRateData = [
  { time: 'Mon', value: 68 },
  { time: 'Tue', value: 70 },
  { time: 'Wed', value: 72 },
  { time: 'Thu', value: 71 },
  { time: 'Fri', value: 69 },
  { time: 'Sat', value: 72 },
  { time: 'Sun', value: 70 },
];

const glucoseData = [
  { time: 'Mon', value: 95 },
  { time: 'Tue', value: 88 },
  { time: 'Wed', value: 92 },
  { time: 'Thu', value: 78 },
  { time: 'Fri', value: 68 },
  { time: 'Sat', value: 85 },
  { time: 'Sun', value: 90 },
];

const sleepData = [
  { time: 'Mon', value: 7.5 },
  { time: 'Tue', value: 8.0 },
  { time: 'Wed', value: 7.2 },
  { time: 'Thu', value: 6.8 },
  { time: 'Fri', value: 7.5 },
  { time: 'Sat', value: 8.2 },
  { time: 'Sun', value: 7.8 },
];

const activityData = [
  { time: 'Mon', value: 4200 },
  { time: 'Tue', value: 5100 },
  { time: 'Wed', value: 4800 },
  { time: 'Thu', value: 3900 },
  { time: 'Fri', value: 5400 },
  { time: 'Sat', value: 6200 },
  { time: 'Sun', value: 5800 },
];

export function GuardianTrends() {
  return (
    <div className="p-6 pb-24 bg-gray-50 min-h-screen">
      <h1 className="text-gray-900 mb-6">Trend Analytics</h1>

      {/* Heart Rate Trend */}
      <div className="mb-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Heart Rate</h3>
              <p className="text-gray-600 text-sm">7-day trend</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            Check In
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={heartRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[60, 80]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Blood Glucose Trend */}
      <div className="mb-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Droplet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Blood Glucose</h3>
              <p className="text-gray-600 text-sm">7-day trend</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            Check In
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={glucoseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[60, 120]} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Quality Trend */}
      <div className="mb-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Moon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Sleep Quality</h3>
              <p className="text-gray-600 text-sm">7-day trend</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            Check In
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={sleepData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[5, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Level Trend */}
      <div className="mb-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Activity Level</h3>
              <p className="text-gray-600 text-sm">7-day trend</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            Check In
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 7000]} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#10b981" fill="#86efac" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
