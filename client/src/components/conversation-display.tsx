import { Clock, Download, Trash2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  speaker: 'user' | 'bot';
  content: string;
  contentHindi?: string;
  timestamp: Date;
  isProcessing?: boolean;
}

interface ConversationDisplayProps {
  messages: Message[];
  sessionDuration: string;
  isRecording: boolean;
  onDownloadTranscript: () => void;
  onClearConversation: () => void;
}

export default function ConversationDisplay({
  messages,
  sessionDuration,
  isRecording,
  onDownloadTranscript,
  onClearConversation
}: ConversationDisplayProps) {
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border">
      {/* Conversation Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Conversation</h2>
            <p className="text-sm text-muted-foreground">Ola Driver Support Session</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span data-testid="text-session-duration">{sessionDuration}</span>
          </div>
        </div>
      </div>
      
      {/* Conversation Messages */}
      <div className="conversation-container p-6 space-y-4" data-testid="conversation-messages">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Start conversation by clicking the microphone</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.speaker === 'user' 
                  ? 'bg-accent' 
                  : 'bg-primary'
              }`}>
                {message.speaker === 'user' ? (
                  <User className="text-accent-foreground" size={16} />
                ) : (
                  <Bot className="text-primary-foreground" size={16} />
                )}
              </div>
              <div className="flex-1">
                <div className={`rounded-lg p-3 max-w-md ${
                  message.speaker === 'user' 
                    ? 'bg-accent' 
                    : 'bg-primary/10 border border-primary/20'
                }`}>
                  <p className={`font-hindi ${
                    message.speaker === 'user' ? 'text-accent-foreground' : 'text-foreground'
                  }`} data-testid={`message-content-${message.id}`}>
                    {message.contentHindi || message.content}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {message.speaker === 'user' ? 'Driver' : 'Support Bot'} • {formatTime(message.timestamp)}
                  </p>
                  {message.speaker === 'bot' && message.isProcessing && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                      <span className="text-xs text-success">Speaking</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing/Listening Indicator */}
        {isRecording && (
          <div className="flex items-start space-x-3" data-testid="listening-indicator">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <Mic className="text-muted-foreground animate-pulse" size={16} />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3 max-w-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Listening...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Conversation Footer */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Active Session</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-hindi">हिंदी</span>
              <span>Hindi</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadTranscript}
              data-testid="button-download-transcript"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              onClick={onClearConversation}
              data-testid="button-clear-conversation"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mic({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" 
        fill="currentColor"
      />
      <path 
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
