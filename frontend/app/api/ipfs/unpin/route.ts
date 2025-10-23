import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';

// Initialize Pinata SDK on server side
const pinata = new PinataSDK({
  pinataApiKey: process.env.IPFS_PINATA_API_KEY!,
  pinataSecretApiKey: process.env.IPFS_PINATA_SECRET_KEY!,
});

export async function DELETE(request: NextRequest) {
  try {
    const { hash } = await request.json();

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    // Unpin file
    await pinata.unpin(hash);

    return NextResponse.json({
      success: true,
      message: 'File unpinned successfully'
    });

  } catch (error) {
    console.error('IPFS unpin error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unpin file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
