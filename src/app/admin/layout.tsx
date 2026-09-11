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

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
