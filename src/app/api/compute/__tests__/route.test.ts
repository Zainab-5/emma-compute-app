import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock modules BEFORE importing the route
const mockPrismaClient = {
  computation: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  job: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
} as any;

const mockComputeQueue = {
  add: jest.fn(),
} as any;

jest.mock('@/lib/db', () => ({
  prisma: mockPrismaClient,
}));

jest.mock('@/lib/queue', () => ({
  computeQueue: mockComputeQueue,
}));

// Import route AFTER mocks are set up
import { POST } from '../route';

function resetMocks() {
  Object.values(mockPrismaClient.computation).forEach(mock => mock.mockReset());
  Object.values(mockPrismaClient.job).forEach(mock => mock.mockReset());
  mockComputeQueue.add.mockReset();
}

describe('POST /api/compute', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('Success cases', () => {
    it('should create a computation with 4 jobs and queue them', async () => {
      // Arrange
      const mockComputation = {
        id: 'comp-123',
        a: 10,
        b: 5,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJobs = [
        { id: 'job-1', computationId: 'comp-123', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-123', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-123', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-123', operation: 'divide', status: 'pending' },
      ];

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaClient.computation.update.mockResolvedValue({
        ...mockComputation,
        status: 'processing',
      });
      mockComputeQueue.add.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10, b: 5 }),
      });

      // Act
      const response = await POST(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ computationId: 'comp-123' });

      // Verify computation was created
      expect(mockPrismaClient.computation.create).toHaveBeenCalledWith({
        data: {
          a: 10,
          b: 5,
          status: 'pending',
          progress: 0,
        },
      });

      // Verify jobs were created in bulk
      expect(mockPrismaClient.job.createMany).toHaveBeenCalledWith({
        data: [
          { computationId: 'comp-123', operation: 'add', status: 'pending' },
          { computationId: 'comp-123', operation: 'subtract', status: 'pending' },
          { computationId: 'comp-123', operation: 'multiply', status: 'pending' },
          { computationId: 'comp-123', operation: 'divide', status: 'pending' },
        ],
      });

      // Verify jobs were queued
      expect(mockComputeQueue.add).toHaveBeenCalledTimes(4);
      expect(mockComputeQueue.add).toHaveBeenCalledWith('compute-add', {
        computationId: 'comp-123',
        jobId: 'job-1',
        a: 10,
        b: 5,
        operation: 'add',
      });

      // Verify computation status was updated
      expect(mockPrismaClient.computation.update).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
        data: { status: 'processing' },
      });
    });

    it('should handle decimal numbers', async () => {
      const mockComputation = {
        id: 'comp-456',
        a: 3.14,
        b: 2.71,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue([
        { id: 'job-1', computationId: 'comp-456', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-456', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-456', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-456', operation: 'divide', status: 'pending' },
      ]);
      mockPrismaClient.computation.update.mockResolvedValue({
        ...mockComputation,
        status: 'processing',
      });
      mockComputeQueue.add.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 3.14, b: 2.71 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ computationId: 'comp-456' });
      expect(mockPrismaClient.computation.create).toHaveBeenCalledWith({
        data: {
          a: 3.14,
          b: 2.71,
          status: 'pending',
          progress: 0,
        },
      });
    });

    it('should handle negative numbers', async () => {
      const mockComputation = {
        id: 'comp-789',
        a: -10,
        b: -5,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue([
        { id: 'job-1', computationId: 'comp-789', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-789', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-789', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-789', operation: 'divide', status: 'pending' },
      ]);
      mockPrismaClient.computation.update.mockResolvedValue({
        ...mockComputation,
        status: 'processing',
      });
      mockComputeQueue.add.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: -10, b: -5 }),
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
    });

    it('should handle zero values', async () => {
      const mockComputation = {
        id: 'comp-000',
        a: 0,
        b: 0,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue([
        { id: 'job-1', computationId: 'comp-000', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-000', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-000', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-000', operation: 'divide', status: 'pending' },
      ]);
      mockPrismaClient.computation.update.mockResolvedValue({
        ...mockComputation,
        status: 'processing',
      });
      mockComputeQueue.add.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 0, b: 0 }),
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
    });
  });

  describe('Validation errors', () => {
    it('should return 500 when missing required field "a"', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b: 5 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when missing required field "b"', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when "a" is not a number', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'not-a-number', b: 5 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when "b" is not a number', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10, b: 'not-a-number' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when body is empty', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when body is invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });
  });

  describe('Database errors', () => {
    it('should return 500 when computation creation fails', async () => {
      mockPrismaClient.computation.create.mockRejectedValue(
        new Error('Database connection error')
      );

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10, b: 5 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when job creation fails', async () => {
      const mockComputation = {
        id: 'comp-123',
        a: 10,
        b: 5,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockRejectedValue(
        new Error('Job creation failed')
      );

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10, b: 5 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });

    it('should return 500 when queue add fails', async () => {
      const mockComputation = {
        id: 'comp-123',
        a: 10,
        b: 5,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJobs = [
        { id: 'job-1', computationId: 'comp-123', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-123', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-123', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-123', operation: 'divide', status: 'pending' },
      ];

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);
      mockComputeQueue.add.mockRejectedValue(new Error('Queue is full'));

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 10, b: 5 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create computation' });
    });
  });

  describe('Bulk operations', () => {
    it('should use createMany instead of individual creates', async () => {
      const mockComputation = {
        id: 'comp-bulk',
        a: 100,
        b: 50,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJobs = [
        { id: 'job-1', computationId: 'comp-bulk', operation: 'add', status: 'pending' },
        { id: 'job-2', computationId: 'comp-bulk', operation: 'subtract', status: 'pending' },
        { id: 'job-3', computationId: 'comp-bulk', operation: 'multiply', status: 'pending' },
        { id: 'job-4', computationId: 'comp-bulk', operation: 'divide', status: 'pending' },
      ];

      mockPrismaClient.computation.create.mockResolvedValue(mockComputation);
      mockPrismaClient.job.createMany.mockResolvedValue({ count: 4 });
      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaClient.computation.update.mockResolvedValue({
        ...mockComputation,
        status: 'processing',
      });
      mockComputeQueue.add.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 100, b: 50 }),
      });

      await POST(request as any);

      // Verify createMany was called once with all jobs
      expect(mockPrismaClient.job.createMany).toHaveBeenCalledTimes(1);

      // Verify individual create was NOT called
      expect(mockPrismaClient.job.create).not.toHaveBeenCalled();

      // Verify findMany was called to fetch created jobs
      expect(mockPrismaClient.job.findMany).toHaveBeenCalledWith({
        where: { computationId: 'comp-bulk' },
      });
    });
  });
});
