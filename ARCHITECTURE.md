# GuessThePrompt - System Architecture & Development Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Decision Records](#architecture-decision-records)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Development Roadmap](#development-roadmap)
8. [Best Practices](#best-practices)

## System Overview

GuessThePrompt is a full-stack SaaS application requiring:
- **Frontend**: React SPA for user interaction
- **Backend API**: Node.js/Express or Python/FastAPI for business logic
- **Database**: PostgreSQL for relational data, Redis for caching
- **AI Services**: OpenAI API for embeddings and generation
- **Authentication**: JWT-based auth with refresh tokens
- **Infrastructure**: Cloud hosting (Vercel/Railway/AWS)

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Backend API   │────▶│   PostgreSQL    │
│   (Vite + TS)   │     │  (Node/Express) │     │    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │   OpenAI API    │     │  Redis Cache    │
                        │  (Embeddings)   │     │   (Sessions)    │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## Architecture Decision Records

### ADR-001: Why You Need a Backend API

**Decision**: Build a dedicated backend API

**Rationale**:
1. **Security**: API keys must never be exposed to frontend
2. **Cost Control**: Rate limiting and usage tracking
3. **Business Logic**: Complex scoring algorithms server-side
4. **Data Integrity**: Validate submissions server-side
5. **Scalability**: Can add queue systems for heavy processing

**Consequences**:
- Additional infrastructure complexity
- Need for API authentication
- Better security and control

### ADR-002: Database Choice - PostgreSQL over MongoDB

**Decision**: Use PostgreSQL as primary database

**Rationale**:
1. **Relational Data**: Users, prompts, submissions have clear relationships
2. **ACID Compliance**: Financial data (subscriptions) needs transactions
3. **pgvector Extension**: Native vector similarity search for embeddings
4. **JSON Support**: JSONB columns for flexible schema where needed
5. **Mature Ecosystem**: Better ORMs, migrations, tooling

**MongoDB Alternative** (Not Recommended):
- Would work but adds complexity for relational queries
- Less efficient for leaderboards and analytics
- Would need separate vector database

### ADR-003: Embedding Storage Strategy

**Decision**: Store embeddings in PostgreSQL with pgvector

**Rationale**:
1. **Single Database**: Simpler architecture
2. **Similarity Search**: Built-in cosine similarity functions
3. **Atomic Operations**: Embeddings stored with prompts
4. **Cost Effective**: No separate vector database needed

## Technology Stack

### Backend Stack (Recommended)

```typescript
// Option 1: Node.js Stack (Recommended for JS developers)
{
  "runtime": "Node.js 20+",
  "framework": "Express.js with TypeScript",
  "ORM": "Prisma or TypeORM",
  "validation": "Zod",
  "auth": "Passport.js + JWT",
  "api-docs": "Swagger/OpenAPI",
  "testing": "Jest + Supertest",
  "queue": "BullMQ (Redis-based)",
  "logging": "Winston",
  "monitoring": "Sentry"
}

// Option 2: Python Stack (If you prefer Python)
{
  "runtime": "Python 3.11+",
  "framework": "FastAPI",
  "ORM": "SQLAlchemy",
  "validation": "Pydantic (built-in)",
  "auth": "FastAPI-Users",
  "api-docs": "Auto-generated",
  "testing": "Pytest",
  "queue": "Celery",
  "vector-ops": "NumPy/SciPy"
}
```

### Infrastructure Requirements

```yaml
production:
  database:
    - PostgreSQL 15+ with pgvector extension
    - Connection pooling (PgBouncer)
    - Read replicas for scaling
  
  caching:
    - Redis for session management
    - Redis for API rate limiting
    - CDN for static assets
  
  services:
    - OpenAI API (GPT-4 for generation)
    - OpenAI Embeddings API (text-embedding-3-small)
    - Email service (SendGrid/Resend)
    - Payment processing (Stripe)
  
  monitoring:
    - Application: Sentry
    - Infrastructure: Datadog/New Relic
    - Analytics: PostHog/Mixpanel
```

## Database Design

### Core Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP
);

-- Prompts table (the challenges)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_text TEXT NOT NULL,
    outcome_text TEXT NOT NULL,
    outcome_type VARCHAR(20) NOT NULL, -- 'text', 'code', 'image'
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
    category VARCHAR(50),
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB, -- Flexible field for additional data
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    submitted_text TEXT NOT NULL,
    submitted_embedding vector(1536),
    similarity_score DECIMAL(5,4), -- 0.0000 to 1.0000
    points_earned INTEGER,
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, prompt_id) -- Prevent duplicate submissions
);

-- User statistics (denormalized for performance)
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    perfect_submissions INTEGER DEFAULT 0,
    average_similarity DECIMAL(5,4),
    last_played_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboards (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    us.total_score,
    us.current_level,
    us.current_streak,
    RANK() OVER (ORDER BY us.total_score DESC) as global_rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE u.subscription_tier != 'banned';

-- Indexes for performance
CREATE INDEX idx_prompts_embedding ON prompts USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_prompt_id ON submissions(prompt_id);
CREATE INDEX idx_user_stats_total_score ON user_stats(total_score DESC);
```

### Why This Schema Design?

1. **Normalized Structure**: Prevents data duplication
2. **Denormalized Stats**: Fast leaderboard queries
3. **Vector Indexing**: Efficient similarity search
4. **JSONB Metadata**: Flexibility for future features
5. **Audit Trail**: Timestamps on everything

## API Architecture

### RESTful API Design

```typescript
// API Route Structure
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   └── GET    /me
├── /prompts
│   ├── GET    /          (get daily challenges)
│   ├── GET    /:id       (get specific prompt)
│   └── GET    /random    (get random by difficulty)
├── /submissions
│   ├── POST   /          (submit answer)
│   ├── GET    /history   (user's submission history)
│   └── GET    /stats     (user statistics)
├── /leaderboard
│   ├── GET    /global    (top 100 users)
│   ├── GET    /weekly    (this week's top)
│   └── GET    /friends   (user's network)
└── /admin
    ├── POST   /prompts   (create new prompt)
    └── PUT    /prompts/:id (update prompt)
```

### API Implementation Example

```typescript
// src/api/services/SubmissionService.ts
import { OpenAI } from 'openai';
import { db } from '../database';
import { calculateSimilarity } from '../utils/embeddings';

export class SubmissionService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async submitAnswer(userId: string, promptId: string, answer: string) {
    // 1. Validate the prompt exists and user hasn't already submitted
    const prompt = await db.prompt.findUnique({
      where: { id: promptId, is_active: true }
    });
    
    if (!prompt) {
      throw new Error('Invalid prompt');
    }

    // 2. Check for existing submission
    const existing = await db.submission.findUnique({
      where: {
        user_id_prompt_id: {
          user_id: userId,
          prompt_id: promptId
        }
      }
    });

    if (existing) {
      throw new Error('Already submitted');
    }

    // 3. Generate embedding for user's answer
    const embedding = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: answer,
    });

    // 4. Calculate similarity score
    const similarity = await calculateSimilarity(
      embedding.data[0].embedding,
      prompt.embedding
    );

    // 5. Calculate points (exponential scoring for better matches)
    const points = this.calculatePoints(similarity, prompt.difficulty_level);

    // 6. Create submission record
    const submission = await db.submission.create({
      data: {
        user_id: userId,
        prompt_id: promptId,
        submitted_text: answer,
        submitted_embedding: embedding.data[0].embedding,
        similarity_score: similarity,
        points_earned: points
      }
    });

    // 7. Update user statistics (in transaction)
    await this.updateUserStats(userId, points, similarity);

    return {
      similarity,
      points,
      feedback: this.generateFeedback(similarity)
    };
  }

  private calculatePoints(similarity: number, difficulty: number): number {
    // Exponential scoring: rewards high similarity much more
    const basePoints = Math.floor(Math.pow(similarity, 3) * 1000);
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;
    return Math.floor(basePoints * difficultyMultiplier);
  }

  private generateFeedback(similarity: number): string {
    if (similarity > 0.95) return "Perfect! You nailed it!";
    if (similarity > 0.85) return "Excellent! Very close to the original.";
    if (similarity > 0.70) return "Good job! You captured the main idea.";
    if (similarity > 0.50) return "Not bad, but there's room for improvement.";
    return "Keep trying! Think about the key elements needed.";
  }
}
```

## Frontend Architecture

### State Management Strategy

```typescript
// src/store/gameStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameState {
  // Current game state
  currentPrompt: Prompt | null;
  userAnswer: string;
  isSubmitting: boolean;
  
  // User stats
  stats: {
    level: number;
    score: number;
    streak: number;
  };
  
  // Recent results
  lastResult: {
    similarity: number;
    points: number;
    feedback: string;
  } | null;
  
  // Actions
  fetchDailyChallenge: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  updateStats: (stats: Partial<GameState['stats']>) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        currentPrompt: null,
        userAnswer: '',
        isSubmitting: false,
        stats: {
          level: 1,
          score: 0,
          streak: 0
        },
        lastResult: null,

        fetchDailyChallenge: async () => {
          const response = await api.get('/prompts/daily');
          set({ currentPrompt: response.data });
        },

        submitAnswer: async (answer: string) => {
          set({ isSubmitting: true });
          try {
            const { currentPrompt } = get();
            const response = await api.post('/submissions', {
              promptId: currentPrompt?.id,
              answer
            });
            
            set({
              lastResult: response.data,
              stats: response.data.updatedStats,
              isSubmitting: false
            });
          } catch (error) {
            set({ isSubmitting: false });
            throw error;
          }
        },

        updateStats: (stats) => {
          set((state) => ({
            stats: { ...state.stats, ...stats }
          }));
        }
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({ stats: state.stats })
      }
    )
  )
);
```

### Component Architecture Best Practices

```typescript
// src/components/game/PromptDisplay.tsx
import { memo } from 'react';
import { Skeleton } from '../ui/Skeleton';

interface PromptDisplayProps {
  outcome: string;
  outcomeType: 'text' | 'code' | 'image';
  difficulty: number;
  isLoading?: boolean;
}

// Memoize expensive renders
export const PromptDisplay = memo(({ 
  outcome, 
  outcomeType, 
  difficulty,
  isLoading 
}: PromptDisplayProps) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reverse Engineer This:</h2>
        <DifficultyBadge level={difficulty} />
      </div>
      
      <div className="relative">
        {outcomeType === 'code' ? (
          <CodeBlock code={outcome} />
        ) : outcomeType === 'image' ? (
          <ImageDisplay src={outcome} />
        ) : (
          <TextDisplay text={outcome} />
        )}
      </div>
    </div>
  );
});

PromptDisplay.displayName = 'PromptDisplay';
```

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Project setup with Vite + React + TypeScript
- [x] Basic UI components (Header, Stats)
- [ ] Backend API setup with Express + TypeScript
- [ ] PostgreSQL database with Prisma ORM
- [ ] Authentication system (JWT)
- [ ] Basic prompt submission flow

### Phase 2: Core Gameplay (Weeks 3-4)
- [ ] OpenAI integration for embeddings
- [ ] Similarity scoring algorithm
- [ ] Points calculation system
- [ ] Streak tracking
- [ ] Basic leaderboard
- [ ] Daily challenge system

### Phase 3: Gamification (Weeks 5-6)
- [ ] Level progression system
- [ ] Achievement badges
- [ ] User profiles
- [ ] Social features (follow users)
- [ ] Weekly tournaments
- [ ] Prompt categories/topics

### Phase 4: Monetization (Weeks 7-8)
- [ ] Stripe integration
- [ ] Subscription tiers (Free, Pro, Team)
- [ ] Premium prompt packs
- [ ] API rate limiting
- [ ] Usage analytics
- [ ] Admin dashboard

### Phase 5: Polish & Scale (Weeks 9-10)
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] PWA features
- [ ] Email notifications
- [ ] Data export features
- [ ] A/B testing framework

## Best Practices

### 1. Security Best Practices

```typescript
// Never expose sensitive data
const SECURITY_RULES = {
  api_keys: 'Store in environment variables, never commit',
  user_data: 'Hash passwords with bcrypt, minimum 10 rounds',
  sql_injection: 'Use parameterized queries, never concatenate',
  rate_limiting: 'Implement per-user and per-IP limits',
  cors: 'Whitelist specific origins in production',
  validation: 'Validate on both client and server',
  sanitization: 'Sanitize all user inputs before storage'
};
```

### 2. Performance Optimization

```typescript
// Database optimization
const PERFORMANCE_TIPS = {
  caching: {
    strategy: 'Cache embeddings and frequently accessed prompts',
    tool: 'Redis with 1-hour TTL for prompts',
    invalidation: 'Clear cache on prompt updates'
  },
  
  pagination: {
    limit: 'Maximum 100 items per request',
    cursor: 'Use cursor-based pagination for large datasets',
    example: 'SELECT * FROM prompts WHERE id > ? LIMIT 20'
  },
  
  indexing: {
    primary: 'Index foreign keys and frequently queried columns',
    vector: 'Use IVFFlat index for vector similarity search',
    compound: 'Create compound indexes for multi-column queries'
  },
  
  lazy_loading: {
    images: 'Load images only when visible',
    components: 'Code-split routes with React.lazy()',
    data: 'Fetch data on-demand, not all upfront'
  }
};
```

### 3. Code Quality Standards

```typescript
// Enforce these in your CI/CD pipeline
const CODE_STANDARDS = {
  typescript: {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true
  },
  
  testing: {
    coverage: 'Minimum 80% code coverage',
    types: ['unit', 'integration', 'e2e'],
    tools: ['Jest', 'React Testing Library', 'Playwright']
  },
  
  linting: {
    eslint: 'Enforce consistent code style',
    prettier: 'Auto-format on save',
    husky: 'Pre-commit hooks for quality checks'
  },
  
  documentation: {
    api: 'OpenAPI/Swagger for all endpoints',
    components: 'Storybook for UI components',
    readme: 'Keep README and ARCHITECTURE.md updated'
  }
};
```

### 4. Error Handling Strategy

```typescript
// Centralized error handling
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Log unexpected errors
  logger.error('Unexpected error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;
    
  res.status(500).json({
    status: 'error',
    message
  });
};
```

### 5. Monitoring & Observability

```typescript
// What to monitor
const MONITORING = {
  metrics: {
    application: [
      'API response times',
      'Error rates by endpoint',
      'Active users',
      'Submission success rate'
    ],
    business: [
      'Daily active users',
      'Conversion rate (free to paid)',
      'User retention (7-day, 30-day)',
      'Average session duration'
    ],
    infrastructure: [
      'Database query performance',
      'Redis hit rate',
      'OpenAI API latency',
      'Memory usage'
    ]
  },
  
  logging: {
    structured: 'Use JSON format for easy parsing',
    levels: ['error', 'warn', 'info', 'debug'],
    correlation: 'Add request ID to track across services'
  },
  
  alerts: {
    critical: 'Page when error rate > 5%',
    warning: 'Slack notification when response time > 2s',
    info: 'Daily summary of key metrics'
  }
};
```

## Deployment Strategy

### Production Deployment

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: guesstheprompt
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/guesstheprompt
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Recommended Hosting

```typescript
const HOSTING_OPTIONS = {
  frontend: {
    platform: 'Vercel',
    reason: 'Best for React apps, automatic deploys, edge network',
    cost: 'Free tier sufficient for MVP'
  },
  
  backend: {
    platform: 'Railway or Render',
    reason: 'Easy PostgreSQL + Redis setup, good free tier',
    alternative: 'AWS EC2 + RDS for scale'
  },
  
  database: {
    development: 'Railway PostgreSQL',
    production: 'Supabase or Neon (serverless Postgres)',
    scale: 'AWS RDS with read replicas'
  },
  
  monitoring: {
    errors: 'Sentry (generous free tier)',
    analytics: 'PostHog (self-hosted option)',
    logs: 'Axiom or Datadog'
  }
};
```

## Next Steps for You as a Junior Developer

1. **Start with the Backend**
   - Set up Express + TypeScript
   - Create the database schema
   - Implement authentication
   - Build the core API endpoints

2. **Integrate OpenAI**
   - Get API keys
   - Test embedding generation
   - Implement similarity calculation
   - Store embeddings efficiently

3. **Connect Frontend to Backend**
   - Set up API client with Axios
   - Implement authentication flow
   - Create the game loop
   - Add real-time feedback

4. **Test Everything**
   - Write unit tests for scoring logic
   - Integration tests for API endpoints
   - E2E tests for critical user flows
   - Load testing for performance

5. **Deploy MVP**
   - Start with free tiers
   - Monitor everything
   - Gather user feedback
   - Iterate quickly

Remember: **Ship early, ship often**. Don't wait for perfection. Get an MVP live, gather feedback, and iterate. The architecture I've outlined is production-ready but start simple and add complexity as you grow.

Any questions about specific parts of this architecture?