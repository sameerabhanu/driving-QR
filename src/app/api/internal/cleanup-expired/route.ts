import { NextResponse } from "next/server";
import { deleteExpiredPagesAction } from "@/actions/pages";

// Cron-triggered cleanup of expired pages. Protected by a bearer secret so it
// cannot be invoked publicly.
export async function GET(request: Request) {
    const auth = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await deleteExpiredPagesAction();
    return NextResponse.json({ deleted });
}
