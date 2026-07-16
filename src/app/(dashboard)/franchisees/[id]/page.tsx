import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FRANCHISEE_STATUS_LABELS, FRANCHISEE_STATUSES } from "@/lib/franchisee-status";
import { addFranchiseeActivity, updateFranchiseeStatus } from "../actions";

export default async function FranchiseeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: franchisee } = await supabase
    .from("franchisees")
    .select("id, full_name, email, phone, zone, status")
    .eq("id", id)
    .maybeSingle();

  if (!franchisee) notFound();

  const { data: activities } = await supabase
    .from("franchisee_activities")
    .select("id, note, created_at")
    .eq("franchisee_id", id)
    .order("created_at", { ascending: false });

  const boundUpdateStatus = updateFranchiseeStatus.bind(null, id);
  const boundAddActivity = addFranchiseeActivity.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold">{franchisee.full_name}</h1>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-500">
          {franchisee.email && (
            <>
              <dt>Email</dt>
              <dd>{franchisee.email}</dd>
            </>
          )}
          {franchisee.phone && (
            <>
              <dt>Téléphone</dt>
              <dd>{franchisee.phone}</dd>
            </>
          )}
          {franchisee.zone && (
            <>
              <dt>Zone</dt>
              <dd>{franchisee.zone}</dd>
            </>
          )}
        </dl>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-medium">Statut</h2>
        <form action={boundUpdateStatus} className="flex items-center gap-3">
          <select
            name="status"
            defaultValue={franchisee.status}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {FRANCHISEE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {FRANCHISEE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Mettre à jour
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-medium">Notes</h2>
        <form action={boundAddActivity} className="mb-4 flex gap-3">
          <input
            name="note"
            type="text"
            required
            placeholder="Ajouter une note..."
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Ajouter
          </button>
        </form>

        {activities && activities.length === 0 && (
          <p className="text-sm text-zinc-500">Aucune note pour le moment.</p>
        )}

        <ul className="space-y-3">
          {activities?.map((activity) => (
            <li key={activity.id} className="text-sm">
              <p>{activity.note}</p>
              <p className="text-xs text-zinc-400">
                {new Date(activity.created_at).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
