import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div
      className="h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd8f8 100%)",
      }}
    >
      {/* Sidebar with Hamburger Menu */}
      <AdminSidebar userName={(session.user as any)?.name || "Admin"} />

      {/* Main content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative z-10">{children}</main>
    </div>
  );
}
