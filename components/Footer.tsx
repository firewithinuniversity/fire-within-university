import Link from "next/link";
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#3D1F0A] to-[#2A1506] text-cream/80 mt-20 border-t-4 border-gold/60">
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand column */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-cream">
              Fire Within University
            </h2>
            <p className="text-sm leading-relaxed text-cream/90">
              Sermons, articles, and resources to fuel your faith. Igniting hearts for Jesus.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 pb-2 border-b border-gold/30">
              Explore
            </h3>
            <ul className="space-y-1 list-none">
              {[
                { href: "/blog", label: "Sermons & Articles" },
                { href: "/series", label: "Teaching Series" },
                { href: "/ethos", label: "Our Ethos" },
                { href: "/resources", label: "Resources" },
                { href: "/about", label: "About Us" },
                { href: "/donate", label: "Give" },
                { href: "/contact", label: "Contact & Prayer" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-cream/80 hover:text-gold transition-colors duration-150 inline-block py-1.5 min-h-[44px] flex items-center">
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
            <ul className="space-y-1 list-none">
              {[
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/contact", label: "Data Deletion Request" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-cream/80 hover:text-gold transition-colors duration-150 inline-block py-1.5 min-h-[44px] flex items-center">
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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-cream/40 pt-6 border-t border-cream/10">
          <p>&copy; {currentYear} Fire Within University. All rights reserved.</p>
          <p className="text-gold/60 font-medium italic">Built for the Kingdom.</p>
        </div>
      </div>
    </footer>
  );
}
