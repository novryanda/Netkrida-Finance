"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useState, useEffect } from "react";
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Show button when scrollY > 300
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global login handler for both header and main page
  const handleLogin = () => {
    setLoading(true);
    setProgress(25);
  };

  // Animate progress: 25 -> 50 -> 100, then redirect
  useEffect(() => {
    if (!loading) return;
    if (progress === 25) {
      const t = setTimeout(() => setProgress(50), 350);
      return () => clearTimeout(t);
    }
    if (progress === 50) {
      const t = setTimeout(() => setProgress(100), 350);
      return () => clearTimeout(t);
    }
    if (progress === 100) {
      const t = setTimeout(() => {
        router.push("/auth/login");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [loading, progress, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <Header onLogin={handleLogin} />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <AnimatedCircularProgressBar
            value={progress}
            gaugePrimaryColor="#22c55e"
            gaugeSecondaryColor="#bbf7d0"
            className="scale-90"
          />
        </div>
      )}

      {/* Back to Top Button */}
      {showTop && !loading && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-green-600 text-white shadow-lg hover:bg-emerald-600 transition text-2xl"
          aria-label="Kembali ke atas"
        >
          ↑
        </button>
      )}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-green-200 shadow-lg">
              
              <span className="text-sm font-medium text-green-900">Modern Finance Management</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                  NETKRIDA
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                Finance Management System
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Kelola keuangan perusahaan Anda dengan sistem terintegrasi yang modern, aman, dan efisien. 
                Dari project management hingga reimbursement approval dalam satu platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={handleLogin}
                disabled={loading}
              >
                <Wallet className="w-5 h-5" />
                Login ke Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-slate-200">
                <FileText className="w-5 h-5" />
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                100%
              </div>
              <div className="text-sm text-slate-600 font-medium">Sistem Terintegrasi</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                24/7
              </div>
              <div className="text-sm text-slate-600 font-medium">Akses Real-time</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-green-600">
                3 Role
              </div>
              <div className="text-sm text-slate-600 font-medium">User Management</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                Aman
              </div>
              <div className="text-sm text-slate-600 font-medium">Data Terenkripsi</div>
            </div>
          </div>
        </div>
      </section>

  {/* Features Section */}
  <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola keuangan perusahaan dalam satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Project Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Kelola project dengan mudah, track budget, dan monitor progress secara real-time
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Reimbursement System</h3>
              <p className="text-slate-600 leading-relaxed">
                Submit dan approve reimbursement dengan workflow yang jelas dan terstruktur
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Financial Reports</h3>
              <p className="text-slate-600 leading-relaxed">
                Dashboard analytics dan laporan keuangan yang komprehensif untuk decision making
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Role-Based Access</h3>
              <p className="text-slate-600 leading-relaxed">
                Sistem keamanan berlapis dengan role Admin, Finance, dan Staff yang terpisah
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Real-time Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor status reimbursement dan transaksi secara real-time dari mana saja
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">User Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Kelola user, assign roles, dan atur permissions dengan interface yang intuitif
              </p>
            </div>
          </div>
        </div>
      </section>

  {/* Roles Section */}
  <section id="roles" className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Akses Berdasarkan Role
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Setiap role memiliki akses dan tanggung jawab yang berbeda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch h-full">
            {/* Admin Card */}
            <div className="relative group h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-6 mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-slate-800">Admin</h3>
                <p className="text-center text-slate-600 mb-6">
                  Full access dengan kontrol penuh terhadap sistem
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Kelola semua project dan budget</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Approve/reject reimbursement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">User management dan permissions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">View semua reports dan analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Finance Card */}
            <div className="relative group h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-6 mx-auto">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-slate-800">Finance</h3>
                <p className="text-center text-slate-600 mb-6">
                  Handle pembayaran dan verifikasi transaksi
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Proses pembayaran reimbursement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Verifikasi dokumen keuangan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Monitor cash flow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Generate financial reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Staff Card */}
            <div className="relative group h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-slate-800">Staff</h3>
                <p className="text-center text-slate-600 mb-6">
                  Submit dan track reimbursement pribadi
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Submit reimbursement request</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Upload bukti transaksi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Track status approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">View reimbursement history</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 md:p-16 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Siap Memulai?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Bergabunglah dengan sistem finance management yang modern dan efisien
              </p>
              <div className="pt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-white text-green-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
                >
                  Login Sekarang
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

