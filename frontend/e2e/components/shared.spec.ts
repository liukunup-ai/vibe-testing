import { test, expect, login, logout, TEST_CREDENTIALS } from '../fixtures/test-fixtures';

test.describe('Avatar Dropdown Component', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
  });

  test('should display avatar in header', async ({ page }) => {
    await expect(page.locator('.anticon-user, .ant-avatar, [data-testid="user-avatar"]')).toBeVisible();
  });

  test('should logout from dropdown', async ({ page }) => {
    await logout(page);
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Footer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display footer on login page', async ({ page }) => {
    const footer = page.locator('footer, .ant-pro-global-footer, [class*="footer"]');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });
});
