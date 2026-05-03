import { Locator, expect } from '@playwright/test';
import BasePage from './BasePage';
import { saucedemoUrl } from '../utils/testData';
import { L, type LocatorKey } from '../config/config_locators';

type LoginVisualKey = 'username' | 'password' | 'loginbutton';

export default class LoginPage extends BasePage {
  async attemptLogin(username: string, password: string): Promise<void> {
    this.logger.info(`Attempting login for user: ${username}`);
    await this.$('login_username').fill(username);
    await this.$('login_password').fill(password);
    await this.clickByKey('login_loginButton'); // uses fallback chain
    this.logger.info('Login submitted==========');
  }
}
