import { createClient } from "@/lib/supabase/server";

export async function getCurrentOrganization() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // MVP : un utilisateur appartient à une seule organisation.
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  return {
    id: membership.organization_id as string,
    name: (membership.organizations as unknown as { name: string } | null)?.name ?? "",
  };
}
