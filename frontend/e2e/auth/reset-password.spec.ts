import { test, expect } from '../fixtures/test-fixtures';

test.describe('Reset Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password?token=invalid-test-token');
  });

  test('should display reset password form', async ({ page }) => {
    await expect(page.getByPlaceholder(/Password|密码/i).first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Reset"), button:has-text("重置")')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"], button:has-text("Reset"), button:has-text("重置"), button:has-text("Submit")');
    await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible();
  });

  test('should validate password minimum length', async ({ page }) => {
    await page.getByPlaceholder(/Password|密码/i).first().fill('123');
    const confirmInputs = await page.getByPlaceholder(/Confirm|确认|重复/i).count();
    if (confirmInputs > 0) {
      await page.getByPlaceholder(/Confirm|确认|重复/i).fill('123');
    }
    await page.click('button[type="submit"], button:has-text("Reset"), button:has-text("重置"), button:has-text("Submit")');
    
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should show error for invalid token', async ({ page }) => {
    await page.getByPlaceholder(/Password|密码/i).first().fill('Test@123456');
    const confirmInputs = await page.getByPlaceholder(/Confirm|确认|重复/i).count();
    if (confirmInputs > 0) {
      await page.getByPlaceholder(/Confirm|确认|重复/i).fill('Test@123456');
    }
    await page.click('button[type="submit"], button:has-text("Reset"), button:has-text("重置"), button:has-text("Submit")');
    
    await expect(page.locator('.ant-alert-error, .ant-message-error')).toBeVisible({ timeout: 10000 });
  });

  test('should require token in URL', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('.ant-alert-error, text=无效, text=invalid, text=Invalid')).toBeVisible({ timeout: 5000 });
  });
});
