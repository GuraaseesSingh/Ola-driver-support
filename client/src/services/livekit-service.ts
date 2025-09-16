import { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';

export interface LiveKitConfig {
  url: string;
  token: string;
}

export class LiveKitService {
  private room: Room | null = null;
  private isConnected = false;
  private onAudioReceived?: (audioData: ArrayBuffer) => void;
  private onConnectionStatusChanged?: (connected: boolean) => void;

  constructor() {
    this.room = new Room();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('LiveKit: Connected to room');
      this.isConnected = true;
      this.onConnectionStatusChanged?.(true);
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('LiveKit: Disconnected from room');
      this.isConnected = false;
      this.onConnectionStatusChanged?.(false);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('LiveKit: Audio track subscribed');
        // Handle incoming audio track for bot responses
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      track.detach();
    });
  }

  async connect(config: LiveKitConfig): Promise<void> {
    if (!this.room) {
      throw new Error('Room not initialized');
    }

    // Check if LiveKit URL is properly configured
    if (!config.url || config.url.includes('undefined') || !config.token) {
      throw new Error('LiveKit configuration is incomplete or invalid');
    }

    try {
      await this.room.connect(config.url, config.token);
    } catch (error) {
      console.error('LiveKit: Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
    }
  }

  async startAudioTransmission(): Promise<void> {
    if (!this.room || !this.isConnected) {
      throw new Error('Not connected to room');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      await this.room.localParticipant.publishTrack(stream.getAudioTracks()[0]);
      console.log('LiveKit: Audio transmission started');
    } catch (error) {
      console.error('LiveKit: Failed to start audio transmission:', error);
      throw error;
    }
  }

  async stopAudioTransmission(): Promise<void> {
    const room = this.room;
    if (!room) return;

    const publications = room.localParticipant.audioTrackPublications;
    const publicationsArray = Array.from(publications.values());
    for (const publication of publicationsArray) {
      if (publication.track) {
        await room.localParticipant.unpublishTrack(publication.track);
      }
    }
    console.log('LiveKit: Audio transmission stopped');
  }

  setOnAudioReceived(callback: (audioData: ArrayBuffer) => void) {
    this.onAudioReceived = callback;
  }

  setOnConnectionStatusChanged(callback: (connected: boolean) => void) {
    this.onConnectionStatusChanged = callback;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async getRoomToken(roomName: string): Promise<string> {
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      return data.token;
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
      throw error;
    }
  }
}

export const liveKitService = new LiveKitService();
