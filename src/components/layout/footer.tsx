import Link from "next/link";
import { Package, Github, Twitter, Linkedin } from "lucide-react";
import { formatCompact } from "@/lib/utils";

interface FooterProps {
  totalSold?: number;
  communityEarnings?: number;
}

export function Footer({
  totalSold = 128450,
  communityEarnings = 4250000,
}: FooterProps) {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Package className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold">CodeBazaar</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              The marketplace for high-quality code, scripts, plugins, and
              digital assets created by independent developers.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing/licenses" className="hover:text-emerald-400">
                  License Types
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Help
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-emerald-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/authors/top" className="hover:text-emerald-400">
                  Top Authors
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-emerald-400">
                  Collections
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-lg bg-slate-800/50 px-6 py-4 text-sm">
          <div>
            <span className="font-bold text-emerald-400">
              {formatCompact(totalSold)}
            </span>{" "}
            items sold
          </div>
          <div className="hidden h-4 w-px bg-slate-600 sm:block" />
          <div>
            <span className="font-bold text-emerald-400">
              ${formatCompact(communityEarnings)}
            </span>{" "}
            community earnings
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CodeBazaar. All prices in USD.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-white" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
