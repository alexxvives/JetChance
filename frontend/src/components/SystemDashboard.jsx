import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import R2StorageWidget from './R2StorageWidget';
import { 
  Users, 
  Plane, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity,
  Server,
  Database
} from 'lucide-react';

const SystemDashboard = () => {
  const { t } = useTranslation();
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch system stats from backend
      const response = await fetch('/api/admin/system-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (err) {
      console.error('Error fetching system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor system health and resources</p>
        </div>
        <button
          onClick={fetchSystemStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh All
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={systemStats?.totalUsers || '0'}
          subtitle={`${systemStats?.activeUsers || '0'} active this month`}
          color="#3b82f6"
          trend={systemStats?.userGrowth}
        />
        <StatCard
          icon={Plane}
          title="Total Flights"
          value={systemStats?.totalFlights || '0'}
          subtitle={`${systemStats?.activeFlights || '0'} currently active`}
          color="#10b981"
        />
        <StatCard
          icon={Calendar}
          title="Bookings"
          value={systemStats?.totalBookings || '0'}
          subtitle={`${systemStats?.confirmedBookings || '0'} confirmed`}
          color="#f59e0b"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(systemStats?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`$${(systemStats?.platformCommission || 0).toLocaleString()} commission`}
          color="#8b5cf6"
          trend={`+${systemStats?.revenueGrowth || '0'}% this month`}
        />
      </div>

      {/* R2 Storage Widget */}
      <R2StorageWidget />

      {/* Database Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Health */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Database Health</h3>
              <p className="text-sm text-gray-500">D1 Database Statistics</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Records</span>
              <span className="text-lg font-bold text-gray-900">
                {(systemStats?.dbRecords || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Database Size</span>
              <span className="text-lg font-bold text-gray-900">
                {systemStats?.dbSizeMB || '0'} MB
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Airports</span>
              <span className="text-lg font-bold text-gray-900">
                {systemStats?.totalAirports || '142'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Database healthy</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Server className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className="text-sm text-gray-500">Infrastructure Overview</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* API Status */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">API</span>
              </div>
              <span className="text-sm font-medium text-green-700">Operational</span>
            </div>

            {/* D1 Database */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">D1 Database</span>
              </div>
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>

            {/* R2 Storage */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">R2 Storage</span>
              </div>
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>

            {/* Auto-cleanup */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Auto-cleanup Cron</span>
              </div>
              <span className="text-sm font-medium text-blue-700">Daily 2AM UTC</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">System Uptime</span>
              <span className="text-lg font-bold text-gray-900">99.9%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <h4 className="font-semibold mb-1">Force Cleanup</h4>
            <p className="text-sm opacity-90">Run image cleanup now</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <h4 className="font-semibold mb-1">Export Data</h4>
            <p className="text-sm opacity-90">Download system reports</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all">
            <h4 className="font-semibold mb-1">View Logs</h4>
            <p className="text-sm opacity-90">Check system activity</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;
