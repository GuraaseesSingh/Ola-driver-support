import { Mic, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicalStatus {
  groqStatus: string;
  sttStatus: string;
  ttsStatus: string;
  latency: string;
}

interface VoiceControlPanelProps {
  isConnected: boolean;
  isRecording: boolean;
  voiceStatus: string;
  statusMessage: string;
  technicalStatus: TechnicalStatus;
  onToggleRecording: () => void;
  onEndCall: () => void;
  onRestart: () => void;
}

export default function VoiceControlPanel({
  isConnected,
  isRecording,
  voiceStatus,
  statusMessage,
  technicalStatus,
  onToggleRecording,
  onEndCall,
  onRestart
}: VoiceControlPanelProps) {
  return (
    <>
      <div className="bg-card rounded-xl shadow-lg border border-border p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Voice Control</h2>
          <p className="text-sm text-muted-foreground">Click to start conversation</p>
        </div>
        
        {/* Microphone Button */}
        <div className="flex justify-center">
          <button 
            data-testid="button-microphone"
            onClick={onToggleRecording}
            disabled={!isConnected}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
              isRecording 
                ? 'bg-destructive hover:bg-destructive/90 focus:ring-destructive/20' 
                : 'bg-primary hover:bg-primary/90 focus:ring-primary/20'
            } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mic className="text-primary-foreground" size={24} />
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute -inset-2 border-4 border-primary/30 rounded-full">
                <div className="absolute -inset-1 border-2 border-primary rounded-full animate-ping"></div>
              </div>
            )}
          </button>
        </div>
        
        {/* Audio Visualization */}
        <div className="flex justify-center items-end space-x-1 h-8" data-testid="audio-visualization">
          {[8, 16, 12, 20, 14, 18, 10].map((height, index) => (
            <div 
              key={index}
              className={`audio-wave ${isRecording ? '' : 'opacity-30'}`}
              style={{ 
                height: `${height}px`,
                animationPlayState: isRecording ? 'running' : 'paused'
              }}
            ></div>
          ))}
        </div>
        
        {/* Status */}
        <div className="text-center">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium text-foreground" data-testid="text-voice-status">{voiceStatus}</p>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-status-message">{statusMessage}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-3">
          <Button 
            variant="destructive"
            className="w-full"
            onClick={onEndCall}
            data-testid="button-end-call"
          >
            <Phone className="mr-2" size={16} />
            End Call
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full"
            onClick={onRestart}
            data-testid="button-restart"
          >
            <RotateCcw className="mr-2" size={16} />
            Restart
          </Button>
        </div>
      </div>
      
      {/* Technical Status Panel */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Technical Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Groq API</span>
            <span className="text-sm font-medium text-success" data-testid="status-groq">{technicalStatus.groqStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">STT Hindi</span>
            <span className="text-sm font-medium text-success" data-testid="status-stt">{technicalStatus.sttStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">TTS Hindi</span>
            <span className="text-sm font-medium text-success" data-testid="status-tts">{technicalStatus.ttsStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Audio Latency</span>
            <span className="text-sm font-medium text-foreground" data-testid="status-latency">{technicalStatus.latency}</span>
          </div>
        </div>
      </div>
    </>
  );
}
