import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { computeQueue } from '@/lib/queue';

const ComputeSchema = z.object({
    a: z.number(),
    b: z.number()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { a, b } = ComputeSchema.parse(body);

        // Create computation record
        const computation = await prisma.computation.create({
            data: {
                a,
                b,
                status: 'pending',
                progress: 0
            }
        });

        // Create 4 jobs in bulk
        const operations = ['add', 'subtract', 'multiply', 'divide'] as const;

        await prisma.job.createMany({
            data: operations.map(operation => ({
                computationId: computation.id,
                operation,
                status: 'pending'
            }))
        });

        // Fetch the created jobs to get their IDs
        const jobs = await prisma.job.findMany({
            where: { computationId: computation.id }
        });

        // Queue all jobs
        for (const job of jobs) {
            await computeQueue.add(
                `compute-${job.operation}`,
                {
                    computationId: computation.id,
                    jobId: job.id,
                    a,
                    b,
                    operation: job.operation
                }
            );
        }

        // Update computation status
        await prisma.computation.update({
            where: { id: computation.id },
            data: { status: 'processing' }
        });

        return NextResponse.json({ computationId: computation.id });
    } catch (error) {
        console.error('Compute error:', error);
        return NextResponse.json(
            { error: 'Failed to create computation' },
            { status: 500 }
        );
    }
}