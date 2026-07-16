"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationName = formData.get("organizationName") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    // Confirmation email requise avant de pouvoir créer l'organisation
    // (une session est nécessaire pour l'appel RPC ci-dessous).
    redirect("/login?error=" + encodeURIComponent("Vérifiez votre email pour confirmer votre compte."));
  }

  const { error: orgError } = await supabase.rpc("create_organization", {
    org_name: organizationName,
  });

  if (orgError) {
    redirect(`/signup?error=${encodeURIComponent(orgError.message)}`);
  }

  redirect("/franchisees");
}
