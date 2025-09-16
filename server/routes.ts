import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { liveKitManager } from "./services/livekit-manager";
import { groqService } from "./services/groq-service.js";
import { insertVoiceSessionSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);
        
        // Handle different message types
        switch (message.type) {
          case 'audio-data':
            // Handle real-time audio data
            // This would be processed for STT
            break;
          case 'transcript':
            // Handle transcript data
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // LiveKit token generation
  app.post("/api/livekit/token", async (req, res) => {
    try {
      const { roomName } = req.body;
      
      if (!roomName) {
        return res.status(400).json({ error: "Room name is required" });
      }

      const token = await liveKitManager.generateToken(roomName);
      res.json({ token });
    } catch (error) {
      console.error("Failed to generate LiveKit token:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // Voice session management
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertVoiceSessionSchema.parse(req.body);
      const roomName = `ola-support-${Date.now()}`;
      
      const session = await storage.createVoiceSession({
        ...validatedData,
        roomName
      });

      res.json({ 
        sessionId: session.id,
        roomName: session.roomName
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to create session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.patch("/api/sessions/:id/end", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.endVoiceSession(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to end session:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Message handling
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to create message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getSessionMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Failed to get messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Groq Cloud API integration
  app.post("/api/groq/chat", async (req, res) => {
    try {
      const { messages, temperature = 0.7, maxTokens = 200 } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const response = await groqService.chatCompletion({
        messages,
        temperature,
        max_tokens: maxTokens
      });

      res.json({ message: response });
    } catch (error) {
      console.error("Groq API error:", error);
      res.status(500).json({ error: "Failed to process chat completion" });
    }
  });

  app.get("/api/groq/health", async (req, res) => {
    try {
      const isHealthy = await groqService.healthCheck();
      res.json({ healthy: isHealthy });
    } catch (error) {
      res.status(500).json({ healthy: false });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        livekit: true,
        groq: true,
        websocket: true
      }
    });
  });

  return httpServer;
}
