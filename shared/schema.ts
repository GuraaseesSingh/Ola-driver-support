import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const voiceSessions = pgTable("voice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  roomName: text("room_name").notNull().unique(),
  status: text("status").notNull().default("active"), // active, ended
  scenario: text("scenario").notNull().default("driver_support"),
  language: text("language").notNull().default("hindi"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  conversationHistory: jsonb("conversation_history").default([]),
  metadata: jsonb("metadata").default({}),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => voiceSessions.id),
  speaker: text("speaker").notNull(), // user, bot
  content: text("content").notNull(),
  contentHindi: text("content_hindi"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  audioUrl: text("audio_url"),
  processingTime: text("processing_time"),
  metadata: jsonb("metadata").default({}),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVoiceSessionSchema = createInsertSchema(voiceSessions).pick({
  userId: true,
  roomName: true,
  scenario: true,
  language: true,
  metadata: true,
});

export const insertMessageSchema = createInsertSchema(conversationMessages).pick({
  sessionId: true,
  speaker: true,
  content: true,
  contentHindi: true,
  audioUrl: true,
  processingTime: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VoiceSession = typeof voiceSessions.$inferSelect;
export type InsertVoiceSession = z.infer<typeof insertVoiceSessionSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
