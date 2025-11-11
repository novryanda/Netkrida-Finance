# Netkrida Finance

Netkrida Finance adalah aplikasi sistem keuangan internal berbasis web untuk PT Netkrida Aditama, dibangun menggunakan Next.js, Prisma, NextAuth, dan Tailwind CSS.

## Fitur Utama
- Manajemen proyek dan keuangan
- Pengelolaan user dan otorisasi (RBAC)
- Laporan keuangan
- Reimburse dan pengeluaran
- Pengaturan profil dan password

## Teknologi
- Next.js
- NextAuth.js
- Prisma ORM
- Tailwind CSS
- tRPC

## Instalasi & Setup
1. Clone repository:
	```bash
	git clone https://github.com/novryanda/Netkrida-Finance.git
	cd Netkrida-Finance
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Copy file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database serta environment lain.
4. Jalankan migrasi database:
	```bash
	npx prisma migrate deploy
	```
5. Jalankan aplikasi:
	```bash
	npm run dev
	```

## Dokumentasi
Lihat folder `docs/` untuk dokumentasi modul dan panduan penggunaan.

## Kontribusi
Pull request dan issue sangat terbuka untuk pengembangan lebih lanjut.

---
PT Netkrida Aditama © 2025
