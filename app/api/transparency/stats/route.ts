import { NextResponse } from "next/server";

export async function GET() {
    // TODO: Replace with real DB queries when backend is ready
    const stats = {
        totalFundsDistributed: 0,
        totalContributorsPaid: 0,
        totalProjectsFunded: 0,
        averagePayoutTimeDays: 0,
    };

    return NextResponse.json(stats);
}