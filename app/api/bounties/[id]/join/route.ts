import { NextResponse } from 'next/server';
import { BountyStore } from '@/lib/store';
import { MilestoneParticipation } from '@/types/participation';

const generateId = () => crypto.randomUUID();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bountyId } = await params;

    try {
        const body = await request.json();
        const { contributorId } = body;

        if (!contributorId) {
            return NextResponse.json({ error: 'Missing contributorId' }, { status: 400 });
        }

        // Check if already joined
        const existing = BountyStore.getMilestoneParticipationsByBounty(bountyId)
            .find(p => p.contributorId === contributorId);

        if (existing) {
            return NextResponse.json({ error: 'Already joined this bounty' }, { status: 409 });
        }

        const participation: MilestoneParticipation = {
            id: generateId(),
            bountyId,
            contributorId,
            currentMilestone: 1, // Start at milestone 1
            status: 'active',
            joinedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString()
        };

        BountyStore.addMilestoneParticipation(participation);

        return NextResponse.json({ success: true, data: participation });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
