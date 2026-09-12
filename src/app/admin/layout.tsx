import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

import { redirect } from "next/navigation";

export default function AdminRootLayout() {
  redirect("https://unsoed.link/app/twibbons");
}
