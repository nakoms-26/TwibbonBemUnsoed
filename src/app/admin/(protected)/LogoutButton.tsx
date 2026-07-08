"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="w-full text-center px-4 py-3 text-sm font-black uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-md border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
    >
      LOGOUT
    </button>
  );
}
