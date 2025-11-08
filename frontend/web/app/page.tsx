/**
 * Home Page
 * Landing page with navigation to dashboard
 */

import Link from 'next';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SafeHouse
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Heat Safety Monitoring for Elderly Care
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              View Dashboard
            </Link>
            <Link
              href="/alerts"
              className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              View Alerts
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">🌡️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Monitoring
            </h3>
            <p className="text-gray-600">
              Track temperature, humidity, and heat index in real-time
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Alerts
            </h3>
            <p className="text-gray-600">
              Automated escalation with calls, SMS, and push notifications
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">❤️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Health Integration
            </h3>
            <p className="text-gray-600">
              Monitor heart rate and activity via Apple Health
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
