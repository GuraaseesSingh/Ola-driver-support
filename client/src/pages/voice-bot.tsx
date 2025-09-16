import { useEffect } from "react";
import { Car, Clock, Download, Trash2, Info } from "lucide-react";
import VoiceControlPanel from "@/components/voice-control-panel";
import ConversationDisplay from "@/components/conversation-display";
import ScenarioInfo from "@/components/scenario-info";
import { useVoiceBot } from "@/hooks/use-voice-bot";

export default function VoiceBot() {
  const {
    isConnected,
    connectionStatus,
    sessionDuration,
    messages,
    voiceStatus,
    statusMessage,
    isRecording,
    technicalStatus,
    toggleRecording,
    endCall,
    restartConversation,
    downloadTranscript,
    clearConversation
  } = useVoiceBot();

  useEffect(() => {
    document.title = "Ola Driver Support - Voice Bot";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Ola Driver Support</h1>
                <p className="text-sm text-muted-foreground">Voice Assistant</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-success animate-pulse' : 'bg-warning'
                }`}></div>
                <span data-testid="connection-status">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Control Panel */}
          <div className="lg:col-span-1">
            <VoiceControlPanel
              isConnected={isConnected}
              isRecording={isRecording}
              voiceStatus={voiceStatus}
              statusMessage={statusMessage}
              technicalStatus={technicalStatus}
              onToggleRecording={toggleRecording}
              onEndCall={endCall}
              onRestart={restartConversation}
            />
          </div>

          {/* Conversation Display */}
          <div className="lg:col-span-2">
            <ConversationDisplay
              messages={messages}
              sessionDuration={sessionDuration}
              isRecording={isRecording}
              onDownloadTranscript={downloadTranscript}
              onClearConversation={clearConversation}
            />
          </div>
        </div>
        
        {/* Scenario Information Panel */}
        <div className="mt-8">
          <ScenarioInfo />
        </div>
      </main>
    </div>
  );
}
