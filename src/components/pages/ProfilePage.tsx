import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Heart,
  Settings,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  Download,
  Upload,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (route: Route) => void;
}

interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  medicalConditions: string;
  medications: string;
  dietaryRestrictions: string;
  emergencyContact: string;
}

interface PrivacySettings {
  dataRetention: string;
  shareAnonymizedData: boolean;
  analyticsEnabled: boolean;
  marketingEmails: boolean;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  analysisReminders: boolean;
  healthTips: boolean;
  riskAlerts: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    medicalConditions: '',
    medications: '',
    dietaryRestrictions: '',
    emergencyContact: ''
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetention: '2-years',
    shareAnonymizedData: true,
    analyticsEnabled: true,
    marketingEmails: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    analysisReminders: true,
    healthTips: true,
    riskAlerts: true
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'privacy' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: profileData.displayName,
        email: profileData.email
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    // Mock data export
    const exportData = {
      profile: profileData,
      privacy: privacySettings,
      notifications: notificationSettings,
      analysisHistory: [],
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anemia-app-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires email confirmation. Please contact support.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'health', label: 'Health Info', icon: Heart },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <Navigation currentRoute="profile" onNavigate={onNavigate} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.displayName || 'User Profile'}
              </h1>
              <p className="text-gray-600">
                Manage your account settings and health information
              </p>
              {user?.isGuest && (
                <Badge variant="secondary" className="mt-2">
                  Guest Account
                </Badge>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-white shadow-sm text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input
                        id="displayName"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="Name and phone number"
                    />
                  </div>

                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSaving ? (
                      <>
                        <Settings className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Two-Factor Auth
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Login History
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium">
                      {user?.createdAt?.toLocaleDateString() || 'Today'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last login:</span>
                    <span className="font-medium">
                      {user?.lastLogin?.toLocaleDateString() || 'Today'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total analyses:</span>
                    <span className="font-medium">18</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Health Info Tab */}
        {activeTab === 'health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-600" />
                    Health Information
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                  >
                    {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50/50 border-blue-200">
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    This information helps our AI provide more accurate analysis and personalized recommendations. 
                    All health data is encrypted and never shared without your consent.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={showSensitiveData ? profileData.medicalConditions : '••••••••••'}
                    onChange={(e) => setProfileData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                    placeholder="List any relevant medical conditions (optional)"
                    rows={3}
                    disabled={!showSensitiveData}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={showSensitiveData ? profileData.medications : '••••••••••'}
                    onChange={(e) => setProfileData(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="List current medications and supplements (optional)"
                    rows={3}
                    disabled={!showSensitiveData}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Dietary Information</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    value={showSensitiveData ? profileData.dietaryRestrictions : '••••••••••'}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                    placeholder="Dietary restrictions, preferences, or relevant nutrition info (optional)"
                    rows={2}
                    disabled={!showSensitiveData}
                  />
                </div>

                <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Virtual Coach Configuration
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Enable personalized health coaching based on your profile and analysis history.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalizedTips" className="text-sm">
                        Personalized Health Tips
                      </Label>
                      <Switch id="personalizedTips" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="riskPrediction" className="text-sm">
                        Risk Trend Predictions
                      </Label>
                      <Switch id="riskPrediction" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clinicalReferrals" className="text-sm">
                        Auto-Generate Clinical Reports
                      </Label>
                      <Switch id="clinicalReferrals" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Health Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Privacy & Data Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataRetention">Data Retention Period</Label>
                    <Select 
                      value={privacySettings.dataRetention} 
                      onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, dataRetention: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">6 months</SelectItem>
                        <SelectItem value="1-year">1 year</SelectItem>
                        <SelectItem value="2-years">2 years (recommended)</SelectItem>
                        <SelectItem value="5-years">5 years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      How long to keep your analysis data for trend tracking
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                      <div>
                        <Label className="font-medium">Share Anonymized Data for Research</Label>
                        <p className="text-xs text-gray-600">
                          Help improve AI models by sharing anonymized analysis data
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.shareAnonymizedData}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareAnonymizedData: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                      <div>
                        <Label className="font-medium">Analytics & Performance</Label>
                        <p className="text-xs text-gray-600">
                          Allow collection of usage analytics to improve the app
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.analyticsEnabled}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                      <div>
                        <Label className="font-medium">Marketing Communications</Label>
                        <p className="text-xs text-gray-600">
                          Receive emails about new features and health tips
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.marketingEmails}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, marketingEmails: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportData} className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-red-800 font-medium">Danger Zone</p>
                      <p className="text-red-700 text-sm">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50/50 border border-blue-200">
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive instant notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                    <div>
                      <Label className="font-medium">Analysis Reminders</Label>
                      <p className="text-sm text-gray-600">
                        Reminders to take regular health screenings
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.analysisReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, analysisReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                    <div>
                      <Label className="font-medium">Health Tips</Label>
                      <p className="text-sm text-gray-600">
                        Daily personalized health and nutrition tips
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.healthTips}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, healthTips: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-50/50 border border-red-200">
                    <div>
                      <Label className="font-medium">Risk Alerts</Label>
                      <p className="text-sm text-gray-600">
                        Important alerts about concerning risk trends
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.riskAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, riskAlerts: checked }))}
                    />
                  </div>
                </div>

                <Alert className="bg-yellow-50/50 border-yellow-200">
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    We recommend keeping risk alerts enabled to ensure you receive important health notifications. 
                    You can always adjust these settings later.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => toast.success('Notification preferences saved!')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};