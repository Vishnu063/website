import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Experience from "../experience";
import { resultFromCode } from "../../lib/power";
import { loadBattle } from "../../lib/battle-page";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params,
    path = "/" + slug.join("/");
  if (slug[0] === "hero") {
    try {
      const h = resultFromCode(slug[1]);
      return {
        title: `${h.signature} — ${h.name}`,
        alternates: { canonical: path },
        openGraph: {
          title: `I’m a ${h.name}. Discover your power.`,
          images: [`/api/og/${h.code}`],
        },
      };
    } catch {
      return { title: "Hero not found", robots: { index: false } };
    }
  }
  if (slug[0] === "battle") {
    const d: any = await loadBattle(slug[1]);
    if (d)
      return {
        title: d.battle.title,
        description: d.battle.scenario.slice(0, 155),
        alternates: { canonical: path },
        openGraph: { title: d.battle.title, description: d.battle.conditions },
      };
  }
  const names: Record<string, string> = {
    arena: "Battle Arena",
    power: "Discover Your Power",
    community: "Community",
    profile: "Your Profile",
    settings: "Settings",
    privacy: "Privacy",
    terms: "Community Terms",
    admin: "Moderation",
  };
  return {
    title: names[slug[0]] || "Explore",
    alternates: { canonical: path },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (
    slug.length === 1 &&
    [
      "index",
      "discover",
      "worlds",
      "characters",
      "journal",
      "collection",
      "muses",
      "atelier",
      "garden",
      "studio",
      "portraits",
    ].some((n) => slug[0] === n + ".html")
  )
    redirect("/legacy/" + slug[0]);
  return (
    <Experience
      path={"/" + slug.join("/")}
      initialBattle={
        slug[0] === "battle" ? await loadBattle(slug[1]) : undefined
      }
    />
  );
}
