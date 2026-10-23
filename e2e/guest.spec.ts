import { test, expect } from "@playwright/test";
test("guest creates a power identity and downloads a real PNG", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Discover my power", exact: true })
    .click();
  for (const answer of [
    "A Protect the people nearby",
    "B A moonlit library",
    "C Change the rules of the encounter",
    "D A seed that remembers every kindness",
    "A Courage",
  ])
    await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ember Sentinel", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Give your hero a name", { exact: true })
    .fill("Test Dawn");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download card", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("animeverse-ember.png");
  await expect(page.getByLabel("Share link", { exact: true })).toHaveValue(
    /\/hero\/01230$/,
  );
  await page.goto("/hero/01230");
  await expect(
    page.getByRole("heading", { name: "Dusk Keeper", exact: true }),
  ).toBeVisible();
});
test("guest writes are gated and every Phase 1 page opens", async ({
  page,
  request,
}) => {
  await page.goto("/arena");
  await page
    .getByRole("button", { name: "Create a battle", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Set the stage." }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Discussion title" }),
  ).toHaveCount(0);
  const r = await request.post("/api/battles", {
    headers: { origin: new URL(page.url()).origin },
    data: { title: "Guest write" },
  });
  expect(r.status()).toBe(401);
  for (const path of [
    "/community",
    "/profile",
    "/settings",
    "/privacy",
    "/terms",
    "/legacy/studio.html",
    "/legacy/portraits.html",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  }
});
test("health checks the actual database", async ({ request }) => {
  const r = await request.get("/api/health");
  expect(r.status()).toBe(200);
  expect((await r.json()).database).toBe("ready");
});

test("portrait choice opens the matching personalizable identity", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Choose Luna", exact: true }).click();
  await expect(page.getByRole("img", { name: "Luna portrait preview", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Make this my identity", exact: true })).toHaveAttribute("href", "/hero/11111");
  await page.getByRole("link", { name: "Make this my identity", exact: true }).click();
  await expect(page.getByLabel("Give your hero a name", { exact: true })).toBeVisible();
});
