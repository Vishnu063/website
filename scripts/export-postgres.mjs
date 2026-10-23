import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
await mkdir("postgres", { recursive: true });
const known = new Set();
for (const name of (await readdir("drizzle"))
  .filter((n) => n.endsWith(".sql"))
  .sort()) {
  const source = (await readFile("drizzle/" + name, "utf8"))
    .replaceAll("--> statement-breakpoint", "")
    .replaceAll("`", '"')
    .replace(/\binteger\b/gi, "bigint");
  const statements = source
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    tables = statements.filter((s) => /^CREATE TABLE /i.test(s)),
    rest = statements.filter((s) => !/^CREATE TABLE /i.test(s));
  const sorted = [];
  while (tables.length) {
    const i = tables.findIndex((s) =>
      [...s.matchAll(/REFERENCES "([^"]+)"/g)].every((m) => known.has(m[1])),
    );
    if (i < 0) throw Error("Unresolved table dependencies in " + name);
    const table = tables.splice(i, 1)[0];
    known.add(table.match(/CREATE TABLE "([^"]+)"/)[1]);
    sorted.push(table);
  }
  await writeFile(
    "postgres/" + name,
    [...sorted, ...rest].join(";\n\n") + ";\n",
  );
}
console.log(
  "PostgreSQL DDL exported from committed SQLite migrations. Existing data needs a separately reviewed cutover.",
);
