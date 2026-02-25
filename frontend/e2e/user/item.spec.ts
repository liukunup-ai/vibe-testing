import { test, expect, login, TEST_CREDENTIALS, waitForTable, randomString } from '../fixtures/test-fixtures';

test.describe('Item Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/item');
    await waitForTable(page).catch(() => {});
  });

  test('should display item table or empty state', async ({ page }) => {
    await expect(page.locator('.ant-pro-table, .ant-empty')).toBeVisible({ timeout: 10000 });
  });

  test('should display new item button', async ({ page }) => {
    await expect(page.locator('button:has-text("New"), button:has-text("新建"), button:has-text("Create")')).toBeVisible();
  });

  test('should open create item modal', async ({ page }) => {
    await page.click('button:has-text("New"), button:has-text("新建"), button:has-text("Create")');
    await expect(page.locator('.ant-modal-content')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/item');
    await expect(page).toHaveURL(/\/login/);
  });
});
