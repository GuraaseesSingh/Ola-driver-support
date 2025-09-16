import { type User, type InsertUser, type VoiceSession, type InsertVoiceSession, type ConversationMessage, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Voice session management
  createVoiceSession(session: InsertVoiceSession): Promise<VoiceSession>;
  getVoiceSession(id: string): Promise<VoiceSession | undefined>;
  endVoiceSession(id: string): Promise<void>;
  
  // Message management
  createMessage(message: InsertMessage): Promise<ConversationMessage>;
  getSessionMessages(sessionId: string): Promise<ConversationMessage[]>;
  getMessage(id: string): Promise<ConversationMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private voiceSessions: Map<string, VoiceSession>;
  private messages: Map<string, ConversationMessage>;

  constructor() {
    this.users = new Map();
    this.voiceSessions = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createVoiceSession(insertSession: InsertVoiceSession): Promise<VoiceSession> {
    const id = randomUUID();
    const now = new Date();
    const session: VoiceSession = {
      ...insertSession,
      id,
      status: "active",
      userId: insertSession.userId ?? null,
      scenario: insertSession.scenario ?? "driver_support",
      language: insertSession.language ?? "hindi",
      startedAt: now,
      endedAt: null,
      conversationHistory: [],
      metadata: insertSession.metadata ?? {}
    };
    this.voiceSessions.set(id, session);
    return session;
  }

  async getVoiceSession(id: string): Promise<VoiceSession | undefined> {
    return this.voiceSessions.get(id);
  }

  async endVoiceSession(id: string): Promise<void> {
    const session = this.voiceSessions.get(id);
    if (session) {
      const updatedSession: VoiceSession = {
        ...session,
        status: "ended",
        endedAt: new Date()
      };
      this.voiceSessions.set(id, updatedSession);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<ConversationMessage> {
    const id = randomUUID();
    const now = new Date();
    const message: ConversationMessage = {
      ...insertMessage,
      id,
      timestamp: now,
      contentHindi: insertMessage.contentHindi || null,
      audioUrl: insertMessage.audioUrl || null,
      processingTime: insertMessage.processingTime || null,
      metadata: insertMessage.metadata || {}
    };
    this.messages.set(id, message);
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMessage(id: string): Promise<ConversationMessage | undefined> {
    return this.messages.get(id);
  }
}

export const storage = new MemStorage();
