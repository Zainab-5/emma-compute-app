import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

export const computeQueue = new Queue('compute-jobs', { connection });

export interface ComputeJobData {
  computationId: string;
  jobId: string;
  a: number;
  b: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
}