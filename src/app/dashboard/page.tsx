import { DashboardHeader } from "@/components/layout";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <DashboardContent />
      </main>
    </div>
  );
}
