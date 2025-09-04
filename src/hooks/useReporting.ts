// src/hooks/useReporting.ts
// Step 2: Reporting Hook - State management and UI integration

import { useState, useEffect, useCallback } from 'react';
import { reportingService, type ReportData, type Transaction, type Alert, type ProviderStatus } from '@/services/reporting/reportingService';

export interface ReportConfig {
  type: 'executive' | 'operational' | 'financial' | 'technical';
  format: 'pdf' | 'csv';
  dateRange: { start: Date; end: Date };
  providers?: string[];
  includeSections?: string[];
}

export interface ReportRecord {
  id: string;
  type: string;
  format: string;
  generatedAt: Date;
  dateRange: { start: Date; end: Date };
  downloadCount: number;
  fileSize?: string;
}

export interface UseReportingReturn {
  // Core functions
  generateReport: (config: ReportConfig, data: ReportData) => Promise<void>;
  exportData: (type: 'transactions' | 'alerts' | 'providers', data: any[]) => Promise<void>;
  
  // State
  isGenerating: boolean;
  error: string | null;
  reportHistory: ReportRecord[];
  
  // Utilities
  clearError: () => void;
  clearHistory: () => void;
}

export const useReporting = (): UseReportingReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportRecord[]>([]);

  // Load report history from localStorage on component mount
  useEffect(() => {
    console.log('📚 Loading report history from local storage...');
    
    try {
      const savedHistory = localStorage.getItem('paymentGatewayReportHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const processedHistory = parsed.map((record: any) => ({
          ...record,
          generatedAt: new Date(record.generatedAt),
          dateRange: {
            start: new Date(record.dateRange.start),
            end: new Date(record.dateRange.end)
          }
        }));
        
        setReportHistory(processedHistory);
        console.log(`✅ Loaded ${processedHistory.length} previous reports`);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load report history:', err);
      // Clear corrupted data
      localStorage.removeItem('paymentGatewayReportHistory');
    }
  }, []);

  // Save report history to localStorage whenever it changes
  useEffect(() => {
    if (reportHistory.length > 0) {
      localStorage.setItem('paymentGatewayReportHistory', JSON.stringify(reportHistory));
      console.log(`💾 Saved ${reportHistory.length} reports to local storage`);
    }
  }, [reportHistory]);

  /**
   * Generate and download a report
   */
  const generateReport = useCallback(async (config: ReportConfig, data: ReportData): Promise<void> => {
    console.log(`🚀 Starting report generation:`, {
      type: config.type,
      format: config.format,
      dateRange: config.dateRange
    });

    setIsGenerating(true);
    setError(null);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      // Generate content based on format and type
      if (config.format === 'pdf') {
        // For demo purposes, we'll generate text reports
        // In production, you'd use libraries like jsPDF or Puppeteer
        if (config.type === 'executive') {
          content = await reportingService.generateExecutiveReport(data);
          filename = `executive-summary-${formatDateForFilename(new Date())}.txt`;
        } else {
          content = await reportingService.generateOperationalReport(data);
          filename = `operational-report-${formatDateForFilename(new Date())}.txt`;
        }
        mimeType = 'text/plain';
        
        console.log('📄 Generated PDF report content (as text for demo)');
      } else {
        // CSV format
        switch (config.type) {
          case 'executive':
          case 'operational':
            content = await reportingService.exportTransactionsCSV(data.transactions);
            filename = `transactions-data-${formatDateForFilename(new Date())}.csv`;
            break;
          case 'financial':
            content = await reportingService.exportProviderMetricsCSV(data.providers);
            filename = `provider-metrics-${formatDateForFilename(new Date())}.csv`;
            break;
          case 'technical':
            content = await reportingService.exportAlertsCSV(data.alerts);
            filename = `alerts-data-${formatDateForFilename(new Date())}.csv`;
            break;
          default:
            throw new Error(`Unsupported report type: ${config.type}`);
        }
        mimeType = 'text/csv';
        
        console.log('📊 Generated CSV export');
      }

      // Download the file
      await downloadFile(content, filename, mimeType);

      // Add to report history
      const newReport: ReportRecord = {
        id: `report_${Date.now()}`,
        type: config.type,
        format: config.format,
        generatedAt: new Date(),
        dateRange: config.dateRange,
        downloadCount: 1,
        fileSize: formatFileSize(content.length)
      };

      setReportHistory(prev => [newReport, ...prev.slice(0, 19)]); // Keep last 20 reports
      
      console.log(`✅ Report generated successfully: ${filename}`);
      console.log(`📈 Report added to history (ID: ${newReport.id})`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while generating report';
      console.error('❌ Report generation failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Quick export data without full report generation
   */
  const exportData = useCallback(async (
    type: 'transactions' | 'alerts' | 'providers', 
    data: any[]
  ): Promise<void> => {
    console.log(`📤 Quick export started: ${type}`);

    if (!data || data.length === 0) {
      throw new Error(`No ${type} data available to export`);
    }

    try {
      let content: string;
      let filename: string;
      const timestamp = formatDateForFilename(new Date());

      switch (type) {
        case 'transactions':
          content = await reportingService.exportTransactionsCSV(data);
          filename = `transactions-export-${timestamp}.csv`;
          break;
        case 'alerts':
          content = await reportingService.exportAlertsCSV(data);
          filename = `alerts-export-${timestamp}.csv`;
          break;
        case 'providers':
          content = await reportingService.exportProviderMetricsCSV(data);
          filename = `providers-export-${timestamp}.csv`;
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      await downloadFile(content, filename, 'text/csv');
      
      console.log(`✅ Quick export completed: ${filename}`);
      console.log(`📊 Exported ${data.length} ${type} records`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to export ${type} data`;
      console.error(`❌ Export failed for ${type}:`, err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    console.log('🔄 Error state cleared');
  }, []);

  /**
   * Clear report history
   */
  const clearHistory = useCallback(() => {
    setReportHistory([]);
    localStorage.removeItem('paymentGatewayReportHistory');
    console.log('🗑️ Report history cleared');
  }, []);

  return {
    generateReport,
    exportData,
    isGenerating,
    error,
    reportHistory,
    clearError,
    clearHistory
  };
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Download a file to the user's device
 */
async function downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Cleanup
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    console.log(`📥 File downloaded: ${filename} (${mimeType})`);
  } catch (err) {
    console.error('❌ Download failed:', err);
    throw new Error('Failed to download file');
  }
}

/**
 * Format date for use in filenames (YYYY-MM-DD-HHMMSS)
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Mock data generators for development and testing
export const mockDataGenerators = {
  generateMockTransactions(count: number = 100): Transaction[] {
    const providers = ['Stripe', 'PayPal', 'Square'];
    const statuses: Array<'success' | 'failed' | 'pending'> = ['success', 'failed', 'pending'];
    const transactions: Transaction[] = [];

    for (let i = 0; i < count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      transactions.push({
        id: `txn_${Date.now()}_${String(i).padStart(4, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        provider: providers[Math.floor(Math.random() * providers.length)],
        amount: Math.round(Math.random() * 1000 * 100) / 100, // $0.00 - $1000.00
        status,
        responseTime: status === 'failed' ? undefined : Math.round(Math.random() * 800 + 100), // 100-900ms
        errorCode: status === 'failed' ? ['ERR_001', 'ERR_002', 'TIMEOUT'][Math.floor(Math.random() * 3)] : undefined
      });
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  generateMockAlerts(count: number = 25): Alert[] {
    const providers = ['Stripe', 'PayPal', 'Square', 'System'];
    const severities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const statuses: Array<'active' | 'acknowledged' | 'resolved'> = ['active', 'acknowledged', 'resolved'];
    const alerts: Alert[] = [];

    const alertMessages = {
      critical: [
        'Provider connection lost',
        'High failure rate detected',
        'Response time exceeded threshold',
        'Service unavailable'
      ],
      warning: [
        'Elevated response times',
        'Approaching rate limits',
        'Configuration drift detected',
        'Performance degradation'
      ],
      info: [
        'Maintenance window scheduled',
        'Configuration updated',
        'System health check completed',
        'New provider connected'
      ]
    };

    for (let i = 0; i < count; i++) {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const messages = alertMessages[severity];
      
      alerts.push({
        id: `alert_${Date.now()}_${String(i).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        severity,
        provider: providers[Math.floor(Math.random() * providers.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        status,
        acknowledgedAt: status !== 'active' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined
      });
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  generateMockProviders(): ProviderStatus[] {
    return [
      {
        name: 'Stripe',
        status: 'online',
        uptime: 99.9,
        successRate: 99.2,
        responseTime: 245,
        costPerTransaction: 0.029,
        totalTransactions: 5420
      },
      {
        name: 'PayPal', 
        status: 'online',
        uptime: 99.5,
        successRate: 98.8,
        responseTime: 420,
        costPerTransaction: 0.035,
        totalTransactions: 3240
      },
      {
        name: 'Square',
        status: 'degraded',
        uptime: 97.2,
        successRate: 96.5,
        responseTime: 680,
        costPerTransaction: 0.025,
        totalTransactions: 1580
      }
    ];
  }
};

console.log('✅ Reporting Hook initialized with mock data generators');
