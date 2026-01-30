import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RefreshCw, AlertCircle, MapPin, Clock, Shield } from 'lucide-react';

/**
 * PhotoValidationModal - Modal para validação de presença na academia
 * Usa a câmera do dispositivo para tirar foto
 * Exceção: conta MARIA (demo) não precisa de validação
 */
export const PhotoValidationModal = ({ 
  isOpen, 
  onClose, 
  onValidated, 
  isDemoAccount = false,
  loading = false 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !isDemoAccount) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, isDemoAccount]);

  // Update timestamp every second when camera is active
  useEffect(() => {
    if (isOpen && !photo) {
      const interval = setInterval(() => {
        setTimestamp(new Date().toLocaleString('pt-BR'));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, photo]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Front camera for selfie
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Permissão de câmera negada. Habilite nas configurações do navegador.'
          : 'Não foi possível acessar a câmera. Verifique se está disponível.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Add timestamp overlay
    const now = new Date();
    const timestampText = now.toLocaleString('pt-BR');
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, canvas.height - 40, canvas.width, 40);
    context.fillStyle = '#ffffff';
    context.font = '16px Arial';
    context.fillText(`📍 Check-in: ${timestampText}`, 10, canvas.height - 15);

    // Get photo as base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(photoData);
    setTimestamp(timestampText);
    
    // Stop camera to save resources
    stopCamera();
  }, [stream]);

  const retakePhoto = () => {
    setPhoto(null);
    setValidationResult(null);
    startCamera();
  };

  const validatePhoto = async () => {
    setValidating(true);
    setValidationResult(null);

    try {
      // Simulate AI validation (in production, send to backend with AI service)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation result - in production this would use OpenAI Vision or similar
      const isValid = true; // Always pass for now
      
      setValidationResult({
        valid: isValid,
        message: isValid 
          ? 'Presença validada! Você está na academia.' 
          : 'Não foi possível validar. Tire outra foto mostrando o ambiente da academia.'
      });

      if (isValid) {
        setTimeout(() => {
          onValidated({
            photo,
            timestamp,
            validated: true
          });
        }, 1000);
      }
    } catch (err) {
      setValidationResult({
        valid: false,
        message: 'Erro ao validar foto. Tente novamente.'
      });
    } finally {
      setValidating(false);
    }
  };

  // Demo account bypass
  const handleDemoBypass = () => {
    onValidated({
      photo: null,
      timestamp: new Date().toLocaleString('pt-BR'),
      validated: true,
      isDemoBypass: true
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="photo-validation-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          key="photo-validation-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden border border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Validar Presença</h2>
                <p className="text-xs text-slate-400">Tire uma foto para confirmar check-in</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Demo Account Bypass */}
            {isDemoAccount ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conta Demo</h3>
                <p className="text-slate-400 mb-6">
                  Conta MARIA não precisa de validação por foto.
                  Clique abaixo para iniciar o treino diretamente.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDemoBypass}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                >
                  Iniciar Treino
                </motion.button>
              </div>
            ) : (
              <>
                {/* Camera View or Photo Preview */}
                <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden mb-4">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                      <p className="text-red-400 text-sm">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="mt-4 px-4 py-2 bg-slate-700 rounded-lg text-white text-sm hover:bg-slate-600 transition-colors"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : photo ? (
                    <>
                      <img 
                        src={photo} 
                        alt="Foto capturada" 
                        className="w-full h-full object-cover"
                      />
                      {validationResult && (
                        <div className={`absolute inset-0 flex items-center justify-center ${
                          validationResult.valid ? 'bg-green-500/30' : 'bg-red-500/30'
                        }`}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${
                              validationResult.valid ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {validationResult.valid ? (
                              <Check className="w-10 h-10 text-white" />
                            ) : (
                              <X className="w-10 h-10 text-white" />
                            )}
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Timestamp overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{timestamp || 'Carregando...'}</span>
                        </div>
                      </div>
                      {/* Frame guide */}
                      <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none" />
                    </>
                  )}
                </div>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Validation Message */}
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl mb-4 flex items-center gap-2 ${
                      validationResult.valid 
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {validationResult.valid ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{validationResult.message}</span>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {!photo ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={takePhoto}
                      disabled={!stream || cameraError}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Tirar Foto
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={retakePhoto}
                        disabled={validating || validationResult?.valid}
                        className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Nova Foto
                      </motion.button>
                      {!validationResult?.valid && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={validatePhoto}
                          disabled={validating}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {validating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Validando...
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              Validar
                            </>
                          )}
                        </motion.button>
                      )}
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-4 p-3 bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-400 text-center">
                    📸 Tire uma foto mostrando você no ambiente da academia.
                    A validação garante que seu streak e progresso sejam contabilizados.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoValidationModal;
