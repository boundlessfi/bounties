import { NextResponse } from 'next/server';
import { BountyStore } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bountyId } = await params;
    const applications = BountyStore.getApplicationsByBounty(bountyId);
    return NextResponse.json({ data: applications });
}
