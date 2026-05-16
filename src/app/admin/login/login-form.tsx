"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/orders";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "ログインに失敗しました");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-5xl">🍔</span>
          <h1 className="mt-3 text-2xl font-extrabold text-white">
            OSAKI 亭
          </h1>
          <p className="mt-1 text-sm text-slate-400">管理者ログイン</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-1" />
          <form onSubmit={handleLogin} className="space-y-4 p-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-xl border-slate-200 py-5"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-slate-700">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={8}
                className="rounded-xl border-slate-200 py-5"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
