import { test, expect, login, TEST_CREDENTIALS, waitForTable, randomString } from '../fixtures/test-fixtures';

test.describe('Admin Menu Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.admin.username, TEST_CREDENTIALS.admin.password);
    await page.goto('/admin/menu');
    await waitForTable(page).catch(() => {});
  });

  test('should display menu table or empty state', async ({ page }) => {
    await expect(page.locator('.ant-pro-table, .ant-empty')).toBeVisible({ timeout: 10000 });
  });

  test('should display new menu button', async ({ page }) => {
    await expect(page.locator('button:has-text("New"), button:has-text("新建"), button:has-text("Create")')).toBeVisible();
  });

  test('should open create menu modal', async ({ page }) => {
    await page.click('button:has-text("New"), button:has-text("新建"), button:has-text("Create")');
    await expect(page.locator('.ant-modal-content')).toBeVisible();
  });

  test('should require admin access', async ({ page }) => {
    await page.context().clearCookies();
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/admin/menu');
    await expect(page).not.toHaveURL('/admin/menu');
  });
});
