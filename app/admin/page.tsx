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
    { label: "Total Users", value: totalUsers, href: "/admin/users" },
    { label: "Lessons Completed", value: totalCompletions, href: "/admin/analytics" },
    { label: "Unread Messages", value: unreadMessages, href: "/admin/contacts" },
  ];

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-brown">Dashboard</h1>
        <p className="text-sm text-brown/50 mt-1">
          Welcome back, {session.user.name ?? "Admin"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-brown/[0.06] hover:border-orange/30 transition-colors group"
          >
            <p className="text-sm text-brown/50 font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-brown mt-1 group-hover:text-orange transition-colors">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/[0.06]">
          <h2 className="font-semibold text-brown mb-4">Recent Sign-ups</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-brown/40">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((u) => (
                <li key={u.email} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-brown font-medium">{u.name ?? "—"}</span>
                    <span className="text-brown/40 ml-2">{u.email}</span>
                  </div>
                  <span className="text-brown/30 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/[0.06]">
          <h2 className="font-semibold text-brown mb-4">Quick Links</h2>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/studio" className="text-brown/70 hover:text-orange transition-colors">
                Sanity Studio (Content) →
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-brown/70 hover:text-orange transition-colors">
                View Blog →
              </Link>
            </li>
            <li>
              <Link href="/courses" className="text-brown/70 hover:text-orange transition-colors">
                View Courses →
              </Link>
            </li>
            <li>
              <Link href="/admin/game" className="text-brown/70 hover:text-orange transition-colors">
                Kindling Game →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
