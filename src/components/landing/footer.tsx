import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/netkrida.png"
                alt="Netkrida Logo"
                className="h-10 w-auto object-contain"
                draggable="false"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sistem manajemen keuangan modern yang membantu perusahaan mengelola finance dengan lebih efisien.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-green-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-slate-400 hover:text-green-400 transition-colors text-sm"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="/#roles"
                  className="text-slate-400 hover:text-green-400 transition-colors text-sm"
                >
                  Role Akses
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-slate-400 hover:text-green-400 transition-colors text-sm"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-bold mb-4">Fitur</h3>
            <ul className="space-y-3">
              <li className="text-slate-400 text-sm">Project Management</li>
              <li className="text-slate-400 text-sm">Reimbursement System</li>
              <li className="text-slate-400 text-sm">Financial Reports</li>
              <li className="text-slate-400 text-sm">User Management</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">contact@netkrida.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">+62 xxx xxxx xxxx</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} NETKRIDA Finance System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-slate-400 hover:text-green-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-green-400 transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
