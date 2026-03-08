'use client'

import React, { useState, useRef, useEffect } from 'react';

// Inline SVG Icons to avoid dependency
const PlayIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const VolumeIcon = ({ size = 20, muted = false }: { size?: number; muted?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {muted ? (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </>
    )}
  </svg>
);

const MaximizeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
  </svg>
);

interface MatchTrailerProps {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  autoPlay?: boolean;
}

export default function MatchTrailer({ 
  matchId, 
  homeTeam, 
  awayTeam, 
  autoPlay = false 
}: MatchTrailerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTrailer();
  }, [matchId]);

  const loadTrailer = async () => {
    setLoading(true);
    setError(null);
    try {
      // Appeler l'API pour générer/récupérer la vidéo
      const response = await fetch(`/api/videos/trailer/${matchId}`);
      const data = await response.json();
      
      if (data.url) {
        setVideoUrl(data.url);
      } else {
        setError('Vidéo non disponible');
      }
    } catch (err) {
      console.error('Erreur chargement vidéo:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">{error || 'Vidéo non disponible'}</p>
          <button 
            onClick={loadTrailer}
            className="text-green-500 hover:text-green-400 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden bg-black group"
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
      />

      {/* Overlay gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

      {/* Titre du match */}
      <div className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-lg font-bold text-white">{homeTeam} vs {awayTeam}</h3>
        <p className="text-sm text-gray-300">Bande-annonce du match</p>
      </div>

      {/* Contrôles */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Barre de progression */}
        <div 
          className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer group/progress"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-green-500 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Boutons de contrôle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-green-500 transition"
            >
              {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-green-500 transition"
            >
              <VolumeIcon size={20} muted={muted} />
            </button>

            <span className="text-white text-sm">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={handleFullscreen}
            className="text-white hover:text-green-500 transition"
          >
            <MaximizeIcon size={20} />
          </button>
        </div>
      </div>

      {/* Badge "Nouveau" */}
      <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
        VIDÉO IA
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

