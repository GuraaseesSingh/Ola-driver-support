# Ola Driver Support Voice Bot

## Overview

This is a full-stack web application that provides an AI-powered voice assistant for Ola driver support. The system enables Hindi-speaking drivers to report issues through voice interactions and receive real-time automated assistance. The application features a React frontend with modern UI components, an Express.js backend, and integrates with multiple external services including LiveKit for WebRTC audio streaming, Groq for AI language processing, and browser speech APIs for speech-to-text and text-to-speech functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React and TypeScript, utilizing Vite for build tooling and development server. The UI is constructed with shadcn/ui components built on Radix UI primitives and styled with Tailwind CSS. The application follows a single-page architecture with wouter for client-side routing.

**Key Frontend Components:**
- Voice control panel for recording audio input
- Real-time conversation display with message history
- Scenario information panel showing current support flow
- Responsive design with mobile-first approach

**State Management:**
- React Query for server state management and caching
- Custom hooks for voice bot functionality and UI interactions
- WebSocket connection management for real-time communication

### Backend Architecture
The server is built with Express.js and uses a monolithic architecture with modular service layers. The application supports both in-memory storage for development and PostgreSQL for production through Drizzle ORM.

**API Structure:**
- RESTful endpoints for session and message management
- WebSocket server for real-time audio data streaming
- Service layer pattern for external integrations

**Data Layer:**
- Drizzle ORM with PostgreSQL support
- Schema definitions for users, voice sessions, and conversation messages
- In-memory storage fallback for development

### Real-time Communication
The system uses WebSocket connections for bidirectional real-time communication between client and server, enabling low-latency audio data transmission and live conversation updates.

### Authentication & Session Management
User sessions are managed through a simple user system with username/password authentication. Voice sessions are tracked with unique identifiers and room-based organization for potential multi-user scenarios.

## External Dependencies

### Audio & Communication Services
- **LiveKit**: WebRTC infrastructure for real-time audio streaming and room management
- **Browser Speech APIs**: Native speech recognition (STT) and synthesis (TTS) for Hindi language support

### AI & Language Processing
- **Groq Cloud API**: Large language model for generating contextual responses in Hindi
- **Conversation Flow Engine**: Predefined conversation scripts for driver support scenarios

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle ORM**: Type-safe database queries and schema management

### UI & Development Tools
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static typing for both frontend and backend

### Development & Deployment
- **Replit Integration**: Development environment optimization with runtime error overlays and dev banners
- **ESBuild**: Server-side bundling for production deployment