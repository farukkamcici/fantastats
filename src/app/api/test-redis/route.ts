import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Redis connection
    const testKey = 'test:connection';
    const testValue = { status: 'ok', timestamp: Date.now() };

    // Set a test value
    await redis.setex(testKey, 60, testValue);

    // Get it back
    const result = await redis.get(testKey);

    return NextResponse.json({
      success: true,
      message: 'Redis connection successful!',
      data: result,
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Redis connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
