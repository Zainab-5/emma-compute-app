import { jest } from '@jest/globals';

// Mock Prisma Client
export const mockPrismaClient = {
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
};

// Mock BullMQ Queue
export const mockComputeQueue = {
  add: jest.fn(),
};

// Reset all mocks
export function resetMocks() {
  Object.values(mockPrismaClient.computation).forEach(mock => mock.mockReset());
  Object.values(mockPrismaClient.job).forEach(mock => mock.mockReset());
  mockComputeQueue.add.mockReset();
}
