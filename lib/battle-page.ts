import { GET } from "../app/api/[...path]/route";
export async function loadBattle(id: string) {
  try {
    if (!/^[a-f0-9-]{36}$/.test(id)) return null;
    const r = await GET(
      new Request("https://animeverse.internal/api/battles/" + id),
    );
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
