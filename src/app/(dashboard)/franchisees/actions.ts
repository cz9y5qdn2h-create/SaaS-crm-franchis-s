"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/organization";
import { FRANCHISEE_STATUSES } from "@/lib/franchisee-status";

export async function createFranchisee(formData: FormData) {
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/login");

  const supabase = await createClient();

  const { error } = await supabase.from("franchisees").insert({
    organization_id: organization.id,
    full_name: formData.get("fullName") as string,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    zone: (formData.get("zone") as string) || null,
  });

  if (error) {
    redirect(`/franchisees/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/franchisees");
  redirect("/franchisees");
}

export async function updateFranchiseeStatus(franchiseeId: string, formData: FormData) {
  const status = formData.get("status") as string;

  if (!FRANCHISEE_STATUSES.includes(status as (typeof FRANCHISEE_STATUSES)[number])) {
    throw new Error("Statut invalide");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("franchisees")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", franchiseeId);

  if (error) throw new Error(error.message);

  revalidatePath(`/franchisees/${franchiseeId}`);
  revalidatePath("/franchisees");
}

export async function addFranchiseeActivity(franchiseeId: string, formData: FormData) {
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/login");

  const note = formData.get("note") as string;
  if (!note?.trim()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("franchisee_activities").insert({
    franchisee_id: franchiseeId,
    organization_id: organization.id,
    author_id: user?.id ?? null,
    note,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/franchisees/${franchiseeId}`);
}
