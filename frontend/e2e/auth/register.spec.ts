import { test, expect, uniqueEmail, uniqueUsername, expectMessage } from '../fixtures/test-fixtures';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByPlaceholder(/Email|邮箱/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password|密码/i).first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Register"), button:has-text("注册")')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("注册")');
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder(/Email|邮箱/i).fill('invalid-email');
    await page.getByPlaceholder(/Password|密码/i).first().fill('password123');
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("注册")');
    
    await expect(page.locator('.ant-form-item-explain-error')).toContainText(/邮箱|email|Email/i);
  });

  test('should validate password minimum length', async ({ page }) => {
    await page.getByPlaceholder(/Email|邮箱/i).fill(uniqueEmail());
    await page.getByPlaceholder(/Password|密码/i).first().fill('123');
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("注册")');
    
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login, text=登录, text=立即登录');
    await expect(page).toHaveURL(/login/);
  });

  test('should show error for already registered email', async ({ page }) => {
    await page.getByPlaceholder(/Email|邮箱/i).fill('admin@example.com');
    await page.getByPlaceholder(/Password|密码/i).first().fill('Test@123456');
    
    const confirmInputs = await page.getByPlaceholder(/Confirm|确认|重复/i).count();
    if (confirmInputs > 0) {
      await page.getByPlaceholder(/Confirm|确认|重复/i).fill('Test@123456');
    }
    
    await page.click('button[type="submit"], button:has-text("Register"), button:has-text("注册")');
    
    await expect(page.locator('.ant-alert-error, .ant-message-error')).toBeVisible({ timeout: 10000 });
  });
});
