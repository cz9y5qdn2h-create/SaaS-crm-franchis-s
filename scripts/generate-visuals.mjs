#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const client = new Anthropic();

const OUTPUT_DIR = path.join(process.cwd(), "design-output");

const BRAND_BRIEF = `
Nom du produit : Essaimo
Description : CRM pour la gestion des réseaux de franchise (recrutement de franchisés, suivi du pipeline, signature électronique des contrats), édité par iralink Agency.
Cible : franchiseurs (têtes de réseau), B2B, France.
Positionnement : simple, abordable (~15€/mois), sérieux mais pas austère.
Ton visuel : professionnel, épuré, inspiré du champ lexical de l'essaimage (essaimer = dupliquer une activité à partir d'une marque mère) sans être trop littéral (pas d'abeille/ruche cliché).
Palette suggérée : neutre (zinc/blanc/noir) avec une couleur d'accent à définir par Claude.
`.trim();

async function generateLogos(count = 4) {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `${BRAND_BRIEF}

Propose ${count} concepts de logo distincts pour "Essaimo", chacun en SVG autonome (viewBox 0 0 200 200, pas de dépendance externe, couleurs en valeurs hex directes).
Pour chaque concept, réponds avec :
1. Une ligne de titre "## Concept N : <nom court>"
2. Un bloc de code \`\`\`svg contenant le SVG complet
3. Une phrase expliquant le raisonnement

Varie les approches (typographique pur, symbole abstrait, monogramme...).`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "";

  await writeFile(path.join(OUTPUT_DIR, "logos-raw.md"), text, "utf-8");

  const svgBlocks = [...text.matchAll(/```svg\n([\s\S]*?)```/g)];
  if (svgBlocks.length === 0) {
    console.warn("Aucun bloc SVG détecté — voir design-output/logos-raw.md pour la réponse brute.");
  }

  for (const [i, match] of svgBlocks.entries()) {
    const filename = `logo-concept-${i + 1}.svg`;
    await writeFile(path.join(OUTPUT_DIR, filename), match[1].trim(), "utf-8");
    console.log(`✓ ${filename}`);
  }
}

async function generateLandingPage() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: `${BRAND_BRIEF}

Crée une maquette de landing page marketing pour Essaimo, en un seul fichier HTML autonome (CSS inline dans une balise <style>, pas de dépendance externe, pas de framework JS).
Sections attendues : hero (accroche + CTA), 3-4 fonctionnalités clés (pipeline franchisés, signature électronique, tableau de bord), section tarif (~15€/mois), footer simple mentionnant iralink Agency.
Réponds uniquement avec le code HTML complet dans un bloc \`\`\`html, sans texte avant ou après.`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
  const html = htmlMatch ? htmlMatch[1].trim() : text.trim();

  await writeFile(path.join(OUTPUT_DIR, "landing-page.html"), html, "utf-8");
  console.log("✓ landing-page.html");
}

const mode = process.argv[2] ?? "all";

try {
  if (mode === "logo" || mode === "all") await generateLogos();
  if (mode === "landing" || mode === "all") await generateLandingPage();
} catch (error) {
  if (error?.status === 401) {
    console.error(
      "Erreur d'authentification — vérifie que ANTHROPIC_API_KEY est bien défini dans ton environnement."
    );
  } else {
    console.error(error);
  }
  process.exit(1);
}
