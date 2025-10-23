import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';

// Initialize Pinata SDK on server side
const pinata = new PinataSDK({
  pinataApiKey: process.env.IPFS_PINATA_API_KEY!,
  pinataSecretApiKey: process.env.IPFS_PINATA_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        console.warn('Invalid metadata provided');
      }
    }

    // Upload file to Pinata
    const response = await pinata.pinFileToIPFS(file, {
      pinataMetadata: {
        name: parsedMetadata.name || file.name,
        keyvalues: parsedMetadata.keyvalues || {}
      },
      pinataOptions: {
        cidVersion: 0,
        wrapWithDirectory: false
      }
    });

    return NextResponse.json({
      success: true,
      hash: response.IpfsHash,
      size: file.size,
      url: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${response.IpfsHash}`,
      name: file.name,
      type: file.type
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file to IPFS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
