"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送信しました。メール内のリンクをクリックしてからログインしてください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("メールアドレスまたはパスワードが正しくありません");
        } else {
          setError(error.message);
        }
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-800">
              <span className="text-blue-600">Ad</span>Manager
            </h1>
            <p className="text-xs text-gray-500 mt-1">広告管理ツール</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "login" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "signup" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {mode === "login" ? "ログイン" : "新規登録"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ログアウトボタンをchildrenに渡す代わりにグローバルに配置 */}
      <div className="fixed top-2 right-4 z-50">
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
        >
          ログアウト
        </button>
      </div>
      {children}
    </div>
  );
}
