import { NextResponse } from 'next/server';
import { BountyStore } from '@/lib/store';
import { ApplicationStatus } from '@/types/participation';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: appId } = await params;

    try {
        const body = await request.json();
        const { status, feedback } = body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedApp = BountyStore.updateApplication(appId, {
            status: status as ApplicationStatus,
            feedback,
            reviewedAt: new Date().toISOString()
        });

        if (!updatedApp) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedApp });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
