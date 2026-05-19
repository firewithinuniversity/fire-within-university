import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-brown text-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-xl font-bold">FWU Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-cream/70">{session.user.name}</span>
          <Link href="/" className="text-sm text-cream/50 hover:text-cream transition-colors">
            Back to Site
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="font-serif text-3xl font-bold text-brown mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/10">
            <h3 className="font-semibold text-brown mb-2">Content</h3>
            <p className="text-sm text-brown/60">Manage posts, series, and site content through Sanity Studio.</p>
            <Link
              href="/studio"
              className="inline-block mt-4 text-sm font-medium text-orange hover:text-orange-hover transition-colors"
            >
              Open Studio →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/10">
            <h3 className="font-semibold text-brown mb-2">Quick Links</h3>
            <ul className="space-y-2 mt-3 text-sm">
              <li>
                <Link href="/blog" className="text-brown/70 hover:text-orange transition-colors">
                  View Blog →
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-brown/70 hover:text-orange transition-colors">
                  View Series →
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-brown/70 hover:text-orange transition-colors">
                  Donate Page →
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/10">
            <h3 className="font-semibold text-brown mb-2">Account</h3>
            <p className="text-sm text-brown/60">
              Signed in as <span className="font-medium">{session.user.email}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
