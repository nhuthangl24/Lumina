"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
    }
  };
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=3540&auto=format&fit=crop"
          alt="Login Background"
          fill
          className="object-cover opacity-50 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 bg-black/60 backdrop-blur-2xl border border-white/20 p-10 rounded-3xl shadow-2xl w-full max-w-md mx-4">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Space
        </Link>
        
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/60 text-sm mb-8">Log in to sync your coins, access your inventory, and study with friends.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-white text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl shadow-lg transition-transform active:scale-95 mt-4 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-white/50">Don't have an account?</span>
          <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}
