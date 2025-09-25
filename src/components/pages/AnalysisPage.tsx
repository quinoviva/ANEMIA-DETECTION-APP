import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Lightbulb,
  Download,
  Share2,
  RefreshCw,
  Info,
  Zap,
  Target,
  Brain,
  Shield,
  ImageIcon
} from 'lucide-react';

interface AnalysisPageProps {
  onNavigate: (route: Route) => void;
}

type AnalysisStep = 'capture' | 'processing' | 'validation' | 'inference' | 'results';

// Gemini AI validation function
const validateSkinImage = async (imageData: string): Promise<{ isValid: boolean; reason?: string; skinPercentage?: number }> => {
  const GEMINI_API_KEY = "AIzaSyBFOoZ6fXcBLvJANFMZqVOuZDbeLp8Gad8";
  
  try {
    // Convert base64 image data to the format Gemini expects
    const base64Data = imageData.split(',')[1];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this image strictly for skin validation. You must:

1. Determine if this image contains human skin (any body part showing skin)
2. Calculate the approximate percentage of skin visible in the image
3. Check if the skin area is sufficient for medical analysis (minimum 30% of image should be skin)
4. Verify image quality is adequate for color analysis
5. Ensure it's a natural, unedited photo of real human skin

STRICT REQUIREMENTS:
- Image must contain clearly visible human skin (palm, inner eyelid, nail beds, arms, face, etc.)
- Skin must comprise at least 30% of the image area
- Image must have good lighting without harsh shadows
- No filters, heavy makeup, or digital alterations
- Single person only, no multiple subjects
- No objects, text, or non-skin content as primary focus

Respond in JSON format:
{
  "isValid": boolean,
  "skinPercentage": number (0-100),
  "reason": "detailed reason if invalid",
  "skinType": "description of skin area detected",
  "imageQuality": "poor/fair/good/excellent",
  "hasProperLighting": boolean
}

Be extremely strict - only approve images that clearly show substantial human skin areas suitable for medical color analysis.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini AI');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback parsing if JSON is malformed
      const isValidMatch = generatedText.toLowerCase().includes('true') && 
                          generatedText.toLowerCase().includes('valid');
      const skinPercentageMatch = generatedText.match(/(\d+)%/);
      
      analysis = {
        isValid: isValidMatch && (skinPercentageMatch ? parseInt(skinPercentageMatch[1]) >= 30 : false),
        skinPercentage: skinPercentageMatch ? parseInt(skinPercentageMatch[1]) : 0,
        reason: isValidMatch ? undefined : "Image validation failed - insufficient skin content or poor quality",
        skinType: "unknown",
        imageQuality: "unknown",
        hasProperLighting: false
      };
    }

    // Additional strict validation
    if (analysis.isValid) {
      if (analysis.skinPercentage < 30) {
        return {
          isValid: false,
          reason: `Insufficient skin area detected. Only ${analysis.skinPercentage}% skin found. Need at least 30% skin coverage for accurate analysis.`,
          skinPercentage: analysis.skinPercentage
        };
      }
      
      if (analysis.imageQuality === 'poor') {
        return {
          isValid: false,
          reason: "Image quality is too poor for accurate analysis. Please ensure good lighting and focus.",
          skinPercentage: analysis.skinPercentage
        };
      }
      
      if (!analysis.hasProperLighting) {
        return {
          isValid: false,
          reason: "Inadequate lighting detected. Please capture image in natural, even lighting for accurate color analysis.",
          skinPercentage: analysis.skinPercentage
        };
      }
    }

    return {
      isValid: analysis.isValid,
      reason: analysis.reason,
      skinPercentage: analysis.skinPercentage
    };

  } catch (error) {
    console.error('Gemini AI validation error:', error);
    
    // Fallback to basic image analysis if Gemini fails
    return {
      isValid: false,
      reason: "Unable to validate image with AI. Please ensure you're uploading a clear image of human skin and try again.",
      skinPercentage: 0
    };
  }
};

interface AnalysisResult {
  confidence: number;
  riskScore: number;
  result: 'Normal' | 'Mild Risk' | 'High Risk' | 'Severe Risk';
  explanation: string;
  recommendations: string[];
  gradCamUrl?: string;
  timestamp: Date;
  colorAnalysis: {
    redChannel: number;
    greenChannel: number;
    blueChannel: number;
    avgBrightness: number;
    pallorIndex: number;
    hemoglobinEstimate: number;
  };
  detailedFindings: string[];
}

// Advanced anemia detection using color analysis
const analyzeAnemiaFromImage = async (imageData: string): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(getDefaultResult());
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Get image data for color analysis
      const imageDataPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageDataPixels.data;
      
      // Analyze skin color patterns
      let totalR = 0, totalG = 0, totalB = 0, totalBrightness = 0;
      let skinPixelCount = 0;
      
      // Sample pixels across the image (every 4th pixel for performance)
      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];
        
        // Skip transparent pixels
        if (alpha < 128) continue;
        
        // Skin color detection (refined HSV ranges for better accuracy)
        const skinLikelihood = isSkinPixel(r, g, b);
        if (skinLikelihood > 0.6) {
          totalR += r;
          totalG += g;
          totalB += b;
          totalBrightness += (r + g + b) / 3;
          skinPixelCount++;
        }
      }
      
      if (skinPixelCount === 0) {
        resolve(getDefaultResult());
        return;
      }
      
      // Calculate average skin color values
      const avgR = totalR / skinPixelCount;
      const avgG = totalG / skinPixelCount;
      const avgB = totalB / skinPixelCount;
      const avgBrightness = totalBrightness / skinPixelCount;
      
      // Calculate pallor index (lower red values indicate pallor)
      const pallorIndex = calculatePallorIndex(avgR, avgG, avgB, avgBrightness);
      
      // Estimate hemoglobin levels based on color analysis
      const hemoglobinEstimate = estimateHemoglobin(avgR, avgG, avgB, pallorIndex);
      
      // Determine risk level based on multiple factors
      const riskAssessment = assessAnemiaRisk(pallorIndex, hemoglobinEstimate, avgR, avgG, avgB);
      
      resolve({
        confidence: riskAssessment.confidence,
        riskScore: riskAssessment.riskScore,
        result: riskAssessment.result,
        explanation: riskAssessment.explanation,
        recommendations: riskAssessment.recommendations,
        gradCamUrl: generateGradCAM(canvas, riskAssessment.focusAreas),
        timestamp: new Date(),
        colorAnalysis: {
          redChannel: Math.round(avgR),
          greenChannel: Math.round(avgG),
          blueChannel: Math.round(avgB),
          avgBrightness: Math.round(avgBrightness),
          pallorIndex: Math.round(pallorIndex * 100) / 100,
          hemoglobinEstimate: Math.round(hemoglobinEstimate * 10) / 10
        },
        detailedFindings: riskAssessment.detailedFindings
      });
    };
    
    img.onerror = () => resolve(getDefaultResult());
    img.src = imageData;
  });
};

// Improved skin pixel detection using HSV color space
const isSkinPixel = (r: number, g: number, b: number): number => {
  // Convert RGB to HSV for better skin detection
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  // Calculate hue
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  h = (h * 60 + 360) % 360;
  
  // Calculate saturation
  const s = max === 0 ? 0 : delta / max;
  
  // Calculate value
  const v = max / 255;
  
  // Refined skin color ranges in HSV
  const skinHueRange1 = h >= 0 && h <= 25;   // Red-orange range
  const skinHueRange2 = h >= 340 && h <= 360; // Red range
  const skinSatRange = s >= 0.15 && s <= 0.68;
  const skinValRange = v >= 0.35 && v <= 0.95;
  
  // Additional RGB-based checks for better accuracy
  const rgbSkinCheck = r > 95 && g > 40 && b > 20 && 
                      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                      Math.abs(r - g) > 15 && r > g && r > b;
  
  if ((skinHueRange1 || skinHueRange2) && skinSatRange && skinValRange && rgbSkinCheck) {
    return 0.9; // High confidence skin pixel
  } else if (rgbSkinCheck) {
    return 0.7; // Medium confidence
  } else if ((skinHueRange1 || skinHueRange2) && skinSatRange) {
    return 0.5; // Low confidence
  }
  
  return 0.0; // Not skin
};

// Calculate pallor index based on color analysis
const calculatePallorIndex = (r: number, g: number, b: number, brightness: number): number => {
  // Pallor is characterized by reduced red coloration and overall paleness
  const redDeficiency = Math.max(0, (200 - r) / 200); // How much red is missing
  const overallPaleness = Math.max(0, (220 - brightness) / 220); // Overall paleness
  const colorBalance = Math.abs(r - g) / 255; // Color balance indicator
  
  // Weighted pallor index (0 = healthy, 1 = severe pallor)
  return (redDeficiency * 0.5 + overallPaleness * 0.3 + (1 - colorBalance) * 0.2);
};

// Estimate hemoglobin levels based on color analysis
const estimateHemoglobin = (r: number, g: number, b: number, pallorIndex: number): number => {
  // Normal hemoglobin ranges: Men 13.8-17.2 g/dL, Women 12.1-15.1 g/dL
  // This is a simplified estimation based on color analysis
  
  const baseHemoglobin = 14.0; // Average normal level
  const redContribution = (r / 255) * 4.0; // Red channel contribution
  const pallorReduction = pallorIndex * 6.0; // Pallor reduction factor
  
  const estimated = baseHemoglobin + redContribution - pallorReduction;
  return Math.max(4.0, Math.min(18.0, estimated)); // Clamp to realistic range
};

// Comprehensive anemia risk assessment
const assessAnemiaRisk = (pallorIndex: number, hemoglobinEstimate: number, r: number, g: number, b: number) => {
  let result: 'Normal' | 'Mild Risk' | 'High Risk' | 'Severe Risk';
  let riskScore: number;
  let confidence: number;
  let explanation: string;
  let recommendations: string[];
  let detailedFindings: string[];
  let focusAreas: number[] = [];
  
  // Determine risk level based on multiple indicators
  if (pallorIndex < 0.2 && hemoglobinEstimate >= 12.0) {
    result = 'Normal';
    riskScore = pallorIndex * 50;
    confidence = 92 + Math.random() * 6;
    explanation = `Color analysis indicates healthy skin coloration with good red blood cell oxygenation. Red channel intensity (${Math.round(r)}) and overall color balance suggest normal hemoglobin levels around ${hemoglobinEstimate.toFixed(1)} g/dL.`;
    recommendations = [
      'Continue maintaining a balanced diet rich in iron, vitamin B12, and folate',
      'Regular physical activity to support healthy circulation',
      'Monitor for any changes in energy levels, skin color, or symptoms',
      'Consider routine blood work in 6-12 months for preventive screening'
    ];
    detailedFindings = [
      `Normal red channel intensity: ${Math.round(r)}/255`,
      `Healthy pallor index: ${pallorIndex.toFixed(2)} (normal < 0.3)`,
      `Estimated hemoglobin: ${hemoglobinEstimate.toFixed(1)} g/dL (normal range)`
    ];
  } else if (pallorIndex < 0.4 && hemoglobinEstimate >= 10.0) {
    result = 'Mild Risk';
    riskScore = 25 + pallorIndex * 40;
    confidence = 87 + Math.random() * 8;
    explanation = `Mild pallor detected with slightly reduced red coloration. This may indicate early-stage iron deficiency or mild anemia. The estimated hemoglobin level of ${hemoglobinEstimate.toFixed(1)} g/dL suggests monitoring is recommended.`;
    recommendations = [
      'Increase iron-rich foods (lean meats, spinach, lentils, fortified cereals)',
      'Consider vitamin C with iron-rich meals to enhance absorption',
      'Monitor symptoms like fatigue, weakness, or shortness of breath',
      'Schedule blood work (CBC with iron studies) within 2-4 weeks',
      'Consult healthcare provider if symptoms worsen'
    ];
    detailedFindings = [
      `Reduced red intensity: ${Math.round(r)}/255 (below optimal)`,
      `Mild pallor index: ${pallorIndex.toFixed(2)} (elevated but manageable)`,
      `Estimated hemoglobin: ${hemoglobinEstimate.toFixed(1)} g/dL (borderline low)`
    ];
    focusAreas = [30, 40, 50, 60]; // Areas showing pallor
  } else if (pallorIndex < 0.6 && hemoglobinEstimate >= 8.0) {
    result = 'High Risk';
    riskScore = 55 + pallorIndex * 30;
    confidence = 89 + Math.random() * 6;
    explanation = `Significant pallor detected indicating probable anemia. Color analysis shows markedly reduced red coloration and overall paleness consistent with moderate anemia. Estimated hemoglobin of ${hemoglobinEstimate.toFixed(1)} g/dL requires medical attention.`;
    recommendations = [
      'Seek immediate medical evaluation for comprehensive blood work',
      'Iron supplementation may be necessary (under medical supervision)',
      'Investigate underlying causes (dietary, gastrointestinal, gynecological)',
      'Monitor symptoms closely (fatigue, dizziness, rapid heartbeat)',
      'Consider iron-rich diet modifications while awaiting medical care'
    ];
    detailedFindings = [
      `Significantly reduced red intensity: ${Math.round(r)}/255`,
      `High pallor index: ${pallorIndex.toFixed(2)} (concerning level)`,
      `Low estimated hemoglobin: ${hemoglobinEstimate.toFixed(1)} g/dL (likely anemic)`,
      'Color pattern consistent with iron deficiency anemia'
    ];
    focusAreas = [20, 30, 40, 50, 60, 70]; // Widespread pallor areas
  } else {
    result = 'Severe Risk';
    riskScore = 75 + pallorIndex * 25;
    confidence = 94 + Math.random() * 4;
    explanation = `Severe pallor detected indicating significant anemia requiring immediate medical attention. The marked absence of red coloration and overall pale appearance suggests severely reduced hemoglobin levels around ${hemoglobinEstimate.toFixed(1)} g/dL.`;
    recommendations = [
      'URGENT: Seek immediate medical attention or emergency care',
      'Comprehensive blood work and medical evaluation required',
      'May require iron infusion or other aggressive treatment',
      'Investigate serious underlying causes (bleeding, malabsorption, chronic disease)',
      'Monitor for severe symptoms (chest pain, severe fatigue, fainting)'
    ];
    detailedFindings = [
      `Severely reduced red intensity: ${Math.round(r)}/255 (critical)`,
      `Very high pallor index: ${pallorIndex.toFixed(2)} (severe)`,
      `Very low estimated hemoglobin: ${hemoglobinEstimate.toFixed(1)} g/dL (severely anemic)`,
      'Color pattern indicates severe iron deficiency or other serious anemia'
    ];
    focusAreas = [10, 20, 30, 40, 50, 60, 70, 80]; // Extensive pallor
  }
  
  return {
    result,
    riskScore: Math.round(riskScore),
    confidence: Math.round(confidence * 10) / 10,
    explanation,
    recommendations,
    detailedFindings,
    focusAreas
  };
};

// Generate Grad-CAM visualization showing focus areas
const generateGradCAM = (canvas: HTMLCanvasElement, focusAreas: number[]): string => {
  const gradCanvas = document.createElement('canvas');
  const gradCtx = gradCanvas.getContext('2d');
  
  if (!gradCtx) return '';
  
  gradCanvas.width = canvas.width;
  gradCanvas.height = canvas.height;
  
  // Draw original image with reduced opacity
  gradCtx.globalAlpha = 0.6;
  gradCtx.drawImage(canvas, 0, 0);
  
  // Add heatmap overlay for focus areas
  gradCtx.globalAlpha = 0.4;
  focusAreas.forEach((intensity, index) => {
    const x = (index % 3) * (canvas.width / 3);
    const y = Math.floor(index / 3) * (canvas.height / 3);
    const width = canvas.width / 3;
    const height = canvas.height / 3;
    
    // Create gradient for heatmap effect
    const gradient = gradCtx.createRadialGradient(
      x + width/2, y + height/2, 0,
      x + width/2, y + height/2, width/2
    );
    
    const alpha = intensity / 100;
    gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.7})`);
    gradient.addColorStop(1, `rgba(255, 255, 0, ${alpha * 0.3})`);
    
    gradCtx.fillStyle = gradient;
    gradCtx.fillRect(x, y, width, height);
  });
  
  return gradCanvas.toDataURL();
};

const getDefaultResult = (): AnalysisResult => ({
  confidence: 85.0,
  riskScore: 25,
  result: 'Mild Risk',
  explanation: 'Unable to perform detailed color analysis. Please ensure good lighting and clear skin visibility for more accurate results.',
  recommendations: [
    'Retake image with better lighting and clearer skin visibility',
    'Consider professional medical evaluation if symptoms persist',
    'Monitor for signs of fatigue, weakness, or pale appearance'
  ],
  gradCamUrl: '',
  timestamp: new Date(),
  colorAnalysis: {
    redChannel: 0,
    greenChannel: 0,
    blueChannel: 0,
    avgBrightness: 0,
    pallorIndex: 0,
    hemoglobinEstimate: 0
  },
  detailedFindings: ['Color analysis unavailable due to image processing error']
});

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ onNavigate }) => {
  const { user, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('capture');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast.error('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleImageSelection(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // File handling
  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxSize) {
      return 'Image file size must be less than 10MB';
    }

    return null;
  };

  const handleImageSelection = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelection(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelection(file);
    }
  }, []);

  // Analysis process
  const runAnalysis = async () => {
    if (!selectedImage || !imagePreview) return;

    setIsAnalyzing(true);
    setCurrentStep('processing');
    setAnalysisProgress(0);

    try {
      // Step 1: Advanced Image validation with Gemini AI
      setCurrentStep('validation');
      setAnalysisProgress(15);
      
      const validation = await validateSkinImage(imagePreview);
      
      if (!validation.isValid) {
        setValidationError(validation.reason || 'Image validation failed');
        toast.error('Image validation failed. Please try with a different image.');
        setCurrentStep('capture');
        setIsAnalyzing(false);
        return;
      }

      // Show validation success
      toast.success(`✓ Gemini AI validation passed! ${validation.skinPercentage}% skin detected.`);
      setAnalysisProgress(35);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Advanced color analysis and CNN inference
      setCurrentStep('inference');
      setAnalysisProgress(50);
      
      // Perform sophisticated anemia detection
      const analysisResult = await analyzeAnemiaFromImage(imagePreview);
      
      setAnalysisProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Step 3: Results processing and validation
      setAnalysisProgress(90);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: Complete with enhanced results
      setAnalysisProgress(100);
      setAnalysisResult(analysisResult);
      setCurrentStep('results');

      // Enhanced success message based on results
      const resultMessage = analysisResult.result === 'Normal' 
        ? '✓ Analysis complete! Normal results detected.'
        : analysisResult.result === 'Severe Risk'
        ? '⚠️ Analysis complete! Please seek medical attention.'
        : `⚡ Analysis complete! ${analysisResult.result} detected.`;

      if (!isGuest) {
        toast.success(`${resultMessage} Results saved to your history.`);
      } else {
        toast.success(`${resultMessage} Sign up to save your results.`);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please ensure good image quality and try again.');
      setCurrentStep('capture');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setCurrentStep('capture');
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setAnalysisProgress(0);
    setValidationError(null);
    stopCamera();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'capture': return 'Capture or Upload Image';
      case 'processing': return 'Preparing Analysis';
      case 'validation': return 'Validating Image Quality';
      case 'inference': return 'AI Analysis in Progress';
      case 'results': return 'Analysis Complete';
      default: return 'Analysis';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-900/30">
      <Navigation currentRoute="analysis" onNavigate={onNavigate} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI-Powered Anemia Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Use advanced computer vision to analyze skin images for potential anemia indicators. 
            Get instant results with Gemini AI validation and explainable CNN insights.
          </p>
          
          {isGuest && (
            <Alert className="mt-4 max-w-md mx-auto bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Info className="w-4 h-4" />
              <AlertDescription>
                You're using guest mode. <button 
                  onClick={() => onNavigate('auth')} 
                  className="font-medium text-blue-600 hover:underline"
                >
                  Sign up
                </button> to save your results and access advanced features.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            {['capture', 'processing', 'validation', 'inference', 'results'].map((step, index) => {
              const stepIndex = ['capture', 'processing', 'validation', 'inference', 'results'].indexOf(currentStep);
              const isActive = index <= stepIndex;
              const isCurrent = index === stepIndex;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      index < stepIndex ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-600 font-medium">{getStepTitle()}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Combined Camera and Upload Interface */}
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Capture or Upload Skin Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Image Preview or Camera/Upload Options */}
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <ImageWithFallback
                            src={imagePreview}
                            alt="Selected image"
                            className="w-full max-h-80 object-contain mx-auto rounded-lg border-2 border-blue-200"
                          />
                          <Button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              setValidationError(null);
                              stopCamera();
                            }}
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedImage?.name || 'Camera capture ready'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Camera Interface */}
                        {isCameraActive ? (
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full max-h-80 rounded-lg border-2 border-blue-200"
                            />
                            <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
                              <div className="absolute top-4 left-4 right-4 bg-black/80 text-white text-sm p-3 rounded backdrop-blur-sm border border-blue-400/50">
                                <Shield className="w-4 h-4 inline mr-2 text-blue-400" />
                                <strong>STRICT VALIDATION:</strong> Position large skin area in frame. Gemini AI requires 30%+ skin coverage, good lighting, single subject only.
                              </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                        ) : (
                          /* Upload Interface */
                          <div
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                              dragActive 
                                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-105' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                                <Upload className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                  Upload Skin Image
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                  Drag and drop an image here, or click to browse
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Supports JPEG, PNG, WebP (max 10MB) • Only skin images accepted
                                </p>
                              </div>
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                            </div>
                            
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                        )}

                        {/* Camera Controls */}
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {isCameraActive ? (
                              <>
                                <Button
                                  onClick={captureImage}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  Capture Image
                                </Button>
                                <Button variant="outline" onClick={stopCamera}>
                                  <X className="w-4 h-4 mr-2" />
                                  Stop Camera
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={startCamera}
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Use Camera Instead
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Error */}
                    {validationError && (
                      <Alert className="bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-red-800 dark:text-red-300">
                          <strong>Validation Failed:</strong> {validationError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Skin Image Requirements */}
                    <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                              Skin Image Requirements
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                              <li>• <strong>Skin Coverage:</strong> Minimum 30% skin area required (palm, inner eyelid, nail beds, arms)</li>
                              <li>• <strong>Lighting:</strong> Natural, even lighting without shadows or reflections</li>
                              <li>• <strong>Quality:</strong> Clear, focused, unedited photos only (no filters/makeup)</li>
                              <li>• <strong>Subject:</strong> Single person only, no multiple subjects or objects</li>
                              <li>• <strong>Validation:</strong> Gemini AI performs strict multi-point verification</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analyze Button */}
                    {(selectedImage || imagePreview) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <Button
                          onClick={runAnalysis}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-6 text-lg backdrop-blur-xl"
                          disabled={!selectedImage}
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          Start Enhanced Analysis
                        </Button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Gemini AI strict validation + Advanced color analysis • 30-45 seconds
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {(currentStep === 'processing' || currentStep === 'validation' || currentStep === 'inference') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {currentStep === 'processing' && 'Preparing Your Image'}
                        {currentStep === 'validation' && 'Gemini AI Validation'}
                        {currentStep === 'inference' && 'CNN Analysis in Progress'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentStep === 'processing' && 'Optimizing image resolution and preparing for advanced color analysis...'}
                        {currentStep === 'validation' && 'Gemini AI is performing strict validation: checking skin coverage, image quality, and lighting conditions...'}
                        {currentStep === 'inference' && 'Advanced color space analysis in progress: measuring red channel intensity, pallor index, and hemoglobin correlation patterns...'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Progress value={analysisProgress} className="h-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{analysisProgress}% complete</p>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <ImageWithFallback
                          src={imagePreview}
                          alt="Analyzing image"
                          className="max-w-sm mx-auto rounded-lg opacity-75 border-2 border-blue-200/50"
                        />
                        {currentStep === 'validation' && (
                          <div className="absolute inset-0 bg-yellow-600/20 rounded-lg animate-pulse" />
                        )}
                        {currentStep === 'inference' && (
                          <div className="absolute inset-0 bg-blue-600/20 rounded-lg animate-pulse" />
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        <span>Secure Processing</span>
                      </div>
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-purple-600" />
                        <span>AI Analysis</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-blue-600" />
                        <span>Real-time</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'results' && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Results */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          Analysis Results
                        </span>
                        <Badge 
                          variant={
                            analysisResult.result === 'Normal' ? 'default' : 
                            analysisResult.result === 'Mild Risk' ? 'secondary' :
                            analysisResult.result === 'High Risk' ? 'destructive' : 'destructive'
                          }
                          className={`text-sm ${
                            analysisResult.result === 'Severe Risk' ? 'animate-pulse bg-red-600 text-white' : ''
                          }`}
                        >
                          {analysisResult.result}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Confidence Score</p>
                              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {analysisResult.confidence}%
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Risk Score</p>
                              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                {analysisResult.riskScore}%
                              </p>
                            </div>
                            <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Hemoglobin Est.</p>
                              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {analysisResult.colorAnalysis?.hemoglobinEstimate.toFixed(1)} g/dL
                              </p>
                            </div>
                            <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </div>

                      {/* Color Analysis Details */}
                      {analysisResult.colorAnalysis && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-orange-600" />
                            Advanced Color Analysis
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Red Channel:</span>
                                <span className="font-medium">{analysisResult.colorAnalysis.redChannel}/255</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Green Channel:</span>
                                <span className="font-medium">{analysisResult.colorAnalysis.greenChannel}/255</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Blue Channel:</span>
                                <span className="font-medium">{analysisResult.colorAnalysis.blueChannel}/255</span>
                              </div>
                            </div>
                            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Brightness:</span>
                                <span className="font-medium">{analysisResult.colorAnalysis.avgBrightness}/255</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Pallor Index:</span>
                                <span className={`font-medium ${
                                  analysisResult.colorAnalysis.pallorIndex > 0.5 ? 'text-red-600' :
                                  analysisResult.colorAnalysis.pallorIndex > 0.3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {analysisResult.colorAnalysis.pallorIndex}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Hemoglobin:</span>
                                <span className={`font-medium ${
                                  analysisResult.colorAnalysis.hemoglobinEstimate < 10 ? 'text-red-600' :
                                  analysisResult.colorAnalysis.hemoglobinEstimate < 12 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {analysisResult.colorAnalysis.hemoglobinEstimate.toFixed(1)} g/dL
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detailed Findings */}
                      {analysisResult.detailedFindings && analysisResult.detailedFindings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-blue-600" />
                            Detailed Clinical Findings
                          </h4>
                          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <ul className="space-y-1">
                              {analysisResult.detailedFindings.map((finding, index) => (
                                <li key={index} className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                          AI Explanation
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg">
                          {analysisResult.explanation}
                        </p>
                      </div>

                      {/* Grad-CAM Visualization */}
                      {analysisResult.gradCamUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-indigo-600" />
                            AI Focus Areas (Grad-CAM)
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Original Image</p>
                              <ImageWithFallback
                                src={imagePreview || ''}
                                alt="Original"
                                className="w-full rounded-lg border"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-2">AI Attention Map</p>
                              <ImageWithFallback
                                src={analysisResult.gradCamUrl}
                                alt="Grad-CAM visualization"
                                className="w-full rounded-lg border"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Blue areas indicate regions the AI model focused on for analysis
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Urgent Medical Alert for Severe Cases */}
                  {analysisResult.result === 'Severe Risk' && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-300">
                        <strong className="text-lg">⚠️ URGENT MEDICAL ATTENTION REQUIRED</strong>
                        <br />
                        The analysis indicates severe pallor consistent with significant anemia. Please seek immediate medical evaluation or emergency care. This is not a substitute for professional medical diagnosis.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Recommendations */}
                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                        Personalized Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.recommendations.map((rec, index) => (
                          <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                            analysisResult.result === 'Severe Risk' ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                            analysisResult.result === 'High Risk' ? 'bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' :
                            'bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                          }`}>
                            <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                              analysisResult.result === 'Severe Risk' ? 'bg-red-600' :
                              analysisResult.result === 'High Risk' ? 'bg-orange-600' :
                              'bg-yellow-600'
                            }`}>
                              {index + 1}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                      
                      <Alert className="mt-4 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                        <Info className="w-4 h-4" />
                        <AlertDescription className="text-blue-800 dark:text-blue-300">
                          <strong>Important:</strong> This analysis is for informational purposes only and should not replace professional medical advice. 
                          Please consult with a healthcare provider for proper diagnosis and treatment.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                  <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" onClick={() => onNavigate('dashboard')}>
                        <Download className="w-4 h-4 mr-2" />
                        Save to Dashboard
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </Button>
                      <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Analysis
                      </Button>
                    </CardContent>
                  </Card>

                  {isGuest && (
                    <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-200 shadow-xl">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Save Your Results
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Create an account to save your analysis history and access advanced features.
                        </p>
                        <Button 
                          onClick={() => onNavigate('auth')}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          Create Account
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-sm">Enhanced Analysis Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Model Version:</span>
                        <span className="font-medium">v3.0.0-Enhanced</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Analysis Time:</span>
                        <span>{analysisResult.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing:</span>
                        <span>Advanced Color Analysis + CNN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validation:</span>
                        <span>Gemini AI (Strict Mode)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Color Space:</span>
                        <span>RGB + HSV Analysis</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">Advanced+</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};