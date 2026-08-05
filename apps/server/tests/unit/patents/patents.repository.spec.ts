import { describe, it, expect, vi } from 'vitest';
import { PatentsRepository } from '../../../src/modules/patents/repositories/patents.repository.js';
import type { PrismaClient } from '@prisma/client';

describe('PatentsRepository Unit Tests', () => {
  const mockPatent = {
    id: 'pat-100',
    patentNumber: 'US98765432',
    title: 'Autonomous Drone Navigation System',
    abstract: 'A system and method for drone navigation using optical sensors.',
    claims: ['1. A drone navigation system.'],
    ipcClassifications: ['G06F 17/30'],
    description: null,
    filingDate: null,
    grantDate: null,
    inventors: ['John Doe'],
    assignee: 'Tech Corp',
    cleanedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    patent: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === 'pat-100' || where.patentNumber === 'US98765432') {
          return Promise.resolve(mockPatent);
        }
        return Promise.resolve(null);
      }),
      findMany: vi.fn().mockResolvedValue([mockPatent]),
      create: vi.fn().mockResolvedValue(mockPatent),
    },
  } as unknown as PrismaClient;

  const repository = new PatentsRepository(mockPrisma);

  it('should find patent by ID via Prisma', async () => {
    const result = await repository.findById('pat-100');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('pat-100');
    expect(result?.patentNumber).toBe('US98765432');
  });

  it('should find patent by patent number via Prisma', async () => {
    const result = await repository.findByPatentNumber('US98765432');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Autonomous Drone Navigation System');
  });

  it('should list patents with filters via Prisma', async () => {
    const results = await repository.listWithFilters({ searchQuery: 'Drone', limit: 10 });
    expect(results.length).toBe(1);
    expect(results[0]?.patentNumber).toBe('US98765432');
  });

  it('should insert a new patent record into Prisma', async () => {
    const newPatentData = {
      patentNumber: 'US98765432',
      title: 'Autonomous Drone Navigation System',
      abstract: 'A system and method for drone navigation using optical sensors.',
      claims: ['1. A drone navigation system.'],
      ipcClassifications: ['G06F 17/30'],
    };

    const inserted = await repository.insert(newPatentData);
    expect(inserted.id).toBe('pat-100');
    expect(inserted.title).toBe('Autonomous Drone Navigation System');
  });
});
