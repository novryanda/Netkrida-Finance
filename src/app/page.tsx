import Link from "next/link";
import { Building2, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex items-center gap-4">
          <Building2 className="h-16 w-16 text-[hsl(280,100%,70%)]" />
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            NETKRIDA
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-[hsl(280,100%,70%)]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Finance Management System
            </h2>
          </div>
          <p className="text-center text-lg text-white/80 max-w-2xl">
            Sistem manajemen keuangan terintegrasi untuk mengelola project, pengeluaran, 
            dan reimbursement dengan mudah dan efisien.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 mt-8">
          <Link
            href="/auth/login"
            className="rounded-lg bg-[hsl(280,100%,70%)] px-10 py-4 text-xl font-semibold text-white shadow-lg hover:bg-[hsl(280,100%,60%)] transition-all hover:scale-105 cursor-pointer"
          >
            Login ke Dashboard
          </Link>
          
          <p className="text-sm text-white/60">
            Silakan login untuk mengakses dashboard sesuai role Anda
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          <div className="flex flex-col gap-2 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-[hsl(280,100%,70%)]">Admin</h3>
            <p className="text-sm text-white/80">
              Full access - Kelola project, approve reimbursement, dan monitor seluruh aktivitas
            </p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-[hsl(280,100%,70%)]">Finance</h3>
            <p className="text-sm text-white/80">
              Handle payment - Proses pembayaran reimbursement yang sudah di-approve
            </p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-[hsl(280,100%,70%)]">Staff</h3>
            <p className="text-sm text-white/80">
              Submit reimbursement - Ajukan pengeluaran dan track status reimbursement
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
