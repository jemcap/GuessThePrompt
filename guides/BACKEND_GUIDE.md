# Backend Development Guide - GuessThePrompt

## Table of Contents
1. [Overview](#overview)
2. [Docker Setup](#docker-setup)
3. [Project Structure](#project-structure)
4. [Dependencies](#dependencies)
5. [Database Setup](#database-setup)
6. [Express Configuration](#express-configuration)
7. [Authentication System](#authentication-system)
8. [API Endpoints](#api-endpoints)
9. [OpenAI Integration](#openai-integration)
10. [Development Workflow](#development-workflow)
11. [Testing Strategy](#testing-strategy)
12. [Common Pitfalls](#common-pitfalls)
13. [Progress Tracker](#progress-tracker)

## Overview

This guide walks you through building the GuessThePrompt backend API using Express.js (JavaScript), PostgreSQL with pgvector, Redis, and OpenAI integration.

### Why These Technologies?

- **Express.js**: Simple, flexible, huge ecosystem
- **PostgreSQL + pgvector**: Relational data + vector similarity search
- **Redis**: Fast caching and session management
- **Docker**: Consistent development environment
- **Prisma ORM**: Type-safe database queries, even in JavaScript

## Docker Setup

### Current Configuration
✅ **Status: Configured**

Your `docker-compose.yml` should use:
- **PostgreSQL with pgvector**: Use `ankane/pgvector:v0.5.1-pg16` image (NOT `pgvector/pgvector`)
- **Redis**: For caching and sessions
- **Persistent volumes**: For data persistence

**Correct Docker image for pgvector:**
```yaml
image: ankane/pgvector:v0.5.1-pg16  # Correct image
# NOT: image: pgvector/pgvector:latest  # This doesn't exist
```

### Starting Docker

```bash
# Start services
docker-compose up -d

# Verify running
docker-compose ps

# View logs
docker-compose logs postgresql
docker-compose logs redis

# Stop services
docker-compose down

# Reset everything (delete data)
docker-compose down -v
```

### Why Docker for Development?

1. **No local installation** - PostgreSQL and Redis run in containers
2. **Version consistency** - Same versions as production
3. **Easy reset** - Delete volumes to start fresh
4. **Team collaboration** - Everyone has identical setup

## Project Structure

### Recommended Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Prisma client setup
│   │   ├── redis.js         # Redis client configuration
│   │   └── config.js        # Environment variable management
│   ├── controllers/
│   │   ├── authController.js       # Registration, login, logout
│   │   ├── promptController.js     # Prompt CRUD operations
│   │   └── submissionController.js # Answer submissions
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handling
│   │   ├── rateLimiter.js   # API rate limiting
│   │   └── validation.js    # Request validation
│   ├── models/              # Prisma schema definitions
│   ├── routes/
│   │   ├── auth.js          # /api/auth/* routes
│   │   ├── prompts.js       # /api/prompts/* routes
│   │   └── submissions.js   # /api/submissions/* routes
│   ├── services/
│   │   ├── embeddingService.js    # OpenAI embedding generation
│   │   ├── scoringService.js      # Similarity calculations
│   │   ├── authService.js         # Authentication logic
│   │   └── statsService.js        # User statistics
│   ├── utils/
│   │   ├── AppError.js     # Custom error class
│   │   ├── asyncHandler.js # Async route wrapper
│   │   ├── logger.js        # Winston logger setup
│   │   └── validators.js    # Joi validation schemas
│   └── app.js               # Express app configuration
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── tests/
│   ├── unit/
│   └── integration/
├── .env                     # Environment variables (git ignored)
├── .env.example            # Template for environment variables
├── package.json
├── package-lock.json
└── server.js               # Entry point
```

### Why This Structure?

- **Separation of Concerns**: Each folder has a single responsibility
- **Scalability**: Easy to add new features without clutter
- **Testability**: Each module can be tested independently
- **Team Friendly**: Clear conventions for where code belongs

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    // Web Framework
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    
    // Environment & Config
    "dotenv": "^16.3.1",
    
    // Database
    "@prisma/client": "^5.7.0",
    "pg": "^8.11.3",
    
    // Authentication
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    
    // Redis
    "redis": "^4.6.11",
    "connect-redis": "^7.1.0",
    
    // Validation
    "joi": "^17.11.0",
    "express-validator": "^7.0.1",
    
    // OpenAI
    "openai": "^4.24.1",
    
    // Utilities
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "express-async-handler": "^1.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Installation Commands

```bash
# Install all dependencies
npm install express cors helmet morgan dotenv
npm install @prisma/client pg
npm install jsonwebtoken bcryptjs
npm install redis connect-redis
npm install joi express-validator
npm install openai
npm install uuid winston express-rate-limit express-async-handler

# Dev dependencies
npm install -D nodemon prisma jest supertest
```

### Why These Packages?

| Package | Purpose | Why This One? |
|---------|---------|---------------|
| express | Web framework | Industry standard, simple |
| helmet | Security headers | Prevents common attacks |
| cors | Cross-origin requests | Required for React frontend |
| bcryptjs | Password hashing | More reliable than bcrypt |
| jsonwebtoken | JWT auth | Stateless authentication |
| prisma | ORM | Type safety, migrations |
| joi | Validation | Declarative schemas |
| winston | Logging | Production-ready |
| openai | AI integration | Official SDK |

## Database Setup

### Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3003

# Database
DATABASE_URL="postgresql://developer:dev_password_123@localhost:5432/guesstheprompt_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another_secret_key_for_refresh_tokens
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=10

# OpenAI
OPENAI_API_KEY=sk-...your_key_here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Frontend
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Prisma Schema (prisma/schema.prisma)

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
  
  // Relations
  submissions     Submission[]
  stats           UserStats?
  refreshTokens   RefreshToken[]
  
  @@map("users")
}

model Prompt {
  id             String      @id @default(uuid())
  promptText     String      @map("prompt_text")
  outcomeText    String      @map("outcome_text") @db.Text
  outcomeType    String      @map("outcome_type") // 'text', 'code', 'image'
  difficulty     Int         @default(1)
  category       String?
  embedding      Json?       // Store as JSON array
  isActive       Boolean     @default(true) @map("is_active")
  createdAt      DateTime    @default(now()) @map("created_at")
  
  // Relations
  submissions    Submission[]
  
  @@index([difficulty, category])
  @@map("prompts")
}

model Submission {
  id              String      @id @default(uuid())
  userId          String      @map("user_id")
  promptId        String      @map("prompt_id")
  submittedText   String      @map("submitted_text") @db.Text
  submittedEmbedding Json?    @map("submitted_embedding")
  similarityScore Float?      @map("similarity_score")
  pointsEarned    Int         @default(0) @map("points_earned")
  timeTaken       Int?        @map("time_taken") // in seconds
  submittedAt     DateTime    @default(now()) @map("submitted_at")
  
  // Relations
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt          Prompt      @relation(fields: [promptId], references: [id])
  
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
  
  // Relations
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_stats")
}

model RefreshToken {
  id              String      @id @default(uuid())
  token           String      @unique
  userId          String      @map("user_id")
  expiresAt       DateTime    @map("expires_at")
  createdAt       DateTime    @default(now()) @map("created_at")
  
  // Relations
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("refresh_tokens")
}
```

### Database Commands

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Express Configuration

### Entry Point (server.js)

```javascript
require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
}
```

### App Configuration (src/app.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/prompts', require('./routes/prompts'));
app.use('/api/v1/submissions', require('./routes/submissions'));
app.use('/api/v1/stats', require('./routes/stats'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

### Why This Configuration Order?

1. **Security first** (helmet) - Set security headers before anything else
2. **CORS** - Must be before routes
3. **Body parsing** - Needed to read request bodies
4. **Rate limiting** - Prevent abuse early
5. **Routes** - Main application logic
6. **Error handling last** - Catches all errors

## Authentication System

### JWT Strategy

**Why JWT?**
- **Stateless**: No server-side session storage
- **Scalable**: Works across multiple servers
- **Mobile-friendly**: Easy to implement in any client

### Authentication Flow

```
1. Register/Login
   ↓
2. Generate Access Token (short-lived, 15 min)
   ↓
3. Generate Refresh Token (long-lived, 30 days)
   ↓
4. Store Refresh Token in database
   ↓
5. Send both tokens to client
   ↓
6. Client stores Access Token in memory
   ↓
7. Client stores Refresh Token in httpOnly cookie
```

### Token Refresh Flow

```
1. Access token expires
   ↓
2. Client sends refresh token
   ↓
3. Verify refresh token
   ↓
4. Generate new access token
   ↓
5. Optionally rotate refresh token
   ↓
6. Send new tokens to client
```

### Security Best Practices

1. **Hash passwords** with bcrypt (minimum 10 rounds)
2. **Use strong secrets** for JWT signing
3. **Short access token lifetime** (15 minutes)
4. **Refresh token rotation** for extra security
5. **Store tokens properly**:
   - Access token: In memory (not localStorage)
   - Refresh token: httpOnly cookie
6. **Validate everything** server-side
7. **Rate limit auth endpoints** aggressively

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Create new account | No |
| POST | `/api/v1/auth/login` | Login with credentials | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No (uses refresh token) |
| POST | `/api/v1/auth/logout` | Logout and invalidate tokens | Yes |
| GET | `/api/v1/auth/me` | Get current user info | Yes |

### Prompt Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/prompts/daily` | Get today's challenge | Yes |
| GET | `/api/v1/prompts/random` | Get random prompt | Yes |
| GET | `/api/v1/prompts/:id` | Get specific prompt | Yes |
| GET | `/api/v1/prompts` | List prompts (paginated) | Yes |

### Submission Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/submissions` | Submit an answer | Yes |
| GET | `/api/v1/submissions/history` | Get user's submission history | Yes |
| GET | `/api/v1/submissions/:id` | Get specific submission | Yes |

### Stats Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/stats` | Get user statistics | Yes |
| GET | `/api/v1/stats/leaderboard` | Get global leaderboard | Yes |
| GET | `/api/v1/stats/streak` | Get streak information | Yes |

## OpenAI Integration

### Embedding Service Design

```javascript
// services/embeddingService.js
const { OpenAI } = require('openai');

class EmbeddingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL,
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitude1 * magnitude2);
  }
}

module.exports = new EmbeddingService();
```

### Scoring Algorithm

```javascript
// services/scoringService.js
class ScoringService {
  calculatePoints(similarity, difficulty, timeTaken) {
    // Base score from similarity (0-1000)
    const baseScore = Math.floor(Math.pow(similarity, 3) * 1000);
    
    // Difficulty multiplier (1.0 - 2.0)
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.11;
    
    // Time bonus (max 200 points, decreases over 300 seconds)
    const timeBonus = Math.max(0, 200 - Math.floor(timeTaken / 1.5));
    
    // Calculate final score
    const finalScore = Math.floor(baseScore * difficultyMultiplier) + timeBonus;
    
    return {
      baseScore,
      difficultyMultiplier,
      timeBonus,
      finalScore
    };
  }

  getSimilarityFeedback(similarity) {
    if (similarity >= 0.95) return "Perfect! You nailed it! 🎯";
    if (similarity >= 0.85) return "Excellent! Very close to the original.";
    if (similarity >= 0.70) return "Good job! You captured the main idea.";
    if (similarity >= 0.50) return "Not bad, but there's room for improvement.";
    return "Keep trying! Think about the key elements needed.";
  }
}

module.exports = new ScoringService();
```

### Rate Limiting Strategy

```javascript
// For OpenAI API calls
const openAILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  keyGenerator: (req) => req.userId, // Rate limit by user ID
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many submissions. Please wait a moment.'
    });
  }
});
```

## Development Workflow

### Step-by-Step Development Process

1. **Environment Setup**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd backend
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Database Setup**
   ```bash
   # Start Docker containers
   docker-compose up -d
   
   # Initialize Prisma
   npx prisma init
   
   # Create and apply migrations
   npx prisma migrate dev --name init
   ```

3. **Development Server**
   ```bash
   # Start with nodemon
   npm run dev
   
   # Or if you haven't set up the script:
   npx nodemon server.js
   ```

4. **Testing Endpoints**
   - Use Postman, Insomnia, or REST Client (VS Code extension)
   - Import the API collection (if available)
   - Test each endpoint systematically

### NPM Scripts (package.json)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "studio": "prisma studio",
    "seed": "node prisma/seed.js"
  }
}
```

## Testing Strategy

### Testing Levels

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test API endpoints
3. **End-to-End Tests** - Test complete user flows

### Example Test Structure

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Authentication', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'SecurePassword123!'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
```

### What to Test

1. **Authentication**: Registration, login, token refresh
2. **Authorization**: Protected routes, role-based access
3. **Validation**: Invalid inputs, edge cases
4. **Business Logic**: Scoring algorithm, streak calculation
5. **Error Handling**: 404s, 500s, validation errors

## Common Pitfalls

### Security Pitfalls

| Pitfall | Solution |
|---------|----------|
| Storing passwords as plain text | Always hash with bcrypt |
| Exposing stack traces in production | Use generic error messages |
| No rate limiting | Implement rate limiting early |
| Weak JWT secrets | Use strong, random secrets |
| SQL injection | Use parameterized queries (Prisma handles this) |
| Missing CORS configuration | Configure CORS properly |

### Performance Pitfalls

| Pitfall | Solution |
|---------|----------|
| N+1 queries | Use Prisma's `include` for relations |
| No caching | Cache frequently accessed data in Redis |
| Large payloads | Implement pagination |
| Synchronous heavy operations | Use background jobs for heavy tasks |
| No connection pooling | Prisma handles this automatically |

### Development Pitfalls

| Pitfall | Solution |
|---------|----------|
| Hardcoded values | Use environment variables |
| No error handling | Wrap async routes with try-catch |
| Console.log for debugging | Use proper logging (Winston) |
| No input validation | Validate all user inputs |
| Ignoring TypeScript/ESLint warnings | Fix warnings immediately |

## Progress Tracker

### Phase 1: Foundation ⏳
- [x] Docker setup
- [x] Project structure created
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Prisma initialized and schema created

### Phase 2: Database ✅
- [x] Prisma schema defined
- [x] Migrations created
- [ ] Database seeded with test data
- [x] Prisma client configured

### Phase 3: Authentication 📝
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] JWT middleware
- [ ] Refresh token system
- [ ] Protected route testing

### Phase 4: Core Features 🎮
- [ ] Prompt endpoints
- [ ] OpenAI integration
- [ ] Submission system
- [ ] Scoring algorithm
- [ ] Stats tracking

### Phase 5: Optimization 🚀
- [ ] Redis caching
- [ ] Rate limiting
- [ ] Error monitoring
- [ ] Performance testing
- [ ] Security audit

### Phase 6: Production Ready ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Deployment setup
- [ ] Monitoring configured

## Next Steps

1. **Complete Docker setup** - Ensure containers are running
2. **Create project structure** - Follow the recommended folder structure
3. **Install dependencies** - Use the package list provided
4. **Set up Prisma** - Define schema and run migrations
5. **Build authentication** - Start with register/login endpoints

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Redis Documentation](https://redis.io/docs/)

## Notes Section

Use this section to track your own notes, issues, and solutions as you build:

---
### Development Log

**Date**: [Your entries here]
- What you worked on
- Issues encountered
- Solutions found
- Next tasks

---

Remember: **Build incrementally**. Start with authentication, then add features one by one. Test everything as you go!