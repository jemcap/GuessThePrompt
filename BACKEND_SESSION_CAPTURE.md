# Backend Development Session Capture - GuessThePrompt

## Session Context
**Date**: Current Session
**Project**: GuessThePrompt - Gamified Prompt Engineering Practice Platform
**Status**: Backend Foundation Setup In Progress

## Project Overview
Building a SaaS where users practice prompt engineering by reverse-engineering AI-generated outcomes. Points are calculated using embedding similarity.

## Current Architecture Decisions

### Technology Stack
- **Runtime**: Node.js with JavaScript (not TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (without pgvector for now - embeddings stored as JSON)
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **AI Integration**: OpenAI API for embeddings

### Docker Setup (Completed ✅)
Located in main project's `docker-compose.yml`:

```yaml
services:
  postgresql:
    image: postgres:16-alpine
    container_name: guesstheprompt_postgres
    environment:
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: guesstheprompt_dev
    ports:
      - "5432:5432"
    volumes:
      - guesstheprompt_postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: guesstheprompt_redis
    ports:
      - "6379:6379"

volumes:
  guesstheprompt_postgres_data:
    driver: local
```

**Status**: ✅ Running successfully

## Backend Project Structure (To Be Created)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Prisma client setup
│   │   └── redis.js         # Redis client configuration
│   ├── controllers/
│   │   ├── authController.js       # Registration, login, logout
│   │   ├── promptController.js     # Prompt CRUD operations
│   │   └── submissionController.js # Answer submissions
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handling
│   │   └── rateLimiter.js   # API rate limiting
│   ├── routes/
│   │   ├── auth.js          # /api/auth/* routes
│   │   ├── prompts.js       # /api/prompts/* routes
│   │   └── submissions.js   # /api/submissions/* routes
│   ├── services/
│   │   ├── embeddingService.js    # OpenAI embedding generation
│   │   ├── scoringService.js      # Similarity calculations
│   │   └── authService.js         # Authentication logic
│   ├── utils/
│   │   ├── AppError.js     # Custom error class
│   │   ├── logger.js        # Winston logger setup
│   │   └── validators.js    # Joi validation schemas
│   └── app.js               # Express app configuration
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
├── .env.example            # Template for environment variables
├── package.json
└── server.js               # Entry point
```

## Dependencies to Install

```bash
# Core dependencies
npm install express cors helmet morgan dotenv
npm install @prisma/client pg
npm install jsonwebtoken bcryptjs
npm install redis
npm install joi express-rate-limit
npm install openai
npm install winston uuid

# Dev dependencies
npm install --save-dev nodemon prisma jest supertest
```

## Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3003

# Database
DATABASE_URL="postgresql://developer:dev_password_123@localhost:5432/guesstheprompt_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=your_super_secret_key_change_this_immediately
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_secret_key_for_refresh_tokens
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# OpenAI
OPENAI_API_KEY=sk-your_openai_key_here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Frontend
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String      @id @default(uuid())
  email           String      @unique
  username        String      @unique
  passwordHash    String      @map("password_hash")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  submissions     Submission[]
  stats           UserStats?
  refreshTokens   RefreshToken[]
  
  @@map("users")
}

model Prompt {
  id             String      @id @default(uuid())
  promptText     String      @map("prompt_text") @db.Text
  outcomeText    String      @map("outcome_text") @db.Text
  outcomeType    String      @map("outcome_type")
  difficulty     Int         @default(1)
  category       String?
  embedding      Json?       
  isActive       Boolean     @default(true) @map("is_active")
  createdAt      DateTime    @default(now()) @map("created_at")
  
  submissions    Submission[]
  
  @@index([difficulty, isActive])
  @@map("prompts")
}

model Submission {
  id                String      @id @default(uuid())
  userId            String      @map("user_id")
  promptId          String      @map("prompt_id")
  submittedText     String      @map("submitted_text") @db.Text
  submittedEmbedding Json?      @map("submitted_embedding")
  similarityScore   Float?      @map("similarity_score")
  pointsEarned      Int         @default(0) @map("points_earned")
  timeTaken         Int?        @map("time_taken")
  submittedAt       DateTime    @default(now()) @map("submitted_at")
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt            Prompt      @relation(fields: [promptId], references: [id])
  
  @@unique([userId, promptId])
  @@index([userId])
  @@index([promptId])
  @@map("submissions")
}

model UserStats {
  userId          String      @id @map("user_id")
  totalScore      Int         @default(0) @map("total_score")
  currentLevel    Int         @default(1) @map("current_level")
  currentStreak   Int         @default(0) @map("current_streak")
  longestStreak   Int         @default(0) @map("longest_streak")
  totalSubmissions Int        @default(0) @map("total_submissions")
  perfectScores   Int         @default(0) @map("perfect_scores")
  lastPlayedAt    DateTime?   @map("last_played_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_stats")
}

model RefreshToken {
  id              String      @id @default(uuid())
  token           String      @unique
  userId          String      @map("user_id")
  expiresAt       DateTime    @map("expires_at")
  createdAt       DateTime    @default(now()) @map("created_at")
  
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("refresh_tokens")
}
```

## Progress Status

### ✅ Completed
1. Docker setup with PostgreSQL and Redis
2. Architecture decisions (no pgvector, store embeddings as JSON)
3. Database schema design
4. Dependencies list
5. Environment variables template
6. Basic Express server structure (documented)

### 🔄 In Progress
1. Express server implementation
2. Logger setup (Winston)
3. Error handling middleware
4. Database and Redis connections

### 📝 Next Steps
1. Complete Express server setup
2. Implement authentication system (register/login)
3. Create JWT middleware
4. Build API routes structure
5. Integrate OpenAI for embeddings
6. Implement scoring algorithm

## Code Templates Ready to Implement

### 1. Server Entry Point (server.js)
```javascript
require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
}
```

### 2. Express App Setup (src/app.js)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes (to be added)
// app.use('/api/v1/auth', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling (must be last)
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

### 3. Database Connection (src/config/database.js)
```javascript
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

module.exports = { prisma, connectDatabase };
```

## Commands to Run

```bash
# Initialize Prisma
npx prisma init

# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Important Decisions Made

1. **No pgvector extension** - Store embeddings as JSON arrays, calculate similarity in JavaScript
2. **JWT over sessions** - Stateless authentication for better scaling
3. **Prisma over raw SQL** - Type safety and easier migrations
4. **Redis for caching** - Not critical but improves performance
5. **Separate backend codebase** - Better separation of concerns

## Key Learning Points

1. **Middleware order matters** - Security → CORS → Rate Limiting → Routes → Error Handler
2. **Environment variables** - Never commit secrets, use .env.example as template
3. **Graceful shutdown** - Properly close connections when server stops
4. **Error handling** - Centralized error handling for consistency
5. **Logging** - Use Winston instead of console.log for production

## Questions to Resolve

1. Will you deploy backend and frontend separately or together?
2. Do you want to implement email verification for registration?
3. Should we add OAuth (Google/GitHub login)?
4. Do you want real-time features (WebSockets)?

## Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://jwt.io/introduction)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Files to Reference

- `ARCHITECTURE.md` - Complete system architecture
- `BACKEND_GUIDE.md` - Detailed backend development guide
- `CLAUDE.md` - Project documentation for future Claude sessions

---

## Continue Session Instructions

To continue this session in your backend codebase:

1. Copy this file to your backend project
2. Reference the guides: ARCHITECTURE.md and BACKEND_GUIDE.md
3. Current task: Implementing Express server foundation
4. Next task: Building authentication system

The backend is currently at Step 4.7 of the implementation process.