import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      {/* ヒーローセクション */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <span className="text-7xl">🍔</span>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-6xl">
            OSAKI 亭
          </h1>
          <p className="mt-3 text-xl font-medium text-white/90">
            West Coast Casual Dining
          </p>
          <p className="mx-auto mt-2 max-w-md text-base text-white/70">
            カリフォルニアスタイルの親しみあるダイニング体験をお届けします
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/order"
              className="flex h-14 w-56 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-lg font-bold text-orange-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              🍽️ メニューを見る
            </Link>
            <Link
              href="/admin/login"
              className="flex h-14 w-56 items-center justify-center gap-2 rounded-2xl border-2 border-white/40 px-8 text-lg font-bold text-white transition-all hover:border-white hover:bg-white/10"
            >
              🔐 管理画面
            </Link>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-slate-800 py-6 text-center text-sm text-slate-400">
        <p>&copy; 2025 OSAKI 亭 &mdash; West Coast Casual Dining</p>
      </footer>
    </div>
  );
}
