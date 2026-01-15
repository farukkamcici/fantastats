import { DashboardHeader } from "@/components/layout";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LeagueLayoutClient } from "./LeagueLayoutClient";

interface LeagueLayoutProps {
  children: React.ReactNode;
  params: Promise<{ leagueKey: string }>;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const session = await getServerSession(authOptions);
  const { leagueKey } = await params;
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <DashboardHeader />
      <LeagueLayoutClient leagueKey={leagueKey}>
        {children}
      </LeagueLayoutClient>
    </div>
  );
}
