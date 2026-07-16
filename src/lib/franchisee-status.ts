export const FRANCHISEE_STATUSES = [
  "lead",
  "qualifie",
  "dossier_envoye",
  "contrat_en_signature",
  "actif",
  "resilie",
] as const;

export type FranchiseeStatus = (typeof FRANCHISEE_STATUSES)[number];

export const FRANCHISEE_STATUS_LABELS: Record<FranchiseeStatus, string> = {
  lead: "Lead",
  qualifie: "Qualifié",
  dossier_envoye: "Dossier envoyé",
  contrat_en_signature: "Contrat en signature",
  actif: "Actif",
  resilie: "Résilié",
};
