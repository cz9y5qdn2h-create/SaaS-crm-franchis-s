import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/organization";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organization = await getCurrentOrganization();

  if (!organization) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Essaimo</span>
          <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/franchisees" className="hover:text-zinc-900 dark:hover:text-white">
              Franchisés
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span>{organization.name}</span>
          <form action={signOut}>
            <button type="submit" className="hover:text-zinc-900 dark:hover:text-white">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">{children}</main>
    </div>
  );
}
