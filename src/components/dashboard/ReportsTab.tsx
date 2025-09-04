// src/components/dashboard/ReportsTab.tsx
// Step 4: Reports Tab Integration - Connects reporting to main dashboard

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

// Import our reporting components
import { ReportingDashboard } from '@/components/reports/ReportingDashboard';
import { useReporting } from '@/hooks/useReporting';
import { mockDataGenerators } from '@/hooks/useReporting';

interface ReportsTabProps {
  // Data passed from your main dashboard
  transactionData?: any[];
  alertData?: any[];
  providerData?: any[];
  // Additional props for enhanced functionality
  isSimulationRunning?: boolean;
  onExportComplete?: (exportType: string, recordCount: number) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  transactionData = [],
  alertData = [],
  providerData = [],
  isSimulationRunning = false,
  onExportComplete
}) => {
  // State management
  const [dataStats, setDataStats] = useState({
    totalRecords: 0,
    lastUpdated: new Date(),
    dataHealth: 'good' as 'good' | 'warning' | 'error'
  });

  // Reporting hook
  const { 
    isGenerating, 
    error, 
    reportHistory,
    clearError 
  } = useReporting();

  // Calculate data statistics
  useEffect(() => {
    const totalRecords = transactionData.length + alertData.length + providerData.length;
    let dataHealth: 'good' | 'warning' | 'error' = 'good';

    // Determine data health based on available data
    if (totalRecords === 0) {
      dataHealth = 'error';
    } else if (totalRecords < 10) {
      dataHealth = 'warning';
    }

    setDataStats({
      totalRecords,
      lastUpdated: new Date(),
      dataHealth
    });
  }, [transactionData.length, alertData.length, providerData.length]);

  // Use mock data if no real data is available (for demo purposes)
  const effectiveTransactionData = transactionData.length > 0 
    ? transactionData 
    : mockDataGenerators.generateMockTransactions(150);

  const effectiveAlertData = alertData.length > 0 
    ? alertData 
    : mockDataGenerators.generateMockAlerts(25);

  const effectiveProviderData = providerData.length > 0 
    ? providerData 
    : mockDataGenerators.generateMockProviders();

  // Handle export completion callback
  useEffect(() => {
    if (onExportComplete && reportHistory.length > 0) {
      const latestReport = reportHistory[0];
      // Call the callback when a new report is generated
      onExportComplete(latestReport.type, dataStats.totalRecords);
    }
  }, [reportHistory.length, onExportComplete, dataStats.totalRecords]);

  return (
    <div className="space-y-6">
      {/* Data Status Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Reporting Dashboard
            </h3>
            <p className="text-gray-600 mt-1">Generate stakeholder reports and export operational data</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Data Health Status */}
            <div className="flex items-center gap-2">
              {dataStats.dataHealth === 'good' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Data Ready</span>
                </>
              )}
              {dataStats.dataHealth === 'warning' && (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Limited Data</span>
                </>
              )}
              {dataStats.dataHealth === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">No Data Available</span>
                </>
              )}
            </div>

            {/* Record Count */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Available Records</div>
              <div className="text-2xl font-bold text-gray-900">{dataStats.totalRecords.toLocaleString()}</div>
            </div>

            {/* Simulation Status */}
            {isSimulationRunning && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{effectiveTransactionData.length.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{effectiveAlertData.length.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{effectiveProviderData.length.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Providers</div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Report Generation Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss Error
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="font-medium text-blue-900">Generating Report</h4>
              <p className="text-sm text-blue-700">Please wait while we process your data and generate the report...</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      {dataStats.totalRecords === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900">No Live Data Available</h4>
              <p className="text-sm text-yellow-700 mt-1">
                The reporting system is using sample data for demonstration. To use live data:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                <li>Start the transaction simulation from the main dashboard</li>
                <li>Generate some alerts by adjusting provider settings</li>
                <li>Let the system run for a few minutes to collect data</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Reporting Dashboard */}
      <ReportingDashboard
        transactionData={effectiveTransactionData}
        alertData={effectiveAlertData}
        providerData={effectiveProviderData}
      />

      {/* Report Generation Stats */}
      {reportHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Generation Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportHistory.length}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {reportHistory.reduce((sum, r) => sum + r.downloadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(reportHistory.map(r => r.type)).size}
              </div>
              <div className="text-sm text-gray-600">Report Types</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {reportHistory[0] ? new Date(reportHistory[0].generatedAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Last Generated</div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Help</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Report Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Executive:</strong> High-level KPIs for leadership</li>
              <li><strong>Operational:</strong> Detailed system metrics for ops teams</li>
              <li><strong>Financial:</strong> Cost analysis and revenue impact</li>
              <li><strong>Technical:</strong> Deep-dive performance analysis</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Formats</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>PDF:</strong> Formatted reports for presentations</li>
              <li><strong>CSV:</strong> Raw data for further analysis</li>
              <li><strong>Quick Export:</strong> Instant data downloads</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Best Practices
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Generate reports during low-traffic periods for better performance</li>
            <li>• Use date ranges appropriate for your stakeholder needs</li>
            <li>• Export CSV data for custom analysis and visualization</li>
            <li>• Archive important reports for historical comparison</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
