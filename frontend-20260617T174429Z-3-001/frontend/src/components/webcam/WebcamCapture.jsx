import React, { useEffect } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Camera, CameraOff } from 'lucide-react';

export const WebcamCapture = ({ onVideoReady, className = '' }) => {
  const { videoRef, isActive, error, startWebcam, stopWebcam } = useWebcam();

  useEffect(() => {
    if (isActive && videoRef.current) {
      onVideoReady(videoRef.current);
    }
  }, [isActive, onVideoReady]);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Emotion Detection</h3>
          <Button
            onClick={isActive ? stopWebcam : startWebcam}
            variant={isActive ? 'destructive' : 'default'}
            size="sm"
          >
            {isActive ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Camera className="w-16 h-16" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}
      </div>
    </Card>
  );
};