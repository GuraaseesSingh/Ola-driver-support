import { useState, useEffect, useCallback, useRef } from 'react';
import { liveKitService } from '@/services/livekit-service';
import { groqService } from '@/services/groq-service';
import { speechService } from '@/services/speech-service';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  speaker: 'user' | 'bot';
  content: string;
  contentHindi?: string;
  timestamp: Date;
  isProcessing?: boolean;
}

interface TechnicalStatus {
  groqStatus: string;
  sttStatus: string;
  ttsStatus: string;
  latency: string;
}

export function useVoiceBot() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState('00:00');
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceStatus, setVoiceStatus] = useState('Ready to listen');
  const [statusMessage, setStatusMessage] = useState('Press microphone to start');
  const [isRecording, setIsRecording] = useState(false);
  const [technicalStatus, setTechnicalStatus] = useState<TechnicalStatus>({
    groqStatus: 'Connecting...',
    sttStatus: 'Checking...',
    ttsStatus: 'Checking...',
    latency: '~0ms'
  });

  const { toast } = useToast();
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionId = useRef<string | null>(null);

  // Initialize services
  useEffect(() => {
    initializeServices();
    return () => {
      cleanup();
    };
  }, []);

  // Session timer
  useEffect(() => {
    if (sessionStartTime) {
      sessionIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [sessionStartTime]);

  const initializeServices = async () => {
    try {
      // Check technical status
      await checkTechnicalStatus();

      // Initialize LiveKit connection
      await initializeLiveKit();

      // Setup speech service
      if (speechService.isSupported()) {
        speechService.setOnResult(handleSpeechResult);
        speechService.setOnError(handleSpeechError);
        setTechnicalStatus(prev => ({
          ...prev,
          sttStatus: 'Ready',
          ttsStatus: 'Ready'
        }));
      } else {
        setTechnicalStatus(prev => ({
          ...prev,
          sttStatus: 'Not supported',
          ttsStatus: 'Not supported'
        }));
      }

      setSessionStartTime(new Date());
      setVoiceStatus('Ready to listen');
      setStatusMessage('Press microphone to start');

    } catch (error) {
      console.error('Failed to initialize services:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initialize voice services. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const initializeLiveKit = async () => {
    try {
      // Create a new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: null,
          roomName: `ola-support-${Date.now()}`,
          scenario: 'driver_support',
          language: 'hindi'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      currentSessionId.current = sessionData.sessionId;

      // Check if LiveKit is configured before attempting connection
      const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;
      
      if (liveKitUrl && liveKitUrl !== 'undefined') {
        // Try to connect to LiveKit only if properly configured
        try {
          const token = await liveKitService.getRoomToken(sessionData.roomName);
          await liveKitService.connect({
            url: liveKitUrl,
            token
          });

          liveKitService.setOnConnectionStatusChanged((connected) => {
            setIsConnected(connected);
            setConnectionStatus(connected ? 'LiveKit Connected' : 'Disconnected');
          });
          
          console.log('LiveKit connected successfully');
        } catch (liveKitError) {
          console.warn('LiveKit connection failed, using Web Speech API only:', liveKitError);
          // Continue without LiveKit - use direct speech API
          setIsConnected(true);
          setConnectionStatus('Web Speech API Ready');
        }
      } else {
        console.log('LiveKit not configured, using Web Speech API only');
        // Skip LiveKit entirely and use Web Speech API
        setIsConnected(true);
        setConnectionStatus('Web Speech API Ready');
      }

    } catch (error) {
      console.error('Session initialization failed:', error);
      throw error;
    }
  };

  const checkTechnicalStatus = async () => {
    try {
      const groqConnected = await groqService.checkConnection();
      setTechnicalStatus(prev => ({
        ...prev,
        groqStatus: groqConnected ? 'Connected' : 'Error'
      }));
    } catch (error) {
      setTechnicalStatus(prev => ({
        ...prev,
        groqStatus: 'Error'
      }));
    }
  };

  const handleSpeechResult = useCallback(async (text: string, isFinal: boolean) => {
    if (isFinal && text.trim()) {
      setIsRecording(false);
      setVoiceStatus('Processing...');
      setStatusMessage('Analyzing speech');

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        speaker: 'user',
        content: text,
        contentHindi: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        // Send to Groq for processing
        const startTime = Date.now();
        const groqResponse = await groqService.sendMessage(text);
        const latency = Date.now() - startTime;

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          speaker: 'bot',
          content: groqResponse.message,
          contentHindi: groqResponse.message,
          timestamp: new Date(),
          isProcessing: true
        };

        setMessages(prev => [...prev, botMessage]);

        // Save message to backend
        if (currentSessionId.current) {
          await saveMessage(currentSessionId.current, userMessage);
          await saveMessage(currentSessionId.current, botMessage);
        }

        // Speak the response
        await speechService.speak(groqResponse.message, 'hi-IN');

        // Update bot message to not processing
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessage.id 
              ? { ...msg, isProcessing: false }
              : msg
          )
        );

        setTechnicalStatus(prev => ({
          ...prev,
          latency: `~${latency}ms`
        }));

        setVoiceStatus('Ready to listen');
        setStatusMessage('Press microphone to continue');

      } catch (error) {
        console.error('Error processing speech:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "Processing Error",
          description: `Failed to process your speech: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        
        setVoiceStatus('Error');
        setStatusMessage('Processing failed');
      }
    }
  }, [toast]);

  const handleSpeechError = useCallback((error: string) => {
    console.error('Speech recognition error:', error);
    setIsRecording(false);
    setVoiceStatus('Error');
    setStatusMessage('Speech recognition failed');
    
    toast({
      title: "Speech Error",
      description: `Speech recognition failed: ${error}`,
      variant: "destructive",
    });
  }, [toast]);

  const saveMessage = async (sessionId: string, message: Message) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          speaker: message.speaker,
          content: message.content,
          contentHindi: message.contentHindi,
        }),
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const toggleRecording = useCallback(async () => {
    if (!isConnected) return;

    try {
      if (isRecording) {
        speechService.stopListening();
        // Try LiveKit if available, but don't fail if not
        try {
          await liveKitService.stopAudioTransmission();
        } catch (e) {
          console.log('LiveKit not available for audio stop');
        }
        setIsRecording(false);
        setVoiceStatus('Ready to listen');
        setStatusMessage('Press microphone to start');
      } else {
        // Try LiveKit if available, but don't fail if not
        try {
          await liveKitService.startAudioTransmission();
        } catch (e) {
          console.log('LiveKit not available for audio start, using Web Speech API only');
        }
        await speechService.startListening();
        setIsRecording(true);
        setVoiceStatus('Recording...');
        setStatusMessage('Listening to your voice');
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start/stop recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [isConnected, isRecording, toast]);

  const endCall = useCallback(async () => {
    try {
      speechService.stopListening();
      speechService.stopSpeaking();
      await liveKitService.stopAudioTransmission();
      await liveKitService.disconnect();

      if (currentSessionId.current) {
        await fetch(`/api/sessions/${currentSessionId.current}/end`, {
          method: 'PATCH',
        });
      }

      setIsRecording(false);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      setVoiceStatus('Call ended');
      setStatusMessage('Session terminated');

      toast({
        title: "Call Ended",
        description: "Voice session has been terminated.",
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }, [toast]);

  const restartConversation = useCallback(async () => {
    try {
      setMessages([]);
      groqService.resetConversation();
      setVoiceStatus('Ready to listen');
      setStatusMessage('Press microphone to start');
      
      toast({
        title: "Conversation Restarted",
        description: "Ready for a new conversation.",
      });
    } catch (error) {
      console.error('Failed to restart conversation:', error);
    }
  }, [toast]);

  const downloadTranscript = useCallback(() => {
    try {
      const transcript = messages.map(msg => 
        `[${msg.timestamp.toLocaleTimeString()}] ${msg.speaker === 'user' ? 'Driver' : 'Support Bot'}: ${msg.contentHindi || msg.content}`
      ).join('\n');

      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ola-support-transcript-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Transcript Downloaded",
        description: "Conversation transcript has been saved.",
      });
    } catch (error) {
      console.error('Failed to download transcript:', error);
      toast({
        title: "Download Error",
        description: "Failed to download transcript.",
        variant: "destructive",
      });
    }
  }, [messages, toast]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    toast({
      title: "Conversation Cleared",
      description: "All messages have been removed.",
    });
  }, [toast]);

  const cleanup = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    liveKitService.disconnect();
    
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }
  };

  return {
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
  };
}
