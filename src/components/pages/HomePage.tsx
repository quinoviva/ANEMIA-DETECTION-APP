import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Camera,
  Shield,
  Zap,
  Brain,
  ChevronRight,
  CheckCircle,
  Eye,
  Award,
  FileText,
  Users
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: Route) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Camera,
      title: "Skin Image Analysis",
      description: "Upload or capture skin images for AI-powered anemia detection using advanced computer vision technology."
    },
    {
      icon: Brain,
      title: "CNN Deep Learning",
      description: "Our trained convolutional neural networks provide accurate analysis with explainable AI insights."
    },
    {
      icon: Shield,
      title: "Gemini AI Validation",
      description: "Every image is validated by Gemini AI to ensure it contains appropriate skin content before analysis."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Get instant results with confidence scores and visual explanations of the AI's decision process."
    }
  ];

  const reliabilityFeatures = [
    {
      icon: Eye,
      title: "Explainable AI",
      description: "See exactly what the AI model is analyzing with Grad-CAM heatmap visualizations showing focus areas."
    },
    {
      icon: Award,
      title: "Clinical Validation",
      description: "Our models are trained on diverse, medically validated datasets with rigorous cross-validation testing."
    },
    {
      icon: FileText,
      title: "Transparent Reporting",
      description: "Every analysis includes confidence scores, model version, and clear disclaimers about limitations."
    },
    {
      icon: Users,
      title: "Medical Guidelines",
      description: "Results include recommendations to consult healthcare professionals for proper medical diagnosis."
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen">
      <Navigation currentRoute="home" onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1757152962882-6bf8495b324d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4NjY5NTE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Medical technology background"
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
          />
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 backdrop-blur-xl bg-white/20 dark:bg-gray-800/20 border-white/30">
              <Award className="w-4 h-4 mr-2" />
              Medical AI Technology
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              AI-Powered Anemia Detection
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Revolutionary skin-based analysis using advanced CNN models with Gemini AI validation. 
              Get instant, accurate health insights with explainable AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => onNavigate('analysis')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-xl backdrop-blur-xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Analysis
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              {!user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('auth')}
                  className="text-lg px-8 py-6 rounded-xl border-2 backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border-white/30"
                >
                  Create Account
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/30 dark:to-purple-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Advanced Health Technology
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI, clinical expertise, and user-friendly design 
              to provide accurate, accessible health screening.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This is Reliable Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why This Technology is Reliable
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI system is built with transparency, validation, and medical accuracy at its core
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {reliabilityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                      Important Medical Notice
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      This tool is designed for informational purposes only and should not replace professional medical advice, 
                      diagnosis, or treatment. Always consult with qualified healthcare providers for proper medical evaluation. 
                      Our AI provides screening assistance but cannot guarantee 100% accuracy in all cases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/30 dark:to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Start Your Health Analysis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Experience advanced AI-powered anemia screening with transparent, explainable results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('analysis')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-xl backdrop-blur-xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Analysis
              </Button>
              
              {!user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('auth')}
                  className="text-lg px-8 py-6 rounded-xl border-2 backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border-white/30"
                >
                  Create Account
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="font-semibold">Anemia Detection</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered health screening technology for early anemia detection with transparent, explainable results.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Disclaimer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Anemia Detection. All rights reserved. This tool is for informational purposes only and is not a medical device.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};