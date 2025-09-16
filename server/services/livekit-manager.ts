import { AccessToken } from 'livekit-server-sdk';

export class LiveKitManager {
  private apiKey: string;
  private apiSecret: string;
  private serverUrl: string;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    this.serverUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';
  }

  async generateToken(roomName: string, participantName: string = 'driver'): Promise<string> {
    try {
      const token = new AccessToken(this.apiKey, this.apiSecret, {
        identity: participantName,
        name: participantName,
      });

      // Grant permissions for the participant
      token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      return await token.toJwt();
    } catch (error) {
      console.error('Failed to generate LiveKit token:', error);
      throw new Error('Token generation failed');
    }
  }

  async createRoom(roomName: string): Promise<void> {
    try {
      // In a production setup, you might want to create the room
      // through LiveKit's Room Service API
      console.log(`Room ${roomName} will be created on first participant join`);
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  validateConfiguration(): boolean {
    return !!(this.apiKey && this.apiSecret && this.serverUrl);
  }
}

export const liveKitManager = new LiveKitManager();
