import Link from "next/link";
import { Package, Github, Twitter, Linkedin } from "lucide-react";
import { formatCompact, stripHtml } from "@/lib/utils";
import { getAllSettings } from "@/lib/settings";

type FooterLink = { label: string; href: string };
type FooterCol = { title: string; links: FooterLink[] };

export async function Footer() {
  const s = await getAllSettings();
  const siteName = stripHtml(String(s["general.siteName"] ?? "CodeBazaar"));
  const about = stripHtml(
    String(
      s["footer.aboutText"] ??
        "The marketplace for high-quality code, scripts, plugins, and digital assets."
    )
  );
  const copyright = stripHtml(
    String(s["footer.copyright"] ?? `© ${siteName}. All prices in USD.`)
  );
  const totalSold = Number(s["homepage.statsSold"] ?? 128450);
  const earnings = Number(s["homepage.statsEarnings"] ?? 4250000);
  const columns = (Array.isArray(s["footer.columns"])
    ? (s["footer.columns"] as FooterCol[])
    : [
        {
          title: "Marketplace",
          links: [
            { label: "License Types", href: "/pricing/licenses" },
            { label: "Terms of Use", href: "/page/terms" },
          ],
        },
        {
          title: "Help",
          links: [
            { label: "Help Center", href: "/page/help" },
            { label: "Contact Support", href: "/page/contact" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/page/about" },
            { label: "Privacy Policy", href: "/page/privacy" },
          ],
        },
      ]) as FooterCol[];
  const social = (s["footer.social"] as Record<string, string>) || {};

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Package className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold">{siteName}</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400">{about}</p>
            <p className="mt-4 text-xs text-slate-500">
              {formatCompact(totalSold)} items sold · {formatCompact(earnings)} earned
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {(col.links || []).map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="hover:text-emerald-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <p>{copyright}</p>
          <div className="flex gap-3">
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                <Twitter className="h-4 w-4 hover:text-white" />
              </a>
            )}
            {social.github && (
              <a href={social.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github className="h-4 w-4 hover:text-white" />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4 hover:text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
