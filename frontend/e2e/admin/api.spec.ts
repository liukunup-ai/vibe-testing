import { test, expect, login, TEST_CREDENTIALS, waitForTable, randomString } from '../fixtures/test-fixtures';

test.describe('Admin API Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.admin.username, TEST_CREDENTIALS.admin.password);
    await page.goto('/admin/api');
    await waitForTable(page).catch(() => {});
  });

  test('should display API table or empty state', async ({ page }) => {
    await expect(page.locator('.ant-pro-table, .ant-empty')).toBeVisible({ timeout: 10000 });
  });

  test('should display new API button', async ({ page }) => {
    await expect(page.locator('button:has-text("New"), button:has-text("新建"), button:has-text("Create")')).toBeVisible();
  });

  test('should open create API modal', async ({ page }) => {
    await page.click('button:has-text("New"), button:has-text("新建"), button:has-text("Create")');
    await expect(page.locator('.ant-modal-content')).toBeVisible();
  });

  test('should require admin access', async ({ page }) => {
    await page.context().clearCookies();
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/admin/api');
    await expect(page).not.toHaveURL('/admin/api');
  });
});
