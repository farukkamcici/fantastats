import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/yahoo/user/profile
 * 
 * Fetches the specific Yahoo Fantasy profile (nickname, avatar)
 * by looking up the user's teams. This resolves the generic "Yahoo User" issue.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in" },
        { status: 401 }
      );
    }

    const client = createYahooClient(session.accessToken);
    // Fetch all teams the user owns. We only need one to get the manager profile.
    const teams = await client.getMyTeamsAcrossLeagues();

    // Find the first team that has manager info
    const profile = teams.find(t => t.managers && t.managers.length > 0)?.managers?.[0];

    if (!profile) {
        return NextResponse.json({ success: false, message: "No profile found" });
    }

    return NextResponse.json({
      success: true,
      profile: {
        nickname: profile.nickname,
        image_url: profile.imageUrl
      }
    });

  } catch (error) {
    console.error("Error in /api/yahoo/user/profile:", error);
    return NextResponse.json(
      { error: "InternalError", message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
