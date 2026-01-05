import { LoginButton } from "@/components/auth/LoginButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🏀</span>
            <span className="text-2xl font-bold text-white">Fantastats</span>
          </Link>
          <LoginButton />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Yahoo Fantasy Basketball
            <span className="text-purple-300"> Companion</span>
          </h1>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Track your stats, analyze matchups, plan your streaming pickups, and dominate your fantasy basketball league.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LoginButton className="text-lg px-8 py-4" />
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📊"
            title="Live Stats"
            description="Track your weekly and season stats in real-time. See how you're performing against the league."
          />
          <FeatureCard
            icon="⚔️"
            title="Matchup Analysis"
            description="View your current matchup with detailed category breakdowns and projections."
          />
          <FeatureCard
            icon="📅"
            title="NBA Schedule"
            description="See how many games each player has this week to optimize your streaming strategy."
          />
          <FeatureCard
            icon="🎯"
            title="Streaming Planner"
            description="Find the best free agents based on schedule and category needs."
          />
          <FeatureCard
            icon="📥"
            title="CSV Export"
            description="Export your stats and roster data to analyze in your favorite spreadsheet."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Private"
            description="We only read your data through Yahoo's official API. Your credentials are never stored."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏀</span>
            <span className="text-lg font-semibold text-white">Fantastats</span>
          </div>
          <p className="text-purple-300 text-sm">
            Not affiliated with Yahoo. Built for fantasy basketball enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/15 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-purple-200">{description}</p>
    </div>
  );
}
