# Healthcare AI Platform

## Overview

This is a comprehensive AI-powered healthcare intelligence platform that provides personalized medical services through machine learning and natural language processing. The platform offers four core features: disease prediction using RandomForest classification, drug alternative recommendations through NLP and cosine similarity, heart disease risk assessment with ML models, and an AI-powered chatbot for medical inquiries. Built as a full-stack web application, it combines a React frontend with an Express backend, leveraging PostgreSQL for data persistence and OpenAI's GPT-5 for conversational AI capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React 18 and TypeScript, using Vite as the build tool and development server. The UI leverages shadcn/ui components built on Radix UI primitives for accessibility and consistency. State management is handled through React Query (TanStack Query) for server state and React Hook Form with Zod validation for form handling. The application uses Wouter for lightweight client-side routing and Tailwind CSS for styling with a comprehensive design system including CSS variables for theming.

### Backend Architecture
The server runs on Express.js with TypeScript, following a RESTful API design pattern. The application uses a layered architecture with separate modules for routes, storage, and external services. API endpoints are organized by feature domain (disease prediction, drug recommendations, heart assessment, chat). The backend implements proper error handling middleware and request logging for development monitoring.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and migrations. The database schema includes tables for users, disease predictions, drug recommendations, heart assessments, and chat messages. During development, the system falls back to an in-memory storage implementation when the database is unavailable, ensuring development continuity.

### Authentication and Authorization
The codebase is prepared for user authentication with user tables and session management infrastructure, though specific authentication implementation is not yet active. The storage layer includes user-related operations and the frontend has placeholder authentication UI components.

### External Dependencies

- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless) for cloud-hosted database services
- **AI Services**: OpenAI API (GPT-5) for conversational AI, disease analysis, drug recommendations, and heart risk assessment
- **UI Framework**: Extensive Radix UI component library for accessible, unstyled UI primitives
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach
- **Forms**: React Hook Form with Hookform Resolvers for form validation integration
- **Validation**: Zod for runtime type validation and schema definition
- **HTTP Client**: TanStack React Query for server state management and API calls
- **Build Tools**: Vite for fast development and optimized production builds, ESBuild for server bundling
- **Development**: Replit-specific plugins for development environment integration
- **Fonts**: Google Fonts integration (Architects Daughter, DM Sans, Fira Code, Geist Mono)
