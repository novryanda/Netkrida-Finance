export default function EmptyPages() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="text-4xl font-bold mb-4">🚧</div>
      <h2 className="text-2xl font-semibold mb-2">Halaman Dalam Pengembangan</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Fitur atau halaman ini sedang dalam proses pengembangan. Silakan kembali lagi nanti.
      </p>
    </div>
  );
}
