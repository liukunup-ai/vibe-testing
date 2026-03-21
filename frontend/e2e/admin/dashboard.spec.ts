import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should display admin menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ant-layout-sider')).toBeVisible();
  });

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=用户管理');
    await page.waitForURL('/admin/users');
    await expect(page.locator('text=用户列表')).toBeVisible();
  });

  test('should navigate to roles page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=角色管理');
    await page.waitForURL('/admin/roles');
    await expect(page.locator('text=角色列表')).toBeVisible();
  });

  test('should navigate to menus page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=菜单管理');
    await page.waitForURL('/admin/menus');
    await expect(page.locator('text=菜单列表')).toBeVisible();
  });

  test('should navigate to APIs page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=API管理');
    await page.waitForURL('/admin/apis');
    await expect(page.locator('text=API列表')).toBeVisible();
  });

  test('should navigate to items page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=字典管理');
    await page.waitForURL('/admin/items');
    await expect(page.locator('text=字典列表')).toBeVisible();
  });

  test('should display logout button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=退出登录')).toBeVisible();
  });
});
