import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';

// Initialize Pinata SDK on server side
const pinata = new PinataSDK({
  pinataApiKey: process.env.IPFS_PINATA_API_KEY!,
  pinataSecretApiKey: process.env.IPFS_PINATA_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { hash, metadata } = await request.json();

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    // Pin file by hash
    await pinata.pinByHash(hash, {
      pinataMetadata: metadata ? {
        name: metadata.name || hash
      } : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'File pinned successfully'
    });

  } catch (error) {
    console.error('IPFS pin error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to pin file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
