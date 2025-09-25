import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
  Camera,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Lightbulb,
  Calendar,
  Download,
  Bell,
  Zap
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: Route) => void;
}

// Mock data for charts and analytics
const riskScoreData = [
  { date: 'Jan', risk: 15, confidence: 85 },
  { date: 'Feb', risk: 18, confidence: 82 },
  { date: 'Mar', risk: 22, confidence: 88 },
  { date: 'Apr', risk: 19, confidence: 90 },
  { date: 'May', risk: 16, confidence: 87 },
  { date: 'Jun', risk: 14, confidence: 92 }
];

const analysisData = [
  { name: 'Normal', value: 68, color: '#10B981' },
  { name: 'Mild Risk', value: 22, color: '#F59E0B' },
  { name: 'High Risk', value: 10, color: '#EF4444' }
];

const weeklyActivity = [
  { day: 'Mon', analyses: 3 },
  { day: 'Tue', analyses: 1 },
  { day: 'Wed', analyses: 4 },
  { day: 'Thu', analyses: 2 },
  { day: 'Fri', analyses: 5 },
  { day: 'Sat', analyses: 2 },
  { day: 'Sun', analyses: 1 }
];

const recentResults = [
  {
    id: '1',
    date: '2024-01-15',
    result: 'Normal',
    confidence: 94,
    riskScore: 12,
    image: 'palm_scan_01.jpg'
  },
  {
    id: '2',
    date: '2024-01-10',
    result: 'Mild Risk',
    confidence: 78,
    riskScore: 28,
    image: 'palm_scan_02.jpg'
  },
  {
    id: '3',
    date: '2024-01-05',
    result: 'Normal',
    confidence: 91,
    riskScore: 15,
    image: 'palm_scan_03.jpg'
  }
];

const coachRecommendations = [
  {
    type: 'nutrition',
    title: 'Iron-Rich Foods',
    description: 'Include spinach, lentils, and lean meats in your diet',
    priority: 'high',
    completed: false
  },
  {
    type: 'lifestyle',
    title: 'Regular Exercise',
    description: 'Maintain moderate physical activity 3-4 times per week',
    priority: 'medium',
    completed: true
  },
  {
    type: 'monitoring',
    title: 'Next Screening',
    description: 'Schedule follow-up screening in 2 weeks',
    priority: 'high',
    completed: false
  }
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentRiskScore, setCurrentRiskScore] = useState(14);
  const [riskTrend, setRiskTrend] = useState<'up' | 'down' | 'stable'>('down');
  const [totalAnalyses, setTotalAnalyses] = useState(18);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentRiskScore(prev => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-600';
    if (score < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score < 20) return 'default';
    if (score < 40) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <Navigation currentRoute="dashboard" onNavigate={onNavigate} />
      
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
                Welcome back, {user?.displayName || 'User'}
              </h1>
              <p className="text-gray-600">
                Your personalized health dashboard with AI-powered insights
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={() => onNavigate('analysis')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Risk Score</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getRiskColor(currentRiskScore)}`}>
                        {currentRiskScore.toFixed(1)}%
                      </span>
                      {riskTrend === 'down' ? (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      ) : riskTrend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      ) : (
                        <Activity className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <Badge variant={getRiskBadgeVariant(currentRiskScore)} className="mt-2">
                      {currentRiskScore < 20 ? 'Low Risk' : currentRiskScore < 40 ? 'Moderate' : 'High Risk'}
                    </Badge>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Analyses</p>
                    <span className="text-2xl font-bold text-gray-900">{totalAnalyses}</span>
                    <p className="text-xs text-green-600 mt-1">+3 this week</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
                    <span className="text-2xl font-bold text-gray-900">89.2%</span>
                    <p className="text-xs text-blue-600 mt-1">Excellent accuracy</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Health Streak</p>
                    <span className="text-2xl font-bold text-gray-900">12 days</span>
                    <p className="text-xs text-orange-600 mt-1">Keep it up!</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Risk Score Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
                    Risk Score Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskScoreData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
                                  <p className="font-medium">{`${label}`}</p>
                                  <p className="text-blue-600">{`Risk Score: ${payload[0].value}%`}</p>
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

            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="day" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
                                  <p className="font-medium">{`${label}`}</p>
                                  <p className="text-green-600">{`Analyses: ${payload[0].value}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="analyses" 
                          fill="url(#greenGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Results
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('results')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/50 to-white/30 border border-white/20"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{result.date}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={result.result === 'Normal' ? 'default' : 'secondary'}>
                                {result.result}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {result.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getRiskColor(result.riskScore)}`}>
                            {result.riskScore}% risk
                          </p>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Analysis Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    Analysis Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysisData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {analysisData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
                                  <p className="font-medium">{payload[0].name}</p>
                                  <p style={{ color: payload[0].payload.color }}>
                                    {payload[0].value}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {analysisData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Virtual Coach Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                    Virtual Coach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coachRecommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`p-4 rounded-xl border ${
                          rec.completed 
                            ? 'bg-green-50/50 border-green-200' 
                            : 'bg-white/50 border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{rec.title}</h4>
                              <Badge 
                                variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                          {rec.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    onClick={() => onNavigate('profile')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Get Personalized Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('analysis')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    New Skin Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('results')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Health Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('profile')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Update Health Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};