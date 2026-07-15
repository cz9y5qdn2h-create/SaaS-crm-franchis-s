# Cadrage produit — CRM Franchisés (écosystème iralink Agency)

> Document de brainstorm / cadrage avant développement. À valider/amender avant de lancer le build.

## 1. Pitch

Un CRM léger et abordable (~15 €/mois) dédié à la gestion des **réseaux de franchisés** : centraliser les candidats franchisés, faire signer électroniquement les contrats, suivre le cycle de vie de chaque franchisé, et récupérer automatiquement les leads/contacts depuis **DipPro** (la plateforme utilisée par iralink Agency — `iralink-agency.dippro.business`).

Positionnement : moins cher qu'un CRM généraliste (HubSpot, etc.) car le périmètre est volontairement restreint à un métier précis (gestion de franchise), donc moins de risque produit et un coût d'infra/dev plus faible → prix bas défendable.

**⚠️ Point à confirmer** : je n'ai pas pu récupérer le contenu de `iralink-agency.dippro.business` (limite d'accès web atteinte cette session). Je pars du principe que DipPro est la plateforme d'agence (type marque blanche CRM/marketing automation) qu'utilise iralink pour gérer ses propres clients/leads, et que ce nouveau SaaS doit en importer les contacts (candidats franchisés). À confirmer, et idéalement fournir : accès à la doc API DipPro (si elle existe), ou des identifiants API de test.

## 2. Cible & modèle économique

- **Utilisateurs** : franchiseurs (têtes de réseau) qui gèrent leurs franchisés — pas les franchisés eux-mêmes en tant qu'acheteurs (sauf portail dédié, voir V2).
- **Prix envisagé** : ~15 €/mois par franchiseur (abonnement simple, pas de paliers complexes au lancement).
- **Pourquoi c'est tenable à ce prix** : périmètre restreint (pas de marketing automation, pas de facturation complexe), infra mutualisée (Supabase + Vercel), signature électronique refacturée à l'usage plutôt qu'incluse à volonté.

## 3. Périmètre MVP (V1 — cible Q4 2026)

1. **Auth & organisations** — un compte = une organisation (le franchiseur), multi-utilisateurs (équipe du franchiseur) avec rôles simples (admin / membre).
2. **Fiche franchisé (CRM core)** — pipeline par statut (ex : Lead → Qualifié → Dossier envoyé → Contrat en signature → Signé/Actif → Résilié), infos de contact, notes, historique d'activité, tags/zone géographique.
3. **Import DipPro** — synchronisation des contacts/leads DipPro vers le pipeline (via API si dispo, sinon webhook DipPro → endpoint interne, sinon import CSV en secours pour le MVP).
4. **Signature électronique de contrats** — génération du contrat (à partir d'un modèle) et envoi en signature via **Yousign** (ou DocuSign), suivi du statut de signature directement sur la fiche franchisé.
5. **Facturation SaaS** — abonnement Stripe à ~15 €/mois, essai gratuit, page d'upgrade/downgrade simple.
6. **Tableau de bord** — vue d'ensemble du réseau : nombre de franchisés par statut, contrats en attente de signature, activité récente.

### Hors périmètre V1 (à repousser en V2+)
- Portail self-service pour les franchisés (accès à leurs propres documents/reporting).
- Automatisations avancées (relances automatiques, scoring de leads).
- Facturation/royalties entre franchiseur et franchisés.
- App mobile.
- Multi-langue (V1 = français uniquement, probablement).

## 4. Modèle de données (esquisse)

- `organizations` (le franchiseur, tenant)
- `users` (membres d'une organisation, rôle)
- `franchisees` (candidat/franchisé : identité, statut pipeline, source = DipPro ou manuel, organization_id)
- `franchisee_activities` (notes, changements de statut, timeline)
- `contracts` (lié à un franchisee, statut de signature, provider = yousign/docusign, external_id)
- `dippro_sync_log` (traçabilité des imports/synchros)
- `subscriptions` (lien Stripe : plan, statut, organization_id)

Isolation multi-tenant par `organization_id` (Row Level Security Supabase).

## 5. Intégrations

| Intégration | Usage | Statut |
|---|---|---|
| **DipPro** | Import des franchisés/leads | À investiguer — besoin de la doc API ou d'un accès pour valider faisabilité (API REST ? webhooks ? export seul ?) |
| **Yousign** (ou DocuSign) | Signature électronique des contrats de franchise | Choisi — intégration via leur API, webhook de statut de signature |
| **Stripe** | Abonnement 15 €/mois | Connecteur Stripe présent dans cette session mais nécessite autorisation OAuth côté utilisateur avant utilisation |
| **Supabase** | Base de données + auth + RLS multi-tenant | Connecteur disponible dans cette session |
| **Vercel** | Hébergement/déploiement | Connecteur disponible dans cette session |

## 6. Stack technique proposée

- **Next.js** (App Router, TypeScript) — front + API routes
- **Supabase** — Postgres, Auth, Row Level Security pour l'isolation multi-tenant, Storage pour les documents de contrat
- **Stripe** — abonnements
- **Yousign** — signature électronique
- **Vercel** — déploiement

## 7. Roadmap indicative vers Q4 2026

- **Phase 0 (maintenant)** : valider ce cadrage, trancher les points ouverts (§8), choisir un nom.
- **Phase 1** : socle technique (auth, multi-tenant, modèle de données, CRUD franchisés).
- **Phase 2** : intégration DipPro (selon ce qu'on découvre de son API).
- **Phase 3** : signature électronique (Yousign) + génération de contrat depuis modèle.
- **Phase 4** : facturation Stripe + onboarding self-serve.
- **Phase 5** : durcissement (tests, sécurité, RGPD — données de contrats/signatures) + beta avec 1-2 franchiseurs pilotes.
- **Phase 6 (Q4 2026)** : publication.

## 8. Points à trancher avant de coder

1. **DipPro** : quelle intégration est réellement possible (API publique, webhooks, export CSV uniquement) ? → nécessite doc API ou accès test.
2. **Génération de contrats** : modèle de contrat unique par franchiseur, ou plusieurs modèles/variables (zone, droit d'entrée, royalties) ?
3. **RGPD** : les franchisés sont des personnes physiques → politique de conservation des données, consentement pour la signature électronique.
4. **Nom du produit** — pistes à discuter :
   - FranchHub
   - Francizy
   - iralink Franchise (cohérent avec la marque existante)
   - SignFranchise
   - FranchiseOS
   - DipFranchise (clin d'œil à DipPro comme source de leads)

## 9. Prochaine étape proposée

Une fois ce document validé/amendé, on pourra initialiser le projet (Next.js + Supabase) et démarrer par le socle multi-tenant + CRUD franchisés (Phase 1).
