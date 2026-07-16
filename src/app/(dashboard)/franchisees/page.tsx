import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FRANCHISEE_STATUS_LABELS, type FranchiseeStatus } from "@/lib/franchisee-status";

export default async function FranchiseesPage() {
  const supabase = await createClient();
  const { data: franchisees, error } = await supabase
    .from("franchisees")
    .select("id, full_name, email, zone, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Franchisés</h1>
        <Link
          href="/franchisees/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          + Nouveau franchisé
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      {franchisees && franchisees.length === 0 && (
        <p className="text-sm text-zinc-500">
          Aucun franchisé pour le moment. Ajoute le premier candidat de ton réseau.
        </p>
      )}

      {franchisees && franchisees.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Zone</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {franchisees.map((franchisee) => (
                <tr
                  key={franchisee.id}
                  className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <Link href={`/franchisees/${franchisee.id}`} className="font-medium hover:underline">
                      {franchisee.full_name}
                    </Link>
                    {franchisee.email && (
                      <div className="text-xs text-zinc-500">{franchisee.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{franchisee.zone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                      {FRANCHISEE_STATUS_LABELS[franchisee.status as FranchiseeStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
