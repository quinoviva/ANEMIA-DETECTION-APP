import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  Share2,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  TrendingDown,
  Camera,
  FileText,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Loader2
} from 'lucide-react';

interface ResultsPageProps {
  onNavigate: (route: Route) => void;
}

interface AnalysisResult {
  id: string;
  date: Date;
  result: 'Normal' | 'Mild Risk' | 'High Risk';
  confidence: number;
  riskScore: number;
  imageUrl?: string;
  notes?: string;
  modelVersion: string;
  processingTime: number;
}

// Mock data for demonstration
const mockResults: AnalysisResult[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    result: 'Normal',
    confidence: 94.2,
    riskScore: 12.3,
    modelVersion: 'v2.1.0',
    processingTime: 23,
    notes: 'Regular follow-up analysis showing consistent normal readings.'
  },
  {
    id: '2',
    date: new Date('2024-01-10'),
    result: 'Mild Risk',
    confidence: 78.5,
    riskScore: 28.7,
    modelVersion: 'v2.1.0',
    processingTime: 31,
    notes: 'Slight elevation detected. Recommend dietary adjustments.'
  },
  {
    id: '3',
    date: new Date('2024-01-05'),
    result: 'Normal',
    confidence: 91.8,
    riskScore: 15.2,
    modelVersion: 'v2.0.8',
    processingTime: 28
  },
  {
    id: '4',
    date: new Date('2024-01-01'),
    result: 'High Risk',
    confidence: 82.1,
    riskScore: 67.4,
    modelVersion: 'v2.0.8',
    processingTime: 34,
    notes: 'Immediate medical consultation recommended.'
  },
  {
    id: '5',
    date: new Date('2023-12-28'),
    result: 'Mild Risk',
    confidence: 75.3,
    riskScore: 34.1,
    modelVersion: 'v2.0.8',
    processingTime: 29
  },
  {
    id: '6',
    date: new Date('2023-12-25'),
    result: 'Normal',
    confidence: 89.7,
    riskScore: 18.6,
    modelVersion: 'v2.0.7',
    processingTime: 25
  }
];

const trendData = mockResults.map(result => ({
  date: format(result.date, 'MMM dd'),
  risk: result.riskScore,
  confidence: result.confidence
})).reverse();

export const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const { user, isGuest } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'risk'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const resultsPerPage = 6;

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = mockResults.filter(result => {
      // Search filter
      if (searchQuery) {
        return result.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               result.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
               result.id.includes(searchQuery);
      }
      return true;
    });

    // Result type filter
    if (filterResult !== 'all') {
      filtered = filtered.filter(result => result.result === filterResult);
    }

    // Date range filter
    if (selectedDateRange.from) {
      filtered = filtered.filter(result => result.date >= selectedDateRange.from!);
    }
    if (selectedDateRange.to) {
      filtered = filtered.filter(result => result.date <= selectedDateRange.to!);
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'risk':
          comparison = a.riskScore - b.riskScore;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, filterResult, selectedDateRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleExportResults = async () => {
    setIsExporting(true);
    
    // Mock export functionality
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      user: user?.displayName,
      exportDate: new Date().toISOString(),
      totalResults: filteredResults.length,
      results: filteredResults.map(result => ({
        ...result,
        date: result.date.toISOString()
      })),
      summary: {
        averageRiskScore: filteredResults.reduce((sum, r) => sum + r.riskScore, 0) / filteredResults.length,
        averageConfidence: filteredResults.reduce((sum, r) => sum + r.confidence, 0) / filteredResults.length,
        resultDistribution: {
          normal: filteredResults.filter(r => r.result === 'Normal').length,
          mildRisk: filteredResults.filter(r => r.result === 'Mild Risk').length,
          highRisk: filteredResults.filter(r => r.result === 'High Risk').length
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anemia-analysis-results-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Normal': return 'text-green-600';
      case 'Mild Risk': return 'text-yellow-600';
      case 'High Risk': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case 'Normal': return 'default';
      case 'Mild Risk': return 'secondary';
      case 'High Risk': return 'destructive';
      default: return 'outline';
    }
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
        <Navigation currentRoute="results" onNavigate={onNavigate} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Results History
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Create an account to save your analysis results, track health trends over time, 
              and access advanced features like the Virtual Anemia Coach.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => onNavigate('auth')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Account
              </Button>
              <div>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('analysis')}
                >
                  Try Guest Analysis
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <Navigation currentRoute="results" onNavigate={onNavigate} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analysis Results
              </h1>
              <p className="text-gray-600">
                Track your health journey with detailed analysis history and trends
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={handleExportResults}
                disabled={isExporting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Data
              </Button>
              <Button
                onClick={() => onNavigate('analysis')}
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search results..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Result Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Result Type</label>
                    <Select value={filterResult} onValueChange={setFilterResult}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Mild Risk">Mild Risk</SelectItem>
                        <SelectItem value="High Risk">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="confidence">Confidence</SelectItem>
                        <SelectItem value="risk">Risk Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Order</label>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDateRange.from ? (
                            selectedDateRange.to ? (
                              <>
                                {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                                {format(selectedDateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(selectedDateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          selected={selectedDateRange}
                          onSelect={setSelectedDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterResult('all');
                      setSortBy('date');
                      setSortOrder('desc');
                      setSelectedDateRange({});
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Results:</span>
                    <span className="font-medium">{filteredResults.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Risk Score:</span>
                    <span className="font-medium">
                      {(filteredResults.reduce((sum, r) => sum + r.riskScore, 0) / filteredResults.length || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Confidence:</span>
                    <span className="font-medium">
                      {(filteredResults.reduce((sum, r) => sum + r.confidence, 0) / filteredResults.length || 0).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Risk Score Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
                                  <p className="font-medium">{label}</p>
                                  <p className="text-blue-600">{`Risk: ${payload[0].value}%`}</p>
                                  <p className="text-purple-600">{`Confidence: ${payload[1].value}%`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="risk" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="confidence" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {paginatedResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                            onClick={() => setSelectedResult(result)}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant={getResultBadgeVariant(result.result)}>
                                  {result.result}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {result.modelVersion}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {format(result.date, 'MMM dd, yyyy')} at {format(result.date, 'HH:mm')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Confidence</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {result.confidence}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Risk Score</p>
                              <p className={`text-lg font-semibold ${getResultColor(result.result)}`}>
                                {result.riskScore}%
                              </p>
                            </div>
                          </div>

                          {result.notes && (
                            <p className="text-sm text-gray-700 bg-gray-50/50 p-2 rounded">
                              {result.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {result.processingTime}s
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or perform a new analysis.
                  </p>
                  <Button onClick={() => onNavigate('analysis')}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start New Analysis
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Result Detail Modal */}
      {selectedResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResult(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Analysis Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50">
                    <p className="text-sm text-blue-600 font-medium mb-1">Result</p>
                    <Badge variant={getResultBadgeVariant(selectedResult.result)} className="text-lg">
                      {selectedResult.result}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50">
                    <p className="text-sm text-purple-600 font-medium mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold ${getResultColor(selectedResult.result)}`}>
                      {selectedResult.riskScore}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-green-50">
                    <p className="text-sm text-green-600 font-medium mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-green-800">
                      {selectedResult.confidence}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-600 font-medium mb-1">Processing Time</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedResult.processingTime}s
                    </p>
                  </div>
                </div>

                {selectedResult.notes && (
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-600 font-medium mb-2">Notes</p>
                    <p className="text-gray-700">{selectedResult.notes}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>Analysis Date:</strong> {format(selectedResult.date, 'PPpp')}</p>
                  <p><strong>Model Version:</strong> {selectedResult.modelVersion}</p>
                  <p><strong>Result ID:</strong> {selectedResult.id}</p>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Result
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};