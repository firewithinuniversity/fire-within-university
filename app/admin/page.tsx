import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = (await getServerSession(authOptions))!;
  // Auth is enforced by app/admin/template.tsx — session is guaranteed non-null here

  let totalUsers = 0;
  let totalCompletions = 0;
  let unreadMessages = 0;
  let recentUsers: { name: string | null; email: string; createdAt: Date }[] = [];

  try {
    [totalUsers, totalCompletions, unreadMessages, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.lessonProgress.count(),
        prisma.contactSubmission.count({ where: { read: false } }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { name: true, email: true, createdAt: true },
        }),
      ]);
  } catch (err) {
    console.error("[Admin Dashboard] Database error:", err);
  }

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      href: "/admin/users",
      accent: "from-orange/90 to-orange-hover",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    },
    {
      label: "Lessons Completed",
      value: totalCompletions,
      href: "/admin/analytics",
      accent: "from-gold to-gold-dark",
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Unread Messages",
      value: unreadMessages,
      href: "/admin/contacts",
      accent: "from-brown-light to-brown",
      icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    },
  ];

  const quickLinks = [
    { href: "/studio", label: "Sanity Studio", desc: "Manage content", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
    { href: "/blog", label: "View Sermons", desc: "Public blog", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
    { href: "/courses", label: "View Courses", desc: "Course catalog", icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
    { href: "/admin/game", label: "Kindling Game", desc: "Take a break", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
  ];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 pt-16 md:pt-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-orange font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-brown">Dashboard</h1>
        <p className="text-sm text-brown/50 mt-1">
          Welcome back, {session.user.name ?? "Admin"}.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative bg-white rounded-2xl p-5 shadow-sm border border-brown/[0.06] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-brown/50 font-medium">{s.label}</p>
                <p className="text-4xl font-bold text-brown mt-1 tracking-tight">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-cream shadow-sm`}>
                <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brown/40 group-hover:text-orange transition-colors">
              View details
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent sign-ups */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-brown/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-brown">Recent Sign-ups</h2>
            <Link href="/admin/users" className="text-xs font-semibold text-orange hover:text-orange-hover transition-colors">
              View all →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-brown/40 py-6 text-center">No users yet.</p>
          ) : (
            <ul className="space-y-1">
              {recentUsers.map((u) => {
                const initial = (u.name?.[0] ?? u.email[0] ?? "?").toUpperCase();
                return (
                  <li key={u.email} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-cream/60 transition-colors min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-orange/90 to-orange-hover text-cream flex items-center justify-center text-sm font-bold">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brown truncate">{u.name ?? "—"}</p>
                      <p className="text-xs text-brown/45 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-brown/35 shrink-0">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-brown/[0.06]">
          <h2 className="font-semibold text-brown mb-5">Quick Links</h2>
          <div className="space-y-2">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex items-center gap-3 p-3 -mx-1 rounded-xl border border-transparent hover:border-orange/20 hover:bg-cream/60 transition-all"
              >
                <div className="w-9 h-9 shrink-0 rounded-lg bg-cream flex items-center justify-center text-brown/60 group-hover:text-orange group-hover:bg-orange/[0.08] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brown">{l.label}</p>
                  <p className="text-xs text-brown/45">{l.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
