import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const computation = await prisma.computation.findUnique({
      where: { id },
      include: { jobs: true }
    });
    
    if (!computation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(computation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch computation' },
      { status: 500 }
    );
  }
}