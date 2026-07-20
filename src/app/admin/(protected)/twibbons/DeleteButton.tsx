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
      className="text-center font-extrabold uppercase tracking-widest text-xs px-3 py-2.5 rounded-xl transition-all disabled:opacity-50"
      style={{
        background: "rgba(239, 68, 68, 0.12)",
        color: "#dc2626",
      }}
    >
      {isPending ? "MENGHAPUS..." : "HAPUS"}
    </button>
  );
}
