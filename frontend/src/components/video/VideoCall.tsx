import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

interface VideoCallProps {
  sessionId: string;
  isVideoOn: boolean;
  isMicOn: boolean;
}

export default function VideoCall({ sessionId, isVideoOn, isMicOn }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isVideoOn || isMicOn) {
      startLocalStream();
    } else {
      stopLocalStream();
    }

    return () => {
      stopLocalStream();
    };
  }, [isVideoOn, isMicOn]);

  // ✅ Now sessionId is actually used (for debugging / future WebRTC signaling)
  useEffect(() => {
    console.log('Connected to session:', sessionId);
  }, [sessionId]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isMicOn,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4">
      {/* Local Video */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        {isVideoOn ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Camera Off</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          You
        </div>
      </div>

      {/* Remote Video */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">Waiting for peer...</p>
          </div>
        </div>
      </div>
    </div>
  );
}