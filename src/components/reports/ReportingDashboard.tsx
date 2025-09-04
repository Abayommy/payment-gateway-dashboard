// src/components/reports/ReportingDashboard.tsx
// Step 3: Main Reporting Dashboard Component - User Interface

'use client';

import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Cog,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

import { useReporting, type ReportConfig } from '@/hooks/useReporting';
import type { ReportData } from '@/services/reporting/reportingService';

interface ReportingDashboardProps {
  // Data from your existing dashboard
  transactionData?: any[];
  alertData?: any[];
  providerData?: any[];
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  transactionData = [],
  alertData = [],
  providerData = []
}) => {
  // Hooks
  const { 
    generateReport, 
    exportData, 
    isGenerating, 
    error, 
    reportHistory,
    clearError 
  } = useReporting();

  // State
  const [selectedReportType, setSelectedReportType] = useState<string>('executive');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  });

  // Report type configurations
  const reportTypes = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level KPIs and performance overview for C-suite and board presentations',
      icon: Users,
      audience: 'CEO, CFO, Board Members',
      formats: ['pdf'],
      color: 'purple',
      estimatedTime: '30 seconds',
      features: ['KPI Dashboard', 'Risk Assessment', 'Strategic Recommendations', 'Financial Impact']
    },
    {
      id: 'operational',
      name: 'Operational Report',
      description: 'Detailed system performance, alerts, and operational metrics for day-to-day management',
      icon: Cog,
      audience: 'Operations, DevOps, SRE',
      formats: ['pdf', 'csv'],
      color: 'blue',
      estimatedTime: '45 seconds',
      features: ['System Health', 'Failure Analysis', 'Alert Summary', 'Performance Metrics']
    },
    {
      id: 'financial',
      name: 'Financial Analysis',
      description: 'Transaction volumes, costs, revenue analysis, and provider cost comparison',
      icon: DollarSign,
      audience: 'Finance, Accounting, Procurement',
      formats: ['pdf', 'csv'],
      color: 'green',
      estimatedTime: '35 seconds',
      features: ['Cost Analysis', 'Revenue Impact', 'Provider Comparison', 'ROI Metrics']
    },
    {
      id: 'technical',
      name: 'Technical Report',
      description: 'Deep-dive into system performance, error rates, and technical metrics',
      icon: BarChart3,
      audience: 'Engineering, Architecture',
      formats: ['pdf', 'csv'],
      color: 'orange',
      estimatedTime: '40 seconds',
      features: ['Error Analysis', 'Performance Deep Dive', 'System Diagnostics', 'Technical Metrics']
    }
  ];

  const selectedReport = reportTypes.find(r => r.id === selectedReportType);

  // Event handlers
  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    const config: ReportConfig = {
      type: selectedReportType as any,
      format: selectedFormat,
      dateRange,
      providers: providerData.map(p => p.name)
    };

    // Prepare data in the expected format
    const reportData: ReportData = {
      transactions: transactionData,
      alerts: alertData,
      providers: providerData,
      performance: {
        avgResponseTime: calculateAverageResponseTime(transactionData),
        peakVolume: calculatePeakVolume(transactionData),
        totalRevenue: calculateTotalRevenue(transactionData),
        systemUptime: calculateSystemUptime(providerData)
      },
      dateRange
    };

    try {
      await generateReport(config, reportData);
    } catch (err) {
      // Error handling is managed by the hook
      console.error('Report generation failed:', err);
    }
  };

  const handleQuickExport = async (type: 'transactions' | 'alerts' | 'providers') => {
    const dataMap = {
      transactions: transactionData,
      alerts: alertData, 
      providers: providerData
    };

    try {
      await exportData(type, dataMap[type]);
    } catch (err) {
      console.error(`Quick export failed for ${type}:`, err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-blue-100">
              Generate comprehensive reports for stakeholders and export operational data
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Available Data</div>
            <div className="text-xl font-bold">{(transactionData.length + alertData.length + providerData.length).toLocaleString()} records</div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Report Generation Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickExportCard
          title="Transaction Data"
          description="Export all transaction records with full details"
          recordCount={transactionData.length}
          onExport={() => handleQuickExport('transactions')}
          icon={TrendingUp}
          color="blue"
        />
        
        <QuickExportCard
          title="Alert History"
          description="Export complete alert audit trail and resolution data"
          recordCount={alertData.length}
          onExport={() => handleQuickExport('alerts')}
          icon={AlertTriangle}
          color="orange"
        />
        
        <QuickExportCard
          title="Provider Metrics"
          description="Export provider performance and cost analytics"
          recordCount={providerData.length}
          onExport={() => handleQuickExport('providers')}
          icon={BarChart3}
          color="green"
        />
      </div>

      {/* Report Generation Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate Custom Reports</h2>
          <p className="text-gray-600 mt-1">
            Create professional reports tailored for specific stakeholder needs
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Report Start Date
              </label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Report End Date
              </label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReportType === report.id;
                
                return (
                  <div
                    key={report.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? `border-${report.color}-500 bg-${report.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReportType(report.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? `bg-${report.color}-100` 
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isSelected 
                            ? `text-${report.color}-600` 
                            : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{report.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>Target: {report.audience}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Est. Time: {report.estimatedTime}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {report.formats.map(format => (
                              <span key={format} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {format.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className={`w-5 h-5 text-${report.color}-600`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Format Selection & Generation */}
          {selectedReport && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Output Format</h4>
                  <div className="flex gap-2">
                    {selectedReport.formats.map(format => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedFormat === format
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format.toUpperCase()} Format
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate {selectedReport.name}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report History */}
      {reportHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <p className="text-gray-600 text-sm mt-1">Your previously generated reports</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {reportHistory.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {report.type} Report ({report.format.toUpperCase()})
                      </h4>
                      <p className="text-sm text-gray-600">
                        Generated: {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()} • 
                        Period: {report.dateRange.start.toLocaleDateString()} - {report.dateRange.end.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{report.fileSize}</span>
                    <span>Downloaded {report.downloadCount} time{report.downloadCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Export Card Component
interface QuickExportCardProps {
  title: string;
  description: string;
  recordCount: number;
  onExport: () => void;
  icon: React.ComponentType<any>;
  color: 'blue' | 'orange' | 'green';
}

const QuickExportCard: React.FC<QuickExportCardProps> = ({
  title,
  description,
  recordCount,
  onExport,
  icon: Icon,
  color
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
    green: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
  };

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-orange-600' : 'text-green-600'}`} />
        <span className="text-sm font-medium text-gray-600">{recordCount.toLocaleString()} records</span>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      <button
        onClick={onExport}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
          color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
          'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
};

// Utility functions to calculate performance metrics
function calculateAverageResponseTime(transactions: any[]): number {
  const validResponseTimes = transactions
    .map(t => t.responseTime)
    .filter(rt => rt !== undefined && rt !== null);
  
  return validResponseTimes.length > 0 
    ? Math.round(validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length)
    : 0;
}

function calculatePeakVolume(transactions: any[]): number {
  // Group transactions by hour and find peak
  const hourlyVolumes: Record<string, number> = {};
  
  transactions.forEach(t => {
    const hour = new Date(t.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    hourlyVolumes[hour] = (hourlyVolumes[hour] || 0) + 1;
  });
  
  return Math.max(...Object.values(hourlyVolumes), 0);
}

function calculateTotalRevenue(transactions: any[]): number {
  return transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}

function calculateSystemUptime(providers: any[]): number {
  return providers.length > 0
    ? providers.reduce((sum, p) => sum + (p.uptime || 0), 0) / providers.length
    : 0;
}

export default ReportingDashboard;
