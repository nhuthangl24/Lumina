"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3588&auto=format&fit=crop"
          alt="Lost in space"
          fill
          className="object-cover opacity-50 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/20 p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-lg mx-4">
        <div className="text-8xl font-heading font-bold text-white mb-4 drop-shadow-xl">
          404
        </div>
        <h1 className="text-2xl font-semibold text-white mb-4">
          Looks like you wandered too far.
        </h1>
        <p className="text-white/60 mb-8">
          The study room you are looking for does not exist or has been moved. Let's get back to focusing.
        </p>
        <Link 
          href="/"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Room
        </Link>
      </div>
    </div>
  );
}
