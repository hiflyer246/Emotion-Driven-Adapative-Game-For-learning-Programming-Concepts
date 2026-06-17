import { useState, useEffect, useRef } from 'react';

export const useWebcam = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to access webcam. Please grant permission.');
      console.error('Webcam error:', err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startWebcam,
    stopWebcam,
  };
};