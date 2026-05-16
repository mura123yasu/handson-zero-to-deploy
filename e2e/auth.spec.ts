import { test, expect } from "@playwright/test";

const TEST_EMAIL = "e2e-test@example.com";
const TEST_PASSWORD = "e2e-test-password-123";
const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "test-setup-secret";

test.describe.configure({ mode: "serial" });

test.describe("認証・認可", () => {
  test.beforeAll(async ({ request }) => {
    // テスト用管理者アカウントを作成（既に存在する場合はエラーを無視）
    await request.post("/api/admin/setup", {
      data: {
        secret: SETUP_SECRET,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: "E2E テスト管理者",
      },
    });
  });

  test("未認証で /admin/orders にアクセスすると /admin/login にリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/callbackUrl/);
    await expect(page.locator("text=管理者ログイン")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("不正な認証情報でログインするとエラーが表示される", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator(".bg-red-50")).toBeVisible();
  });

  test("正しい認証情報でログインすると /admin/orders に遷移する", async ({
    page,
  }) => {
    await page.goto("/admin/login?callbackUrl=%2Fadmin%2Forders");

    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin\/orders/, { timeout: 10000 });
    await expect(page.locator("text=注文管理")).toBeVisible();
    await expect(page.locator("text=ログアウト")).toBeVisible();
  });

  test("ログアウトするとログインページに戻る", async ({ page }) => {
    // まずログイン
    await page.goto("/admin/login");
    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/orders/, { timeout: 10000 });

    // ログアウト
    await page.click("text=ログアウト");

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.locator("text=管理者ログイン")).toBeVisible();
  });

  test("ログアウト後に /admin/orders にアクセスするとリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("/order ページは認証なしでアクセスできる", async ({ page }) => {
    await page.goto("/order");

    await expect(page.locator("text=OSAKI 亭")).toBeVisible();
    await expect(page.locator("text=メニュー")).toBeVisible();
    await expect(page).toHaveURL(/\/order/);
    // ログインページにリダイレクトされないことを確認
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });

  test("/ トップページは認証なしでアクセスできる", async ({ page }) => {
    await page.goto("/");

    // トップページが表示され、ログインページにリダイレクトされないことを確認
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });
});
