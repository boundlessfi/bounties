import { NextResponse } from 'next/server';
import { BountyStore } from '@/lib/store';
import { Application } from '@/types/participation';

const generateId = () => crypto.randomUUID();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bountyId } = await params;
    try {
        const body = await request.json();
        const { applicantId, coverLetter, portfolioUrl } = body;

        if (!applicantId || !coverLetter) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const application: Application = {
            id: generateId(),
            bountyId: bountyId,
            applicantId,
            coverLetter,
            portfolioUrl,
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        BountyStore.addApplication(application);

        return NextResponse.json({ success: true, data: application });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
