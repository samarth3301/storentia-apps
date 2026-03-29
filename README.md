# CRM Backend Boilerplate

A production-ready Express.js backend boilerplate with TypeScript, Drizzle ORM, Redis, and comprehensive security features.

## Features

- 🚀 **Express.js** with TypeScript
- 🗄️ **Drizzle ORM** with PostgreSQL
- ⚡ **Redis** for caching and sessions
- 🔐 **JWT Authentication** with refresh tokens
- 🛡️ **Security** (Helmet, CORS, Rate Limiting)
- 📊 **Request Logging** with Winston
- ✅ **Input Validation** with Zod
- 🧪 **Testing** with Jest
- 🐳 **Docker** support
- 🔄 **Graceful Shutdown**
- 📝 **API Documentation** ready

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crm-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_HOST` | Redis host | `127.0.0.1` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint code
npm run format           # Format code
npm run type-check       # TypeScript type checking

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:compose:up    # Start with Docker Compose
npm run docker:compose:down  # Stop Docker Compose
```

## API Endpoints

### Authentication

```
POST /v1/auth/register          # User registration
POST /v1/auth/login             # User login
POST /v1/auth/refresh-token     # Refresh access token
POST /v1/auth/logout            # User logout
GET  /v1/auth/profile           # Get user profile
PUT  /v1/auth/profile           # Update user profile
PUT  /v1/auth/change-password   # Change password
```

### Health Check

```
GET /health                     # Application health check
```

## Project Structure

```
src/
├── config/                     # Configuration files
│   ├── database.ts            # Database and Redis setup
│   ├── index.ts               # Environment configuration
│   ├── logger.ts              # Winston logger setup
│   └── moduleAlias.ts         # Module alias configuration
├── controllers/                # Route controllers
│   └── v1/
│       └── auth/
│           ├── admin.controller.ts
│           └── index.ts
├── db/                         # Database schema and migrations
│   └── schema.ts              # Drizzle schema definition
├── handlers/                   # Error and async handlers
│   ├── async.handler.ts
│   └── error.handler.ts
├── middlewares/                # Custom middlewares
│   ├── auth.middleware.ts     # Authentication middleware
│   └── validation.middleware.ts # Input validation
├── routes/                     # Route definitions
│   └── v1/
│       └── auth/
│           └── routes.ts
├── services/                   # Business logic services
│   ├── auth.service.ts        # Authentication service
│   └── redis.service.ts       # Redis service
├── utils/                      # Utility functions
│   ├── APIError.ts            # Custom error class
│   └── auth.utils.ts          # Authentication utilities
├── validations/                # Input validation schemas
│   └── index.ts
├── app.ts                      # Express app setup
└── index.ts                    # Server entry point
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation with Zod
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Token Blacklisting**: Logout functionality
- **SQL Injection Protection**: Drizzle ORM
- **XSS Protection**: Helmet and input sanitization

## Performance Optimizations

- **Compression**: Response compression
- **Connection Pooling**: Database connection pooling
- **Redis Caching**: Session and data caching
- **Graceful Shutdown**: Proper cleanup on exit
- **Request ID Tracking**: Request correlation
- **Logging**: Structured logging with Winston

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
npm run docker:compose:up

# View logs
docker compose -f docker/compose.yaml logs -f

# Stop services
npm run docker:compose:up
```

### Using Docker Only

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## Production Deployment

### Using Docker Compose

```bash
# Build and start all services
npm run docker:compose:up

# Check logs
docker compose -f docker/compose.yaml logs -f

# Stop services
npm run docker:compose:down
```

### Manual Production Setup

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong `JWT_SECRET`
4. Configure Redis for production
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Monitoring

- Health check endpoint: `GET /health`
- Winston logs in `./logs/`
- Docker health checks
- Docker container logs: `docker compose -f docker/compose.yaml logs -f`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting: `npm run lint`
6. Run tests: `npm run test`
7. Submit a pull request

## License

ISC
