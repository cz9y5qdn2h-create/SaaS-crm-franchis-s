# Cadrage produit — CRM Franchisés (écosystème iralink Agency)

> Document de brainstorm / cadrage avant développement. À valider/amender avant de lancer le build.

## 1. Pitch

Un CRM léger et abordable (~15 €/mois) dédié à la **gestion des réseaux de franchisés** dans son ensemble : recrutement/pipeline de candidats, dossiers, signature électronique des contrats de franchise, suivi du cycle de vie de chaque franchisé.

Ce produit est le **« deuxième outil »** déjà annoncé sur le site d'iralink Agency pour Q4 2026 (source : `www.iralink-agency.com`, consulté le 15/07/2026) — il vient compléter **DIPpro**, le produit phare actuel d'iralink.

### Contexte iralink Agency (confirmé via le site)

- **DIPpro** (produit existant, 850 €/mois + 1 350 € d'installation) : automatise la conformité au **DIP (Document d'Information Précontractuel)**, obligation légale de la **Loi Doubin** pour les réseaux de franchise en France. Surveillance hebdomadaire des obligations légales, mise à jour assistée par IA (Claude API), distribution certifiée par email aux franchisés, audit trail horodaté à valeur légale.
- Le nouveau CRM et DIPpro font partie du **même écosystème produit iralink**, mais sont **fonctionnellement distincts** : DIPpro reste le moteur de conformité légale (DIP), le nouveau CRM couvre **tout ce qui relève de la gestion de la franchise** — recrutement, suivi de la relation, contrats, cycle de vie — sans dupliquer le moteur de conformité de DIPpro. Une intégration (partage de données sur le franchisé) est envisageable mais reste à concevoir : **iralink n'utilise plus n8n ni Make**, donc le mécanisme technique (API directe entre les deux apps ? webhooks ?) reste à définir plus tard.

Positionnement prix : DIPpro (compliance légale, risque juridique élevé, tarif premium B2B) vs. nouveau CRM (gestion relationnelle, risque faible, volume plus large de franchiseurs) → un tarif d'entrée ~15 €/mois est cohérent avec ce moindre risque et ce périmètre plus resserré.

## 2. Cible & modèle économique

- **Utilisateurs** : franchiseurs (têtes de réseau) qui gèrent leurs franchisés — pas les franchisés eux-mêmes en tant qu'acheteurs (sauf portail dédié, voir V2).
- **Prix envisagé** : ~15 €/mois par franchiseur (abonnement simple, pas de paliers complexes au lancement).
- **Pourquoi c'est tenable à ce prix** : périmètre restreint (pas de marketing automation, pas de facturation complexe), infra mutualisée (Supabase + Vercel), signature électronique refacturée à l'usage plutôt qu'incluse à volonté.

## 3. Périmètre MVP (V1 — cible Q4 2026)

1. **Auth & organisations** — un compte = une organisation (le franchiseur), multi-utilisateurs (équipe du franchiseur) avec rôles simples (admin / membre).
2. **Fiche franchisé (CRM core)** — pipeline par statut (ex : Lead → Qualifié → Dossier envoyé → Contrat en signature → Signé/Actif → Résilié), infos de contact, notes, historique d'activité, tags/zone géographique.
3. **Gestion du dossier franchisé** — centralisation des documents/infos liés au recrutement et au suivi (indépendant de DIPpro ; un lien/référence vers le dossier DIP du franchisé dans DIPpro peut être ajouté manuellement en V1, synchro automatique envisageable en V2 selon le mécanisme d'intégration retenu).
4. **Signature électronique de contrats** — génération du contrat de franchise (à partir d'un modèle) et envoi en signature via **Yousign** (ou DocuSign), suivi du statut de signature directement sur la fiche franchisé.
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
- `franchisees` (candidat/franchisé : identité, statut pipeline, référence DIPpro optionnelle, organization_id)
- `franchisee_activities` (notes, changements de statut, timeline)
- `contracts` (lié à un franchisee, statut de signature, provider = yousign/docusign, external_id)
- `subscriptions` (lien Stripe : plan, statut, organization_id)

Isolation multi-tenant par `organization_id` (Row Level Security Supabase).

## 5. Intégrations

| Intégration | Usage | Statut |
|---|---|---|
| **DIPpro** | Écosystème partagé — passerelle de données à concevoir (mécanisme technique non encore choisi : API directe, webhooks...), hors périmètre strict du MVP | Non bloquant pour le MVP — à cadrer en V2 |
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
- **Phase 2** : signature électronique (Yousign) + génération de contrat depuis modèle.
- **Phase 3** : facturation Stripe + onboarding self-serve.
- **Phase 4** : durcissement (tests, sécurité, RGPD — données de contrats/signatures) + beta avec 1-2 franchiseurs pilotes.
- **Phase 5 (Q4 2026)** : publication.
- **Phase 6 (V2, hors cible Q4 2026)** : passerelle de données avec DIPpro (mécanisme à définir), portail self-service franchisés.

## 8. Points à trancher avant de coder

1. **Intégration DIPpro** : dans quelle mesure faut-il la prévoir dès le MVP (même a minima, ex. champ de référence croisée) ou la repousser entièrement en V2 ? iralink n'utilisant plus n8n ni Make, le mécanisme technique (API directe entre les deux apps, webhooks, autre) reste à définir.
2. **Génération de contrats** : modèle de contrat de franchise unique par franchiseur, ou plusieurs modèles/variables (zone, droit d'entrée, royalties) ?
3. **RGPD** : les franchisés sont des personnes physiques → politique de conservation des données, consentement pour la signature électronique.
4. **Nom du produit** — pistes à discuter (à ne pas confondre avec DIPpro, déjà pris) :
   - FranchHub
   - Francizy
   - iralink Franchise (cohérent avec la marque existante et le positionnement « deuxième outil »)
   - SignFranchise
   - FranchiseOS
   - Doubin'App (clin d'œil à la Loi Doubin, à double tranchant si trop proche du terrain légal de DIPpro)

## 9. Prochaine étape proposée

Une fois ce document validé/amendé, on pourra initialiser le projet (Next.js + Supabase) et démarrer par le socle multi-tenant + CRUD franchisés (Phase 1).
