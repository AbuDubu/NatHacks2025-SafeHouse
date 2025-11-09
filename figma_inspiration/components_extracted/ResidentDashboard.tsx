import { useState } from 'react';
import { Heart, Droplet, Moon, Activity, Phone, Check, Watch, Wifi } from 'lucide-react';
import { Button } from './ui/button';

interface ResidentDashboardProps {
  name: string;
  onEmergency: () => void;
}

interface VitalCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  color: string;
}

export function ResidentDashboard({ name, onEmergency }: ResidentDashboardProps) {
  const [notification, setNotification] = useState({
    show: true,
    message: 'Your blood glucose is low — please eat fast-acting carbs.',
    confirmed: false,
  });

  const handleConfirm = () => {
    setNotification({ ...notification, confirmed: true });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 1500);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const vitals: VitalCard[] = [
    {
      icon: <Heart className="w-10 h-10" />,
      label: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'normal',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      icon: <Droplet className="w-10 h-10" />,
      label: 'Blood Glucose',
      value: '68',
      unit: 'mg/dL',
      status: 'warning',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    {
      icon: <Moon className="w-10 h-10" />,
      label: 'Sleep Quality',
      value: '7.5',
      unit: 'hours',
      status: 'normal',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      icon: <Activity className="w-10 h-10" />,
      label: 'Activity Level',
      value: '5,432',
      unit: 'steps',
      status: 'normal',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-4">{getTimeGreeting()}, {name}</h1>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
            <Watch className="w-4 h-4 text-green-700" />
            <span className="text-sm text-green-700">Apple Watch</span>
            <Wifi className="w-4 h-4 text-green-700" />
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
            <Droplet className="w-4 h-4 text-green-700" />
            <span className="text-sm text-green-700">Dexcom</span>
            <Wifi className="w-4 h-4 text-green-700" />
          </div>
        </div>
      </div>

      {/* Notification Alert */}
      {notification.show && (
        <div
          className={`mb-6 p-6 rounded-3xl border-2 ${
            notification.confirmed
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-300'
          } animate-in slide-in-from-top-2`}
        >
          <p className={notification.confirmed ? 'text-green-800' : 'text-yellow-800'}>
            {notification.confirmed ? '✓ Action confirmed' : notification.message}
          </p>
          {!notification.confirmed && (
            <Button
              onClick={handleConfirm}
              className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white h-12 rounded-xl"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirm Action
            </Button>
          )}
        </div>
      )}

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {vitals.map((vital) => (
          <div
            key={vital.label}
            className={`p-6 rounded-3xl border-2 ${vital.color} shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex justify-center mb-3">{vital.icon}</div>
            <p className="text-center text-sm mb-2 opacity-80">{vital.label}</p>
            <p className="text-center">
              {vital.value}
            </p>
            <p className="text-center text-sm opacity-70">{vital.unit}</p>
          </div>
        ))}
      </div>

      {/* Voice Assist Indicator */}
      <div className="flex justify-center mb-6">
        <div className="px-6 py-3 bg-blue-50 rounded-full border border-blue-200">
          <p className="text-blue-700 text-sm">🎙️ Voice assist available</p>
        </div>
      </div>

      {/* Emergency Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <Button
            onClick={onEmergency}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl animate-pulse hover:animate-none"
          >
            <Phone className="w-6 h-6 mr-3" />
            Call for Help
          </Button>
        </div>
      </div>
    </div>
  );
}
