"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex items-center justify-center space-x-2 w-full py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-red-600 transition-all hover:bg-red-50 border"
      style={{
        borderColor: "rgba(239, 68, 68, 0.2)",
        background: "rgba(239, 68, 68, 0.05)",
      }}
    >
      <LogOut size={16} />
      <span>Keluar</span>
    </button>
  );
}
