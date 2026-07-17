import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, isAuthConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <LoginForm configured={isAuthConfigured()} />;
}
