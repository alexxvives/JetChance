import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, AlertCircle, CheckCircle, TrendingUp, Image, Trash2 } from 'lucide-react';

const R2StorageWidget = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchR2Stats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchR2Stats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchR2Stats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/admin/r2-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch R2 stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching R2 stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to load R2 stats</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { storage, cleanup, alert } = stats;
  const percentageUsed = storage.percentageUsed || 0;

  // Determine status color
  const getStatusColor = () => {
    if (percentageUsed >= 95) return 'red';
    if (percentageUsed >= 80) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();
  const statusColors = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      progress: 'bg-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      progress: 'bg-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      progress: 'bg-red-500'
    }
  };

  const colors = statusColors[statusColor];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: statusColor === 'green' ? '#10b981' : statusColor === 'yellow' ? '#f59e0b' : '#ef4444' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <HardDrive className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              R2 Image Storage
            </h3>
            <p className="text-sm text-gray-500">Cloudflare R2 Bucket</p>
          </div>
        </div>
        <button
          onClick={fetchR2Stats}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${colors.text}`} />
            <span className={`text-sm font-medium ${colors.text}`}>{alert}</span>
          </div>
        </div>
      )}

      {/* Storage Usage */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Storage Used</span>
            <span className="text-sm font-bold text-gray-900">
              {storage.usedMB} MB / {storage.limitMB} MB
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} transition-all duration-500`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">{percentageUsed}% used</span>
            <span className="text-xs text-gray-500">
              {storage.limitMB - storage.usedMB} MB free
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Image Count */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{storage.imageCount}</p>
              <p className="text-xs text-gray-500">Total Images</p>
            </div>
          </div>

          {/* Pending Cleanup */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Trash2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{cleanup.flightsPendingCleanup}</p>
              <p className="text-xs text-gray-500">Pending Cleanup</p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {statusColor === 'green' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Storage healthy - Auto-cleanup active
                </span>
              </>
            )}
            {statusColor === 'yellow' && (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  Approaching limit - Monitor usage
                </span>
              </>
            )}
            {statusColor === 'red' && (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  Storage critical - Cleanup required
                </span>
              </>
            )}
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <strong>Auto-cleanup:</strong> Images are automatically deleted 30 days after flight departure. 
            Flight records remain visible without images.
          </p>
        </div>
      </div>
    </div>
  );
};

export default R2StorageWidget;
