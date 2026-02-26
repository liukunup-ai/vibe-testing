import { test, expect, login, TEST_CREDENTIALS, waitForTable } from '../fixtures/test-fixtures';

test.describe('Profile Page', () => {
  test.use({ storageState: undefined });
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/profile');
  });

  test('should display profile page', async ({ page }) => {
    await expect(page.locator('.ant-avatar')).toBeVisible();
    await expect(page.locator('text=Account, text=Profile, text=账户, text=资料')).toBeVisible();
  });

  test('should display user avatar and info', async ({ page }) => {
    await expect(page.locator('.ant-avatar')).toBeVisible();
  });

  test('should display account status', async ({ page }) => {
    await expect(page.locator('text=Status, text=状态')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Profile Avatar Upload', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/profile');
  });

  test('should display avatar upload area', async ({ page }) => {
    await expect(page.locator('.ant-avatar')).toBeVisible();
  });
});
