"use client";

import { useTransition } from "react";
import { deleteTwibbon } from "@/app/actions/twibbonActions";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus twibbon ini? Aksi ini tidak dapat dibatalkan.")) {
      startTransition(async () => {
        try {
          await deleteTwibbon(id);
        } catch (error) {
          alert("Gagal menghapus twibbon");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 font-black uppercase tracking-widest text-xs px-3 py-3 rounded-xl transition-colors disabled:opacity-50"
    >
      {isPending ? "MENGHAPUS..." : "HAPUS"}
    </button>
  );
}
