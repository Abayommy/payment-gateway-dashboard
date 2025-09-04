'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Bell, Play, Activity, FileText, Settings, TrendingUp, AlertTriangle, Download, Filter, Search, CheckCircle, XCircle, Clock, BarChart3, PieChart, Users, DollarSign } from 'lucide-react';

// Mock data
const mockSystemMetrics = {
  transactions: 0,
  successRate: 99.2,
  avgResponse: 245,
  alerts: 2
};

const mockProviders = [
  { name: 'Stripe', status: 'online', uptime: '99.2%', successRate: '99.2%', responseTime: '245ms' },
  { name: 'PayPal', status: 'online', uptime: '98.8%', successRate: '98.8%', responseTime: '420ms' },
  { name: 'Square', status: 'online', uptime: '96.5%', successRate: '96.5%', responseTime: '680ms' }
];

const mockAlerts = [
  { id: 1, message: 'High response time detected on Stripe', severity: 'medium', timestamp: new Date(), status: 'active', provider: 'Stripe' },
  { id: 2, message: 'Payment processor timeout on PayPal', severity: 'high', timestamp: new Date(), status: 'active', provider: 'PayPal' },
  { id: 3, message: 'Rate limit approaching on Square API', severity: 'low', timestamp: new Date(), status: 'acknowledged', provider: 'Square' }
];

// Simple Chart Components using HTML5 Canvas
const TransactionVolumeChart = ({ timeRange }: { timeRange: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sample data based on time range
    const data = timeRange === '1h' 
      ? [120, 135, 150, 145, 160, 155, 170, 165, 180, 175, 190, 185]
      : timeRange === '24h'
      ? [1200, 1350, 1500, 1450, 1600, 1550, 1700, 1650, 1800, 1750, 1900, 1850]
      : [12000, 13500, 15000, 14500, 16000, 15500, 17000, 16500, 18000, 17500, 19000, 18500];

    const labels = timeRange === '1h'
      ? ['10min', '20min', '30min', '40min', '50min', '60min']
      : timeRange === '24h'
      ? ['4h', '8h', '12h', '16h', '20h', '24h']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Find max value for scaling
    const maxValue = Math.max(...data);
    const scale = chartHeight / maxValue;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    for (let i = 1; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw the line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (chartWidth * index) / (data.length - 1);
      const y = canvas.height - padding - (value * scale);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((value, index) => {
      const x = padding + (chartWidth * index) / (data.length - 1);
      const y = canvas.height - padding - (value * scale);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Add labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue * i) / 5);
      const y = canvas.height - padding - (chartHeight * i) / 5;
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding - 10, y + 4);
    }

    // X-axis labels
    const labelStep = Math.max(1, Math.floor(data.length / labels.length));
    labels.forEach((label, index) => {
      const x = padding + (chartWidth * index * labelStep) / (data.length - 1);
      ctx.textAlign = 'center';
      ctx.fillText(label, x, canvas.height - padding + 20);
    });

  }, [timeRange]);

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={200} 
      className="w-full h-full"
      style={{ maxHeight: '200px' }}
    />
  );
};

const ProviderPerformanceChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Provider data
    const providers = ['Stripe', 'PayPal', 'Square'];
    const successRates = [99.2, 98.8, 96.5];
    const colors = ['#10b981', '#f59e0b', '#8b5cf6'];

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / (providers.length * 2);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    successRates.forEach((rate, index) => {
      const x = padding + (index * 2 + 1) * barWidth;
      const barHeight = (rate / 100) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add value label on top of bar
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${rate}%`, x + barWidth / 2, y - 5);

      // Add provider name
      ctx.fillText(providers[index], x + barWidth / 2, canvas.height - padding + 20);
    });

    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (i * 20).toString() + '%';
      const y = canvas.height - padding - (chartHeight * i) / 5;
      ctx.fillText(value, padding - 10, y + 4);
    }

  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={200} 
      className="w-full h-full"
      style={{ maxHeight: '200px' }}
    />
  );
};

// PDF Generation Functions
const generatePDF = (reportType: string, dateRange: string) => {
  const doc = `
Payment Gateway Dashboard - ${reportType} Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateRange}

===========================================

EXECUTIVE SUMMARY
- Total Transaction Volume: $2.4M
- Total Transactions: 12,847
- Average Success Rate: 98.2%
- Average Response Time: 245ms

PROVIDER PERFORMANCE
- Stripe: 99.2% success rate, 245ms avg response
- PayPal: 98.8% success rate, 420ms avg response  
- Square: 96.5% success rate, 680ms avg response

KEY METRICS
- Conversion Rate: 94.7%
- Average Ticket Size: $186.73
- Peak Transaction Hour: 2:00 PM - 3:00 PM
- Geographic Distribution: 45% US, 25% Europe, 30% Other

RECOMMENDATIONS
1. Monitor Square performance - lowest success rate
2. Optimize PayPal integration - highest response time
3. Scale capacity for peak hours (2-3 PM)
4. Consider additional providers for geographic diversity

ALERTS & INCIDENTS
- 2 Active alerts requiring attention
- 1 Acknowledged alert under monitoring
- No critical system failures in reporting period

Report generated by: Abayomi Ajayi, Product Manager
Dashboard: Payment Gateway Management System
Contact: abayomi@company.com

===========================================
End of Report
`;

  // Create and download the text file (simulating PDF)
  const blob = new Blob([doc], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${reportType}_Report_${dateRange}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Analytics Tab Component with Working Charts
const AnalyticsTab = ({ systemMetrics }: any) => {
  const [timeRange, setTimeRange] = useState('24h');
  
  const analyticsData = {
    totalVolume: '$2.4M',
    transactionCount: 12847,
    avgTicketSize: '$186.73',
    conversionRate: '94.7%'
  };

  const handleExport = () => {
    generatePDF('Analytics', timeRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Performance metrics and business intelligence</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.totalVolume}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.transactionCount.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Ticket Size</p>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.avgTicketSize}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.conversionRate}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Working Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume Trend</h3>
          <div className="h-64">
            <TransactionVolumeChart timeRange={timeRange} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>
          <div className="h-64">
            <ProviderPerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ alerts: initialAlerts }: any) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState('all');

  const handleAlertAction = (alertId: number, action: 'acknowledge' | 'resolve') => {
    setAlerts(alerts.map((alert: any) => 
      alert.id === alertId 
        ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' }
        : alert
    ));
  };

  const filteredAlerts = alerts.filter((alert: any) => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'acknowledged': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Alert Management</h2>
          <p className="text-gray-600">Monitor and manage system alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{alerts.filter((a: any) => a.status === 'active').length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-yellow-600">{alerts.filter((a: any) => a.status === 'acknowledged').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{alerts.filter((a: any) => a.status === 'resolved').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert: any) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(alert.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Provider: {alert.provider}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  {alert.status === 'active' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Failover Controls Tab Component
const FailoverTab = ({ providers }: any) => {
  const [failoverMode, setFailoverMode] = useState('automatic');
  const [loadBalancing, setLoadBalancing] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Failover Controls</h2>
          <p className="text-gray-600">Manage provider routing and load balancing</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Failover Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Failover Mode</label>
              <select 
                value={failoverMode} 
                onChange={(e) => setFailoverMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="loadBalancing" 
                checked={loadBalancing}
                onChange={(e) => setLoadBalancing(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="loadBalancing" className="text-sm text-gray-700">
                Enable Load Balancing
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Circuit Breaker Status</h3>
          <div className="space-y-3">
            {providers.map((provider: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{provider.name}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${provider.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {provider.status === 'online' ? 'Active' : 'Circuit Open'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Routing */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Traffic Routing</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {providers.map((provider: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${provider.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Weight: {index === 0 ? '50%' : index === 1 ? '30%' : '20%'}
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reports Tab Component with Working PDF Generation
const ReportsTab = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  const reportTypes = [
    { id: 'financial', name: 'Financial Summary', description: 'Revenue, fees, and settlement data' },
    { id: 'operational', name: 'Operational Metrics', description: 'Success rates, response times, uptime' },
    { id: 'compliance', name: 'Compliance Report', description: 'Regulatory and audit information' },
    { id: 'provider', name: 'Provider Analysis', description: 'Detailed provider performance comparison' }
  ];

  const handleGenerateReport = () => {
    if (selectedReport) {
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || selectedReport;
      generatePDF(reportName, dateRange);
    }
  };

  const handleDownloadReport = (reportType: string) => {
    generatePDF(reportType, dateRange);
  };

  const handleExportAll = () => {
    reportTypes.forEach((report, index) => {
      setTimeout(() => {
        generatePDF(report.name, dateRange);
      }, index * 500); // Stagger downloads
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reporting Dashboard</h2>
          <p className="text-gray-600">Generate and export comprehensive reports</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
      </div>

      {/* Report Generator */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Report Type</option>
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerateReport}
              disabled={!selectedReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">{report.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last generated: 2 hours ago</span>
              <button 
                onClick={() => handleDownloadReport(report.name)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {['Financial Summary - September 2025', 'Operational Metrics - Weekly', 'Provider Analysis - Q3 2025'].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">{report}</span>
                </div>
                <button 
                  onClick={() => handleDownloadReport(report)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component (your existing one)
const OverviewTab = ({ systemMetrics, providers, alerts }: any) => {
  const [customLayout, setCustomLayout] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Simple Customization */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your payment gateway performance</p>
        </div>
        <button
          onClick={() => setCustomLayout(!customLayout)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {customLayout ? 'Exit Customize' : 'Customize Layout'}
        </button>
      </div>

      {/* Customizable Message */}
      {customLayout && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Customization Mode:</strong> Layout customization features will be added here. 
            This demonstrates the framework for future drag-and-drop functionality.
          </p>
        </div>
      )}

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{systemMetrics.transactions}</div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{systemMetrics.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{alerts.length}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{systemMetrics.avgResponse}ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Provider Status Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((provider: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{provider.name}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${provider.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-semibold">{provider.uptime}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold">{provider.successRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{provider.responseTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">#12345</td>
                <td className="px-6 py-4 text-sm text-gray-900">Stripe</td>
                <td className="px-6 py-4 text-sm text-gray-900">$299.00</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Success</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">#12346</td>
                <td className="px-6 py-4 text-sm text-gray-900">PayPal</td>
                <td className="px-6 py-4 text-sm text-gray-900">$149.50</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Success</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function PaymentGatewayDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState(mockSystemMetrics);
  const [providers] = useState(mockProviders);
  const [alerts] = useState(mockAlerts);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSimulating) {
        setSystemMetrics(prev => ({
          ...prev,
          transactions: prev.transactions + Math.floor(Math.random() * 5),
          avgResponse: Math.floor(200 + Math.random() * 100)
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'analytics', name: 'Analytics', icon: Activity },
    { id: 'alerts', name: 'Alerts', icon: Bell, badge: alerts.filter(a => a.status === 'active').length },
    { id: 'failover', name: 'Failover Controls', icon: Settings },
    { id: 'reports', name: 'Reports', icon: FileText },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab systemMetrics={systemMetrics} providers={providers} alerts={alerts} />;
      case 'analytics':
        return <AnalyticsTab systemMetrics={systemMetrics} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} />;
      case 'failover':
        return <FailoverTab providers={providers} />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <OverviewTab systemMetrics={systemMetrics} providers={providers} alerts={alerts} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Dashboard</h1>
              <p className="text-gray-600">Monitor and manage multiple payment providers</p>
              <p className="text-sm text-gray-500">Project Manager: Abayomi Ajayi | Last Updated: 9/3/2025</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${alerts.filter(a => a.status === 'active').length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {alerts.filter(a => a.status === 'active').length} Active Alerts
                </div>
              </div>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSimulating ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <Play className="h-4 w-4 mr-2 inline" />
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </div>
    </div>
  );
}
