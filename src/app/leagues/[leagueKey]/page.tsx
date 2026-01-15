import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

// Redirect old league detail route to new dashboard
export default async function LeagueDetailPage({ params }: PageProps) {
  const { leagueKey } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Redirect to the new team page for this league
  redirect(`/dashboard/${leagueKey}/team`);
}
