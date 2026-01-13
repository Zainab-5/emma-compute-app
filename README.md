# Emma Compute App

A Next.js application that handles compute-intensive operations using a job queue system. The app takes two numbers and performs four operations (add, subtract, multiply, divide) in parallel using background workers.

## Features

- **Parallel Job Processing** - Uses BullMQ to process multiple operations concurrently
- **Real-time Progress Tracking** - Monitor computation progress through the API
- **Persistent Storage** - PostgreSQL database for reliable data storage
- **Type-safe API** - Zod validation and TypeScript throughout
- **Comprehensive Testing** - Jest test suite with 14+ test cases

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose (for PostgreSQL and Redis)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd emma-compute-app
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.example .env
```

4. Update `.env` with your database and Redis URLs if needed (defaults work with Docker setup)

### Running the App

The easiest way to get started is using the setup command which spins up the required services:

```bash
npm run setup
```

This will start PostgreSQL and Redis containers, then push the database schema.

Once setup is complete, start the dev server and worker:

```bash
npm run dev
```

This runs both the Next.js dev server and the background worker concurrently.

## Available Scripts

- `npm run dev` - Start Next.js dev server and worker
- `npm run worker` - Run the background worker only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run setup` - Initialize Docker services and database
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio to view/edit data
- `npm run db:reset` - Reset database (destroys all data)

## API Usage

### Create a Computation

Send two numbers to compute all operations:

```bash
POST /api/compute
Content-Type: application/json

{
  "a": 10,
  "b": 5
}
```

Response:
```json
{
  "computationId": "clx..."
}
```

### Check Job Status

Get the status of a specific job:

```bash
GET /api/jobs/{jobId}
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compute/     # Computation endpoint
│   │   │   └── jobs/        # Job status endpoint
│   │   └── page.tsx         # Main UI
│   ├── lib/
│   │   ├── db.ts           # Prisma client
│   │   ├── queue.ts        # BullMQ queue setup
│   │   └── worker.ts       # Background worker
│   └── components/         # React components
├── prisma/
│   └── schema.prisma       # Database schema
└── __tests__/             # Test files
```

## How It Works

1. User submits two numbers via the API
2. A `Computation` record is created in the database
3. Four `Job` records are created (one for each operation) using a bulk insert
4. Each job is added to the Redis queue
5. The background worker picks up jobs and processes them
6. Results are stored back in the database
7. Users can check progress via the jobs API

## Testing

The project includes comprehensive test coverage for the compute API:

```bash
npm test
```

Tests cover:
- Successful computation creation
- Input validation (missing fields, wrong types)
- Error handling (database failures, queue errors)
- Bulk operation verification

## CI/CD

GitHub Actions automatically runs tests and builds on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Queue:** BullMQ with Redis
- **Validation:** Zod
- **Testing:** Jest with ts-jest
- **Styling:** Tailwind CSS

## Contributing

Feel free to open issues or submit pull requests. Make sure tests pass before submitting:

```bash
npm test
npm run build
```

## License

MIT
