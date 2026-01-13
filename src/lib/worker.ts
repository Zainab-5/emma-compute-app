import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from './db';
import { ComputeJobData } from './queue';

// const connection = new Redis(process.env.REDIS_URL!);
const connection = new Redis({
  ...parseRedisUrl(process.env.REDIS_URL!),
  maxRetriesPerRequest: null,
});

// Helper function to parse Redis URL
function parseRedisUrl(url: string) {
  const redisUrl = new URL(url);
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
  };
}


// Simulate computation with 3-second delay
async function performComputation(a: number, b: number, operation: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    default:
      throw new Error('Invalid operation');
  }
}

export const computeWorker = new Worker<ComputeJobData>(
  'compute-jobs',
  async (job) => {
    const { computationId, jobId, a, b, operation } = job.data;
    
    try {
      // Mark job as started
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'processing',
          startedAt: new Date()
        }
      });
      
      // Perform computation (3-second delay)
      const result = await performComputation(a, b, operation);
      
      // Save result
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          result,
          completedAt: new Date()
        }
      });
      
      // Update overall computation progress
      await updateComputationProgress(computationId);
      
      return { result };
    } catch (error) {
      // Handle error
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });
      
      await updateComputationProgress(computationId);
      
      throw error;
    }
  },
  { connection }
);

async function updateComputationProgress(computationId: string) {
  const jobs = await prisma.job.findMany({
    where: { computationId }
  });
  
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed').length;
  const progress = Math.round((completedJobs / jobs.length) * 100);
  
  const allCompleted = completedJobs === jobs.length;
  
  await prisma.computation.update({
    where: { id: computationId },
    data: {
      progress,
      status: allCompleted ? 'completed' : 'processing'
    }
  });
}

// Start worker
computeWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

computeWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});