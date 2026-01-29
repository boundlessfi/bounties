import { NextResponse } from 'next/server';
import { BountyStore } from '@/lib/store';
import { SubmissionStatus } from '@/types/participation';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: subId } = await params;

    try {
        const body = await request.json();
        // 'accepted' implies winner
        const { status, feedback } = body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedSub = BountyStore.updateSubmission(subId, {
            status: status as SubmissionStatus,
            feedback,
            reviewedAt: new Date().toISOString()
        });

        if (!updatedSub) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedSub });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
