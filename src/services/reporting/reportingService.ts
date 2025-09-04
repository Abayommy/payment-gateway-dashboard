// src/services/reporting/reportingService.ts
// Step 1: Core Reporting Service - Foundation for all report generation

export interface Transaction {
  id: string;
  timestamp: Date;
  provider: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  responseTime?: number;
  errorCode?: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  provider: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt?: Date;
}

export interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  successRate: number;
  responseTime: number;
  costPerTransaction: number;
  totalTransactions: number;
}

export interface ReportData {
  transactions: Transaction[];
  alerts: Alert[];
  providers: ProviderStatus[];
  performance: {
    avgResponseTime: number;
    peakVolume: number;
    totalRevenue: number;
    systemUptime: number;
  };
  dateRange: { start: Date; end: Date };
}

class ReportingService {
  /**
   * Generate Executive Summary Report
   * Target: C-Level executives, VPs
   * Focus: High-level KPIs and strategic insights
   */
  async generateExecutiveReport(data: ReportData): Promise<string> {
    console.log('🏢 Generating Executive Summary Report...');
    
    const totalTransactions = data.transactions.length;
    const totalVolume = data.transactions.reduce((sum, t) => sum + t.amount, 0);
    const successRate = totalTransactions > 0 
      ? (data.transactions.filter(t => t.status === 'success').length / totalTransactions * 100)
      : 0;
    const criticalAlerts = data.alerts.filter(a => a.severity === 'critical').length;
    
    return `
EXECUTIVE SUMMARY - PAYMENT GATEWAY OPERATIONS
==============================================

Reporting Period: ${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}
Generated: ${new Date().toLocaleString()}

KEY PERFORMANCE INDICATORS
---------------------------
• Total Transactions Processed: ${totalTransactions.toLocaleString()}
• Total Transaction Volume: $${totalVolume.toLocaleString()}
• Overall Success Rate: ${successRate.toFixed(2)}%
• System Uptime: ${data.performance.systemUptime}%
• Critical Issues: ${criticalAlerts}

PROVIDER PERFORMANCE SUMMARY
-----------------------------
${data.providers.map(p => `
${p.name.toUpperCase()}:
  ✓ Uptime: ${p.uptime}%
  ✓ Success Rate: ${p.successRate}%
  ✓ Avg Response: ${p.responseTime}ms
  ✓ Status: ${p.status.toUpperCase()}
`).join('')}

RISK ASSESSMENT
---------------
${criticalAlerts > 0 
  ? `🔴 HIGH RISK: ${criticalAlerts} critical alert(s) requiring immediate attention` 
  : '🟢 LOW RISK: Operations within normal parameters'}

STRATEGIC RECOMMENDATIONS
-------------------------
${this.generateExecutiveRecommendations(data)}

Financial Impact: Estimated revenue at risk from downtime: $${this.calculateRevenueAtRisk(data).toLocaleString()}
`;
  }

  /**
   * Generate Operational Report
   * Target: Operations teams, DevOps, Site Reliability Engineers
   * Focus: Detailed system metrics and actionable insights
   */
  async generateOperationalReport(data: ReportData): Promise<string> {
    console.log('🔧 Generating Operational Report...');
    
    const failedTransactions = data.transactions.filter(t => t.status === 'failed');
    const alertsByProvider = this.groupAlertsByProvider(data.alerts);
    
    return `
OPERATIONAL REPORT - PAYMENT GATEWAY SYSTEMS
============================================

Report Generated: ${new Date().toLocaleString()}
Coverage Period: ${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}

TRANSACTION VOLUME ANALYSIS
---------------------------
${data.providers.map(provider => {
  const providerTxns = data.transactions.filter(t => t.provider === provider.name);
  const successCount = providerTxns.filter(t => t.status === 'success').length;
  const failedCount = providerTxns.filter(t => t.status === 'failed').length;
  const volume = providerTxns.reduce((sum, t) => sum + t.amount, 0);
  
  return `
${provider.name.toUpperCase()} METRICS:
  • Total Transactions: ${providerTxns.length.toLocaleString()}
  • Successful: ${successCount.toLocaleString()} (${providerTxns.length > 0 ? (successCount/providerTxns.length*100).toFixed(1) : 0}%)
  • Failed: ${failedCount.toLocaleString()} (${providerTxns.length > 0 ? (failedCount/providerTxns.length*100).toFixed(1) : 0}%)
  • Transaction Volume: $${volume.toLocaleString()}
  • Health Score: ${this.calculateHealthScore(provider)}/100
`;
}).join('')}

FAILURE ANALYSIS
----------------
Total Failed Transactions: ${failedTransactions.length.toLocaleString()}
System-wide Failure Rate: ${data.transactions.length > 0 ? (failedTransactions.length / data.transactions.length * 100).toFixed(2) : 0}%

Failure Distribution:
${Object.entries(this.groupTransactionsByProvider(failedTransactions))
  .map(([provider, count]) => `  • ${provider}: ${count} failures`)
  .join('\n')}

ALERT SUMMARY
-------------
Total Alerts Generated: ${data.alerts.length}
  • Critical: ${data.alerts.filter(a => a.severity === 'critical').length}
  • Warning: ${data.alerts.filter(a => a.severity === 'warning').length}  
  • Informational: ${data.alerts.filter(a => a.severity === 'info').length}

SYSTEM HEALTH MATRIX
-------------------
${data.providers.map(p => `
${p.name} HEALTH DASHBOARD:
  ├─ Health Score: ${this.calculateHealthScore(p)}/100
  ├─ Uptime: ${p.uptime}% ${this.getUptimeStatus(p.uptime)}
  ├─ Response Time: ${p.responseTime}ms ${this.getResponseTimeStatus(p.responseTime)}
  ├─ Error Rate: ${(100 - p.successRate).toFixed(2)}% ${this.getErrorRateStatus(p.successRate)}
  └─ Cost Efficiency: $${p.costPerTransaction.toFixed(3)} per transaction
`).join('')}

OPERATIONAL RECOMMENDATIONS
--------------------------
${this.generateOperationalRecommendations(data)}
`;
  }

  /**
   * CSV Export Functions
   */
  async exportTransactionsCSV(transactions: Transaction[]): Promise<string> {
    console.log('📊 Exporting transaction data to CSV...');
    
    const headers = [
      'Transaction ID',
      'Timestamp', 
      'Provider',
      'Amount (USD)',
      'Status',
      'Response Time (ms)',
      'Error Code'
    ];
    
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.id}"`,
        t.timestamp.toISOString(),
        t.provider,
        t.amount.toFixed(2),
        t.status,
        t.responseTime?.toString() || 'N/A',
        t.errorCode || 'N/A'
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  async exportAlertsCSV(alerts: Alert[]): Promise<string> {
    console.log('🚨 Exporting alert data to CSV...');
    
    const headers = [
      'Alert ID',
      'Timestamp',
      'Severity',
      'Provider',
      'Message',
      'Status',
      'Acknowledged At'
    ];
    
    const csvRows = [
      headers.join(','),
      ...alerts.map(a => [
        `"${a.id}"`,
        a.timestamp.toISOString(),
        a.severity,
        a.provider,
        `"${a.message.replace(/"/g, '""')}"`, // Escape quotes in message
        a.status,
        a.acknowledgedAt?.toISOString() || 'N/A'
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  async exportProviderMetricsCSV(providers: ProviderStatus[]): Promise<string> {
    console.log('📈 Exporting provider metrics to CSV...');
    
    const headers = [
      'Provider Name',
      'Current Status',
      'Uptime (%)',
      'Success Rate (%)',
      'Avg Response Time (ms)',
      'Cost Per Transaction ($)',
      'Total Transactions',
      'Health Score'
    ];
    
    const csvRows = [
      headers.join(','),
      ...providers.map(p => [
        p.name,
        p.status,
        p.uptime.toFixed(2),
        p.successRate.toFixed(2),
        p.responseTime.toString(),
        p.costPerTransaction.toFixed(4),
        p.totalTransactions.toString(),
        this.calculateHealthScore(p).toString()
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  // ========== HELPER METHODS ==========

  private generateExecutiveRecommendations(data: ReportData): string {
    const recommendations = [];
    
    // Performance-based recommendations
    const lowPerformanceProviders = data.providers.filter(p => p.successRate < 95);
    if (lowPerformanceProviders.length > 0) {
      recommendations.push(`• URGENT: Review ${lowPerformanceProviders.map(p => p.name).join(', ')} - Success rates below industry standard (95%)`);
    }
    
    // Cost optimization
    const avgCost = data.providers.reduce((sum, p) => sum + p.costPerTransaction, 0) / data.providers.length;
    const expensiveProviders = data.providers.filter(p => p.costPerTransaction > avgCost * 1.2);
    if (expensiveProviders.length > 0) {
      recommendations.push(`• COST OPTIMIZATION: Negotiate better rates with ${expensiveProviders.map(p => p.name).join(', ')}`);
    }
    
    // Risk mitigation
    const criticalAlerts = data.alerts.filter(a => a.severity === 'critical').length;
    if (criticalAlerts > 0) {
      recommendations.push(`• RISK MITIGATION: Address ${criticalAlerts} critical system issues immediately`);
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '• MAINTAIN: Continue current operational excellence standards';
  }

  private generateOperationalRecommendations(data: ReportData): string {
    const recommendations = [];
    
    // Response time issues
    const slowProviders = data.providers.filter(p => p.responseTime > 1000);
    if (slowProviders.length > 0) {
      recommendations.push(`🔧 LATENCY: Investigate ${slowProviders.map(p => p.name).join(', ')} - Response times exceeding 1000ms`);
    }
    
    // Uptime concerns
    const unreliableProviders = data.providers.filter(p => p.uptime < 99.5);
    if (unreliableProviders.length > 0) {
      recommendations.push(`⚠️ RELIABILITY: Monitor ${unreliableProviders.map(p => p.name).join(', ')} - Uptime below SLA requirements`);
    }
    
    // Alert volume
    const highAlertProviders = Object.entries(this.groupAlertsByProvider(data.alerts))
      .filter(([_, alerts]) => alerts.length > 5)
      .map(([provider, _]) => provider);
    
    if (highAlertProviders.length > 0) {
      recommendations.push(`🚨 MONITORING: Review alert thresholds for ${highAlertProviders.join(', ')} - High alert volume detected`);
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '✅ STABLE: All systems operating within acceptable parameters';
  }

  private calculateHealthScore(provider: ProviderStatus): number {
    // Weighted health calculation (40% uptime, 40% success rate, 20% response time)
    const uptimeScore = provider.uptime;
    const successScore = provider.successRate;
    const responseScore = Math.max(0, 100 - (provider.responseTime / 20)); // Lower is better
    
    return Math.round((uptimeScore * 0.4) + (successScore * 0.4) + (responseScore * 0.2));
  }

  private calculateRevenueAtRisk(data: ReportData): number {
    // Simplified calculation: average transaction value * failed transactions * potential impact multiplier
    const avgTransactionValue = data.transactions.length > 0 
      ? data.transactions.reduce((sum, t) => sum + t.amount, 0) / data.transactions.length
      : 0;
    const failedTransactions = data.transactions.filter(t => t.status === 'failed').length;
    return avgTransactionValue * failedTransactions * 1.5; // 1.5x multiplier for customer churn impact
  }

  private groupAlertsByProvider(alerts: Alert[]): Record<string, Alert[]> {
    return alerts.reduce((acc, alert) => {
      if (!acc[alert.provider]) acc[alert.provider] = [];
      acc[alert.provider].push(alert);
      return acc;
    }, {} as Record<string, Alert[]>);
  }

  private groupTransactionsByProvider(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, txn) => {
      acc[txn.provider] = (acc[txn.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getUptimeStatus(uptime: number): string {
    if (uptime >= 99.9) return '🟢';
    if (uptime >= 99.0) return '🟡';
    return '🔴';
  }

  private getResponseTimeStatus(responseTime: number): string {
    if (responseTime <= 500) return '🟢';
    if (responseTime <= 1000) return '🟡';
    return '🔴';
  }

  private getErrorRateStatus(successRate: number): string {
    if (successRate >= 99.0) return '🟢';
    if (successRate >= 95.0) return '🟡';
    return '🔴';
  }
}

// Export singleton instance
export const reportingService = new ReportingService();

console.log('✅ Reporting Service initialized successfully');
