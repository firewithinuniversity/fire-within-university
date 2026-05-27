import Link from "next/link";
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: "https://youtube.com/@FireWithinUniversity",
      label: "YouTube",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      href: "https://instagram.com/firewithinuniversity",
      label: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
    },
    {
      href: "https://facebook.com/firewithinuniversity",
      label: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      href: "https://x.com/firewithinu",
      label: "X (Twitter)",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-brown-deep text-cream/80 mt-0 border-t border-cream/10">
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand column */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-cream">
              Fire Within University
            </h2>
            <p className="text-sm leading-relaxed text-cream/90">
              Sermons, articles, and resources to fuel your faith. Igniting hearts for Jesus.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/50 hover:text-gold transition-colors duration-200 p-1.5"
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 pb-2 border-b border-gold/30">
              Explore
            </h3>
            <ul className="space-y-0 list-none">
              {[
                { href: "/blog", label: "Sermons & Articles" },
                { href: "/courses", label: "Courses" },
                { href: "/series", label: "Teaching Series" },
                { href: "/ethos", label: "Our Ethos" },
                { href: "/statement-of-faith", label: "Statement of Faith" },
                { href: "/resources", label: "Resources" },
                { href: "/about", label: "About Us" },
                { href: "/donate", label: "Give" },
                { href: "/contact", label: "Contact & Prayer" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-cream/80 hover:text-gold transition-colors duration-200 py-1 inline-flex items-center min-h-[44px]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 pb-2 border-b border-gold/30">
              Legal
            </h3>
            <ul className="space-y-0 list-none">
              {[
                { href: "/statement-of-faith", label: "Statement of Faith" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/contact", label: "Data Deletion Request" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-cream/80 hover:text-gold transition-colors duration-200 py-1 inline-flex items-center min-h-[44px]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Donation disclaimer */}
        <div className="border border-cream/10 rounded-xl px-5 py-4 mb-8 bg-cream/5">
          <p className="text-xs text-cream/60 max-w-2xl leading-relaxed">
            <strong className="text-cream/80">Donation Disclaimer:</strong>{" "}
            Fire Within University is not a registered 501(c)(3) nonprofit organization. Donations are not tax-deductible. We are grateful for every contribution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-cream/60 pt-6 border-t border-cream/10">
          <p>&copy; {currentYear} Fire Within University. All rights reserved.</p>
          <p className="text-gold/60 font-medium italic">Built for the Kingdom.</p>
        </div>
      </div>
    </footer>
  );
}
