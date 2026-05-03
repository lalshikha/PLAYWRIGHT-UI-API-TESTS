# Playwright BDD Framework - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Core Concepts](#core-concepts)
7. [Working with Locators](#working-with-locators)
8. [Creating Feature Files](#creating-feature-files)
9. [Step Definitions](#step-definitions)
10. [Page Objects](#page-objects)
11. [Test Data Management](#test-data-management)
12. [Fixtures & Dependency Injection](#fixtures--dependency-injection)
13. [Hooks](#hooks)
14. [Utilities](#utilities)
15. [Running Tests](#running-tests)
16. [Reports & Logging](#reports--logging)
17. [Visual Testing](#visual-testing)
18. [API Testing](#api-testing)
19. [Environment Configuration](#environment-configuration)
20. [Best Practices](#best-practices)

---

## Overview

This is a **Playwright + Cucumber (BDD) + TypeScript** automation testing framework designed for UI and API testing. It provides:

- **BDD-style test scenarios** using Gherkin syntax (.feature files)
- **Centralized locator management** with fallback support
- **Environment-specific test data** (dev, pp, prod)
- **Page Object Model** for maintainable tests
- **Visual regression testing** with pixelmatch
- **Comprehensive logging** with Winston
- **Custom reporters** for flaky test detection
- **Flexible step definitions** shared across features

### Why This Architecture?

- **Separation of Concerns**: Feature files → Step definitions → Page objects → Locators
- **Maintainability**: Locators and test data centralized in config files
- **Reusability**: Steps and page methods can be shared across multiple features
- **Scalability**: Easy to add new features, pages, and test data
- **Reliability**: Fallback locators handle DOM changes, visual testing catches regressions

---

## Technology Stack

### Core Testing Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.58.2 | Playwright testing framework |
| `playwright-bdd` | ^8.4.2 | BDD (Cucumber) integration for Playwright |
| `typescript` | ^5.5.4 | TypeScript compiler |

### Utilities & Helpers
| Package | Version | Purpose |
|---------|---------|---------|
| `@faker-js/faker` | ^10.3.0 | Generate fake test data (names, emails, etc.) |
| `winston` | ^3.19.0 | Structured logging |
| `dotenv` | ^17.3.1 | Environment variable management |
| `date-fns` | ^4.1.0 | Date manipulation utilities |
| `date-fns-tz` | ^3.2.0 | Timezone-aware date formatting |
| `exceljs` | ^4.4.0 | Excel file reading/writing |
| `uuid` | ^13.0.0 | Unique ID generation |

### Visual Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `pixelmatch` | ^7.1.0 | Pixel-level image comparison |
| `pngjs` | ^7.0.0 | PNG image processing |

### Reporting
| Package | Version | Purpose |
|---------|---------|---------|
| `cucumber-html-reporter` | ^6.0.0 | HTML report generation |
| `allure-commandline` | ^2.36.0 | Allure report support |

### Development Tools
| Package | Version | Purpose |
|---------|---------|---------|
| `ts-node` | ^10.9.2 | TypeScript execution for Node.js |
| `eslint` | ^10.0.0 | Code linting |
| `prettier` | ^3.8.1 | Code formatting |
| `@typescript-eslint/*` | ^8.56.0 | TypeScript linting rules |

---

## Architecture

### Data Flow

```
┌─ Feature File (.feature)
│   ├─ BDD Scenarios with Gherkin syntax
│   └─ Tagged with @TCId-FeatureName-###
│
├─ Step Definitions (TypeScript)
│   ├─ Given: Setup and navigation
│   ├─ When: User actions
│   └─ Then: Assertions and verifications
│
├─ Page Objects (Page extensions)
│   ├─ LoginPage.ts - Login-specific actions
│   ├─ InventoryPage.ts - Inventory-specific actions
│   └─ CommonPage.ts - Shared page methods
│
├─ BasePage (Abstract Base)
│   ├─ Locator resolution logic
│   ├─ Input helpers (fill, click)
│   ├─ Assertion helpers (visibility, text, state)
│   └─ Visual testing methods
│
├─ Locators (config_locators.ts)
│   └─ Centralized selector definitions
│
└─ Test Data (test-data/{env}/{feature}.json)
    └─ Environment-specific test credentials and data
```

### Test Execution Flow

```
1. playwright-bdd generates test files from .feature files
2. Playwright runs tests with hooks
3. Each test step:
   - Receives fixtures (page, page objects, helpers)
   - Calls page object methods
   - Page objects use locators from config
   - Assertions log results
4. After test execution:
   - Screenshots captured on failure
   - Flaky test reporter analyzes retries
   - HTML report generated
```

---

## Project Structure

```
├── package.json                          # Dependencies and scripts
├── playwright.config.ts                  # Playwright configuration
├── tsconfig.json                         # TypeScript configuration
├── FRAMEWORK_DOCUMENTATION.md            # This file
├── GUIDE_CREATING_NEW_TEST_CASES.md      # Quick start guide
├──
├── env/                                  # Environment configurations
│   ├── dev.env                           # Development environment
│   ├── pp.env                            # Pre-production environment
│   └── prod.env                          # Production environment
│
├── src/
│   ├── config/
│   │   └── config_locators.ts            # All page locators (centralized)
│   │
│   ├── features/                         # BDD Feature files
│   │   ├── functional/
│   │   │   └── *.feature
│   │   ├── ui/
│   │   │   ├── login.feature
│   │   │   ├── inventory.feature
│   │   │   └── flaky-demo.feature
│   │   └── visual/
│   │       └── *.feature
│   │
│   ├── fixtures/
│   │   └── Fixtures.ts                   # Test fixture definitions
│   │                                     # (dependency injection setup)
│   │
│   ├── hooks/
│   │   └── hooks.ts                      # Before/After hooks for tests
│   │
│   ├── pages/
│   │   ├── BasePage.ts                   # Base class with core methods
│   │   ├── CommonPage.ts                 # Shared page logic
│   │   ├── LoginPage.ts                  # Login page object
│   │   └── InventoryPage.ts              # Inventory page object
│   │
│   ├── reporters/
│   │   └── flaky-reporter.ts             # Custom flaky test reporter
│   │
│   ├── services/
│   │   └── ApiService.ts                 # API testing service
│   │
│   ├── step-definitions/
│   │   ├── functional/
│   │   │   └── apiSteps.ts               # API-specific steps
│   │   ├── shared/
│   │   │   └── commonSteps.ts            # Reusable Given/When/Then steps
│   │   └── ui/
│   │       ├── loginSteps.ts             # Login-related steps
│   │       ├── inventorySteps.ts         # Inventory-related steps
│   │       ├── uiSteps.ts                # General UI steps
│   │       ├── dataUtilSteps.ts          # Data utility steps
│   │       └── flakyDemoSteps.ts         # Demo steps for flaky tests
│   │
│   ├── test-data/                        # Test data by environment
│   │   ├── dev/
│   │   │   ├── login.json                # Login test data
│   │   │   ├── inventory.json            # Inventory test data
│   │   │   └── *.json
│   │   ├── pp/
│   │   │   ├── login.json
│   │   │   └── *.json
│   │   └── prod/
│   │       ├── login.json
│   │       └── *.json
│   │
│   └── utils/
│       ├── logger.ts                     # Winston logger configuration
│       ├── testData.ts                   # Static URL test data
│       ├── asLocatorKey.ts               # Locator key type validator
│       ├── dataUtils.ts                  # Faker, date, file utilities
│       ├── visualCompare.ts              # Visual comparison logic
│       └── fallbackTracker.ts            # Track fallback locator usage
│
├── logs/
│   └── test.log                          # Test execution logs
│
├── test-results/                         # Test execution artifacts
│   ├── hooks/                            # Failure screenshots
│   ├── retried-tests.json
│   ├── retried-tests.md
│   ├── flaky-tests.json
│   ├── flaky-tests.md
│   └── failed-after-retries.md
│
├── playwright-report/                    # HTML test report
│   └── index.html
│
├── reports/
│   ├── cucumber-report.html
│   ├── cucumber-report.json
│   ├── junit-results.xml
│   ├── allure-results/
│   └── html/
│
└── screenshots/
    └── visual/
        ├── baseline/                     # Baseline images for visual tests
        ├── actual/                       # Current test run images
        └── diff/                         # Diff images (expected vs actual)
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: For version control

### Step 1: Clone or Initialize Project

```bash
# Clone existing framework
git clone <your-repo-url>
cd SwagLabs-UiApi-BDD-PW-TS

# Or initialize fresh
npm init -y
npm install --save-dev typescript
npm install --save-dev @playwright/test playwright-bdd
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all devDependencies from `package.json`:
- Playwright and BDD integration
- TypeScript and development tools
- Testing utilities (Faker, Winston, etc.)
- Visual testing libraries (pixelmatch, pngjs)

### Step 3: Install Playwright Browsers

```bash
npx playwright install chromium
# Or for all supported browsers:
npx playwright install
```

### Step 4: Create Directory Structure

Create the folders shown in [Project Structure](#project-structure):

```bash
mkdir -p src/{config,features/{functional,ui,visual},fixtures,hooks,pages,reporters,services,step-definitions/{functional,shared,ui},test-data/{dev,pp,prod},utils}
mkdir -p env logs test-results screenshots/visual/{baseline,actual,diff} playwright-report reports/allure-results
```

### Step 5: Create Core Configuration Files

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["@playwright/test", "node"],
    "allowSyntheticDefaultImports": true
  },
  "ts-node": {
    "esm": false
  },
  "include": ["**/*.ts", "**/*.js", "**/*.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### playwright.config.ts
```typescript
import * as dotenv from 'dotenv';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const ENV = process.env.ENV ?? 'dev';
const envFile = path.resolve(process.cwd(), 'env', `${ENV}.env`);
dotenv.config({ path: envFile });
console.log(`Loaded environment variables from ${envFile}`);

const RETRIES = Number(process.env.PW_RETRIES ?? (process.env.CI ? 2 : 2));

const testDir = defineBddConfig({
  features: ['src/features/**/*.feature'],
  steps: [
    'src/fixtures/Fixtures.ts',
    'src/step-definitions/**/*.{ts,js}',
    'src/hooks/**/*.{ts,js}',
  ],
  outputDir: '.features-gen',
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  timeout: 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: RETRIES,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./src/reporters/flaky-reporter.ts'],
  ],
  use: {
    baseURL: process.env.APP_URL ?? 'https://www.saucedemo.com/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 60 * 1000,
    navigationTimeout: 60 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### package.json (Scripts Section)
```json
{
  "scripts": {
    "bddgen": "bddgen",
    "pw:list": "npm run bddgen && playwright test --list",
    "pw:test": "npm run bddgen && playwright test",
    "pw:inventory": "npm run bddgen && playwright test --grep \"@inventory\"",
    "pw:smoke": "npm run bddgen && playwright test --grep \"@smoke\"",
    "pw:ui": "npm run bddgen && playwright test --grep \"@ui\"",
    "pw:regression": "npm run bddgen && playwright test --grep \"@regression\"",
    "pw:login": "npm run bddgen && playwright test --grep \"@login\"",
    "pw:api": "npm run bddgen && playwright test --grep \"@api\"",
    "clean:bdd": "rimraf .features-gen src/features/**/*.feature.spec.* dist test-results playwright-report",
    "test": "npm run pw:test"
  }
}
```

### Step 6: Create Environment Files

#### env/dev.env
```
ENV=dev
APP_URL=https://www.saucedemo.com/
API_BASE_URL=https://www.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

#### env/pp.env
```
ENV=pp
APP_URL=https://pp.saucedemo.com/
API_BASE_URL=https://pp.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

#### env/prod.env
```
ENV=prod
APP_URL=https://www.saucedemo.com/
API_BASE_URL=https://www.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

---

## Core Concepts

### 1. Gherkin Syntax (Feature Files)

Features are written in Gherkin, a human-readable business language:

```gherkin
@tag1 @tag2
Feature: Feature name describing functionality

  Background:
    # Steps that run before each scenario

  @TCId-Feature001
  Scenario: Scenario name in business language
    Given initial condition
    When user performs action
    Then result should be verified
    And additional verification
```

**Key Elements:**
- **Feature**: Group of related scenarios
- **Tags (@)**: Categorize tests for filtering
- **TCId**: Unique test case identifier
- **Scenario**: One test case
- **Given/When/Then**: BDD keywords for test phases

### 2. Step Definitions

Map Gherkin steps to TypeScript code:

```typescript
Given('user opens {string}', async ({ page }, urlKey: string) => {
  // Implementation
});
```

**Parameters:**
- `{string}` → Accepts quoted text from feature
- `{word}` → Accepts single word
- `{int}` → Accepts integer

### 3. Page Objects

Encapsulate page-specific logic and selectors:

```typescript
export default class LoginPage extends BasePage {
  async attemptLogin(username: string, password: string): Promise<void> {
    await this.inputInElementByKey('login_username', username);
    await this.inputInElementByKey('login_password', password);
    await this.clickByKey('login_loginButton');
  }
}
```

**Benefits:**
- Element selectors in one place
- Readable action methods
- Easy to update if UI changes

### 4. Fixtures (Dependency Injection)

Fixtures provide instances that tests can use:

```typescript
export type AppFixtures = {
  loginPage: LoginPage;          // Page object instance
  commonPage: CommonPage;        // Shared page object
  td: (value: string) => string; // Test data resolver
  apiService: ApiService;        // API testing service
};

export const test = base.extend<AppFixtures>({ /* ... */ });
```

**In Steps:**
```typescript
When('user logs in', async ({ loginPage, td }, username: string) => {
  await loginPage.attemptLogin(td(username), td('password'));
});
```

### 5. Locators (Element Selectors)

Centralized in `config_locators.ts`:

```typescript
export const L = {
  // Organized by page/component
  login_username: 'username',
  login_password: 'password',
  login_loginButton: {
    primary: 'login-button-old',
    fallbacks: ['login-button'],
  },
};

export type LocatorKey = keyof typeof L;
```

**Supported Formats:**
- **data-test (default)**: `'username'` → `[data-test="username"]`
- **CSS Selector**: `'css:.login-form input'`
- **ID**: `'id:loginButton'`
- **Text**: `'text:Login'`
- **Role**: `'role:button|Login'`
- **Title**: `'title:Login Button Tooltip'`
- **Fallbacks**: Try primary, then fallback selectors

---

## Working with Locators

### Locator Definition Strategies

#### 1. Data-Test Attributes (Recommended)
Best for applications that have data-test attributes:

```typescript
// HTML: <input data-test="username" />
login_username: 'username',

// Resolved to: [data-test="username"]
```

#### 2. CSS Selectors
For more complex selectors:

```typescript
// Complex nested selector
inventory_backpackPrice: 'css:[data-test="inventory-list"] > [data-test="inventory-item"]:nth-child(1) [data-test="inventory-item-price"]',

// ID selector
someButton: 'css:#submitBtn',

// Class selector
menuItem: 'css:.menu-item.active',
```

#### 3. Role-Based Locators
Semantically accurate for buttons, links, etc:

```typescript
// Button with name
inventory_hamburgerMenu: 'role:button|Open Menu',
// Resolves to: getByRole('button', { name: 'Open Menu' })

// Link by name
checkoutButton: 'role:link|Proceed to Checkout',
```

#### 4. Text-Based Locators
For text-content elements:

```typescript
inventory_pageTitle: 'text:Products',
// Resolves to: getByText('Products', { exact: true })
```

#### 5. ID-Based Locators
For elements with IDs:

```typescript
someElement: 'id:elementId',
// Resolves to: #elementId
```

#### 6. Title-Based Locators
For tooltips and title attributes:

```typescript
helpIcon: 'title:Help Information',
// Resolves to: getByTitle('Help Information')
```

#### 7. Fallback Locators
For elements that might have multiple selectors or change:

```typescript
login_loginButton: {
  primary: 'login-button-old',        // Try this first
  fallbacks: [
    'login-button',                   // Then try this
    'role:button|Login',              // Then this
  ],
},

// Usage: 
// ✓ First tries [data-test="login-button-old"]
// → If not found, tries [data-test="login-button"]
// → If not found, tries getByRole('button', { name: 'Login' })
// → Logs warning which fallback was used
```

### Locator Usage in Code

#### In BasePage (Core Methods)

```typescript
// Get primary locator only
protected getByKey(key: LocatorKey): Locator {
  const [primary] = this.getLocatorCandidates(key);
  return this.resolveRawLocator(primary);
}

// Get working locator with fallbacks
protected async getWorkingLocatorByKey(
  key: LocatorKey,
  timeoutPerLocator = 800
): Promise<Locator> {
  // Tries candidates in order until one is visible
}
```

#### In Steps

```typescript
// Using direct step helper
Then('{string} should be visible', async ({ commonPage }, key: string) => {
  await commonPage.assertVisibleByKey(asLocatorKey(key));
});

// Step call:
// Then "login_username" should be visible
```

### Locator Resolution Flow

```
Step receives locator key string: "login_username"
        ↓
asLocatorKey() validates key exists in L type
        ↓
getLocatorCandidates(key) gets [primary, ...fallbacks]
        ↓
resolveRawLocator(raw) converts to Playwright locator
        ├─ Checks prefix (css:, id:, text:, etc.)
        └─ Returns Locator object
        ↓
Page object uses locator for interaction
```

### Best Practices for Locators

1. **Use data-test attributes when available**
   ```typescript
   // ✓ Good - stable and explicit
   inventory_addToCart: 'add-to-cart-sauce-labs-backpack',
   
   // ✗ Avoid - fragile, coupling to CSS
   inventory_addToCart: 'css:div.product button.btn-lg',
   ```

2. **Group by page/component**
   ```typescript
   // ✓ Organized
   login_username: '...',
   login_password: '...',
   login_loginButton: '...',
   
   inventory_pageTitle: '...',
   inventory_addToCart: '...',
   ```

3. **Use descriptive names**
   ```typescript
   // ✓ Clear intent
   inventory_backpackTitleLink: '...',
   
   // ✗ Vague
   inventory_link: '...',
   ```

4. **Add fallbacks for changing elements**
   ```typescript
   login_loginButton: {
     primary: 'login-button-old',
     fallbacks: ['login-button', 'role:button|Login'],
   },
   ```

5. **Document complex selectors**
   ```typescript
   // nth-child(1) = Sauce Labs Backpack
   // CSS required because data-test uses :nth-child pseudo-selector
   inventory_backpackPrice: 'css:[data-test="inventory-list"] > [data-test="inventory-item"]:nth-child(1) [data-test="inventory-item-price"]',
   ```

---

## Creating Feature Files

### Feature File Location
```
src/features/
├── functional/      # API and business logic tests
├── ui/              # UI interaction tests
└── visual/          # Visual regression tests
```

### Feature File Naming
```
featureName.feature
├─ login.feature
├─ inventory.feature
├─ payment.feature
└─ etc.
```

### Feature File Structure

```gherkin
@smoke @regression @ui @login
Feature: UI Login Functionality

  Background:
    # Steps that run BEFORE EACH scenario in this feature
    Given user opens "saucedemoUrl"

  @TCId-Login001
  Scenario Outline: Valid user login through UI flow
    # Each <placeholder> in Examples is substituted
    When user enters "<username>" in "login_username"
    And user enters "testdata.password" in "login_password"
    And user clicks "login_loginButton"
    Then "inventory_page" should be visible

    Examples:
      | username       |
      | testdata.user1 |
      | testdata.user2 |

  @TCId-Login002
  Scenario: Login fails with invalid credentials
    When user enters "invalid_user" in "login_username"
    And user enters "wrong_password" in "login_password"
    And user clicks "login_loginButton"
    Then "login_error" should be visible
    And "login_error" text should be "Epic sadface: Username and password do not match any user in this service"
```

### Key Components

#### 1. Tags (@)
Categorize tests for filtering:

```gherkin
@smoke          # Quick sanity tests
@regression     # Full regression suite
@ui            # UI tests
@api           # API tests
@visual        # Visual testing
@selfheal      # Flaky/self-healing tests
@TCId-Login001 # Unique test case ID (REQUIRED)
```

**Usage in Commands:**
```bash
npm run pw:smoke        # @smoke tests
npm run pw:regression   # @regression tests
npx playwright test --grep @TCId-Login001  # Specific test
```

#### 2. Background
Shared setup for all scenarios in feature:

```gherkin
Background:
  Given user opens "saucedemoUrl"
  # These steps run before EVERY scenario in this feature
```

#### 3. Scenario
Single test case:

```gherkin
@TCId-Inv001
Scenario: Verify inventory page displays after login
  Given user opens "saucedemoUrl"
  When user performs UI login with "testdata.username" and "testdata.password"
  Then "inventory_page" should be visible
```

#### 4. Scenario Outline
Parameterized test (runs once per row in Examples):

```gherkin
@TCId-Login-Outline
Scenario Outline: Login with multiple users
  When user enters "<username>" in "login_username"
  And user enters "<password>" in "login_password"
  And user clicks "login_loginButton"
  Then "inventory_page" should be visible

  Examples:
    | username      | password       |
    | user1         | pass1          |
    | user2         | pass2          |
```

**Execution:**
- Runs 2 times (once per row)
- Each parameter substituted per run

### Example: Complete Feature File

```gherkin
@smoke @ui @regression @inventory
Feature: UI Inventory Functionality

  Background:
    Given user opens "saucedemoUrl"

  @TCId-Inv001
  Scenario: Verify user can login and access inventory page
    When user performs UI login with "testdata.username" and "testdata.password"
    Then "inventory_page" should be visible
    And page title should be "Products"
    And "inventory_hamburgerMenu" should be visible

  @TCId-Inv002
  Scenario: Verify product details on inventory page
    When user performs UI login with "testdata.username" and "testdata.password"
    Then "inventory_backpackTitleLink" text should be "Sauce Labs Backpack"
    And "inventory_backpackTitleLink" should be a clickable link
    And "inventory_backpackPrice" text should be "$29.99"

  @TCId-Inv003
  Scenario: Verify non-clickable elements
    When user performs UI login with "testdata.username" and "testdata.password"
    Then "inventory_backpackPrice" should not be clickable
    And "inventory_addToCartButton" should be clickable

  @TCId-Inv004
  Scenario: Verify page title is not Products123
    When user performs UI login with "testdata.username" and "testdata.password"
    Then page title should not be "Products123"
    And page title should be "Products"
```

---

## Step Definitions

Step definitions connect Gherkin language to TypeScript code.

### Location
```
src/step-definitions/
├── functional/      # API steps
│   └── apiSteps.ts
├── shared/          # Reusable steps used by multiple features
│   └── commonSteps.ts
└── ui/              # UI-specific steps
    ├── loginSteps.ts
    ├── inventorySteps.ts
    ├── uiSteps.ts
    └── dataUtilSteps.ts
```

### Basic Step Definition Structure

```typescript
// step-definitions/shared/commonSteps.ts

import { Given, When, Then } from '../../fixtures/Fixtures';
import { testData } from '../../utils/testData';
import { asLocatorKey } from '../../utils/asLocatorKey';

// Given: Setup and preconditions
Given('user opens {string}', async ({ page }, urlKey: string) => {
  const url = testData[urlKey as keyof typeof testData];
  await page.goto(url);
  await page.waitForLoadState('networkidle');
});

// When: User actions
When('user clicks {string}', async ({ commonPage }, key: string) => {
  await commonPage.clickByKey(asLocatorKey(key));
});

// Then: Assertions and verifications
Then('{string} should be visible', async ({ commonPage }, key: string) => {
  await commonPage.assertVisibleByKey(asLocatorKey(key));
});
```

### Step Definition Patterns

#### Pattern 1: Simple Navigation
```typescript
Given('user opens {string}', async ({ page }, urlKey: string) => {
  const url = testData[urlKey as keyof typeof testData];
  await page.goto(url);
  await page.waitForLoadState('networkidle');
});

// Usage in feature:
// Given user opens "saucedemoUrl"
```

#### Pattern 2: Form Input with Test Data
```typescript
When('user enters {string} in {string}', 
  async ({ commonPage, td }, value: string, key: string) => {
    await commonPage.inputInElementByKey(asLocatorKey(key), td(value));
  }
);

// Usage in feature:
// When user enters "testdata.username" in "login_username"
// td("testdata.username") resolves from JSON file
```

#### Pattern 3: Page-Specific Actions
```typescript
// loginSteps.ts
When('user performs UI login with {string} and {string}', 
  async ({ loginPage, td }, username: string, password: string) => {
    await loginPage.attemptLogin(td(username), td(password));
  }
);

// Usage:
// When user performs UI login with "testdata.username" and "testdata.password"
```

#### Pattern 4: Text Assertions
```typescript
Then('{string} text should be {string}', 
  async ({ commonPage }, key: string, expectedText: string) => {
    await commonPage.assertContainsTextByKey(asLocatorKey(key), expectedText);
  }
);

// Usage:
// Then "inventory_backpackTitleLink" text should be "Sauce Labs Backpack"
```

#### Pattern 5: Element State Checks
```typescript
Then('{string} should be visible',
  async ({ commonPage }, key: string) => {
    await commonPage.assertVisibleByKey(asLocatorKey(key));
  }
);

Then('{string} should be a clickable link',
  async ({ commonPage }, key: string) => {
    await commonPage.assertClickableLinkByKey(asLocatorKey(key));
  }
);

Then('{string} should be clickable',
  async ({ commonPage }, key: string) => {
    await commonPage.assertClickableByKey(asLocatorKey(key));
  }
);

Then('{string} should not be clickable',
  async ({ commonPage }, key: string) => {
    await commonPage.assertNotClickableByKey(asLocatorKey(key));
  }
);

// Usage:
// Then "login_loginButton" should be visible
// Then "inventory_backpackTitleLink" should be a clickable link
// Then "inventory_addToCartButton" should be clickable
// Then "inventory_price" should not be clickable
```

#### Pattern 6: API Testing
```typescript
// step-definitions/functional/apiSteps.ts
Given('API service validates {word} login', 
  async ({ apiService }, userType: string) => {
    await apiService.validateSiteIsReachable();
  }
);

// Usage:
// Given API service validates standard login
```

#### Pattern 7: Data Generation
```typescript
// step-definitions/ui/dataUtilSteps.ts
When('user enters random registration data',
  async ({ page }) => {
    const email = DataUtils.email();
    const pwd = DataUtils.randomAlphaNum(12);
    
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(pwd);
  }
);

// Usage:
// When user enters random registration data
```

### Complete Step Definition File Example

```typescript
// step-definitions/shared/commonSteps.ts

import { Given, When, Then } from '../../fixtures/Fixtures';
import { testData, type TestData } from '../../utils/testData';
import { asLocatorKey } from '../../utils/asLocatorKey';

// ========== GIVEN STEPS ==========

Given('user opens {string}', async ({ page }, urlKey: string) => {
  const key = urlKey.trim() as keyof TestData;
  if (!(key in testData)) {
    throw new Error(`Unknown url key "${urlKey}". Valid keys: ${Object.keys(testData).join(', ')}`);
  }
  await page.goto(testData[key]);
  await page.waitForLoadState('networkidle');
});

// ========== WHEN STEPS ==========

When('user enters {string} in {string}', 
  async ({ commonPage, td }, value: string, key: string) => {
    await commonPage.inputInElementByKey(asLocatorKey(key), td(value));
  }
);

When('user clicks {string}', async ({ commonPage }, key: string) => {
  await commonPage.clickByKey(asLocatorKey(key));
});

// ========== THEN STEPS ==========

Then('{string} should be visible', async ({ commonPage }, key: string) => {
  await commonPage.assertVisibleByKey(asLocatorKey(key));
});

Then('{string} text should be {string}', 
  async ({ commonPage }, key: string, expectedText: string) => {
    await commonPage.assertContainsTextByKey(asLocatorKey(key), expectedText);
  }
);

Then('{string} text should not be {string}', 
  async ({ commonPage }, key: string, unexpectedText: string) => {
    await commonPage.assertNotContainsTextByKey(asLocatorKey(key), unexpectedText);
  }
);

Then('page title should be {string}', 
  async ({ commonPage }, expectedText: string) => {
    await commonPage.assertElementByTextIsVisible(expectedText, true);
  }
);

Then('page title should not be {string}', 
  async ({ commonPage }, expectedText: string) => {
    await commonPage.assertElementByTextIsNotVisible(expectedText, true);
  }
);

Then('{string} should be a clickable link', 
  async ({ commonPage }, key: string) => {
    await commonPage.assertClickableLinkByKey(asLocatorKey(key));
  }
);

Then('{string} should be clickable', 
  async ({ commonPage }, key: string) => {
    await commonPage.assertClickableByKey(asLocatorKey(key));
  }
);

Then('{string} should not be clickable', 
  async ({ commonPage }, key: string) => {
    await commonPage.assertNotClickableByKey(asLocatorKey(key));
  }
);
```

### Step Definition Best Practices

1. **Reuse existing steps when possible**
   - Check `commonSteps.ts` before creating new steps
   - Share generic steps across multiple features

2. **Keep steps focused**
   ```typescript
   // ✓ Good - One responsibility
   When('user enters {string} in {string}', ...)
   
   // ✗ Bad - Multiple responsibilities
   When('user enters {string} in {string} and clicks {string}', ...)
   ```

3. **Use type-safe locator keys**
   ```typescript
   // ✓ Good - Type-safe
   await commonPage.clickByKey(asLocatorKey(key));
   
   // ✗ Bad - Not validated
   await commonPage.clickByKey(key as LocatorKey);
   ```

4. **Leverage test data resolution**
   ```typescript
   // ✓ Good - Automatic JSON resolution
   await loginPage.attemptLogin(td(username), td(password));
   
   // ✗ Bad - Manual string matching
   const actualUsername = username === "testdata.username" ? jsonData.username : username;
   ```

5. **Document complex steps**
   ```typescript
   /**
    * Login with credentials from JSON file.
    * Resolves "testdata.username" to actual value from {feature}.json
    * @example
    * When user performs UI login with "testdata.username" and "testdata.password"
    */
   When('user performs UI login with {string} and {string}', ...)
   ```

---

## Page Objects

Page Objects encapsulate page-specific logic and element interactions.

### BasePage (Core Implementation)

Located at: [src/pages/BasePage.ts](src/pages/BasePage.ts)

BasePage provides all core functionality that child page objects inherit:

#### Locator Helpers

```typescript
// Get element by data-test attribute (most common)
protected byDataTest(value: string): Locator {
  return this.page.locator(`[data-test="${value}"]`);
}

// Get element by ID
protected byId(id: string): Locator {
  return this.page.locator(`#${id}`);
}

// Get element by text
protected byText(text: string | RegExp, exact?: boolean): Locator {
  return this.page.getByText(text, exact !== undefined ? { exact } : undefined);
}

// Get element by accessibility role
protected byRole(
  role: Parameters<Page['getByRole']>[0],
  name?: string | RegExp
): Locator {
  return this.page.getByRole(role, name ? { name } : undefined);
}

// Get element by title attribute
protected byTitle(title: string | RegExp): Locator {
  return this.page.getByTitle(title);
}
```

#### Locator Resolution

```typescript
// Resolve locator from config using fallbacks
protected async getWorkingLocatorByKey(
  key: LocatorKey,
  timeoutPerLocator = 800
): Promise<Locator>
```

**Logic:**
1. Gets candidates from config (primary + fallbacks)
2. Tries each in order until visible
3. Returns working locator
4. Logs warning if fallback used
5. Throws error if none work

#### Input Helpers

```typescript
// Fill text input by locator key
public async inputInElementByKey(
  key: LocatorKey,
  input: string,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(key);
  await expect(locator, message).toBeVisible();
  await locator.fill(input);
}

// Fill input by ID
protected async inputInElementById(
  id: string,
  input: string,
  message?: string
): Promise<void> {
  await this.byId(id).fill(input);
}
```

#### Click Helpers

```typescript
// Click element by locator key with visibility check
public async clickByKey(
  key: LocatorKey,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(key);
  await expect(locator, message).toBeVisible();
  await locator.click();
}

// Click by role with name
protected async clickElementByRole(
  role: Parameters<Page['getByRole']>[0],
  name?: string | RegExp,
  message?: string
): Promise<void> {
  const locator = this.byRole(role, name);
  await expect(locator, message).toBeVisible();
  await locator.click();
}
```

#### Assertion Methods

```typescript
// Verify element is visible
public async assertVisibleByKey(
  key: LocatorKey,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(key);
  await expect(locator, message).toBeVisible();
}

// Verify element contains text
public async assertContainsTextByKey(
  key: LocatorKey,
  expectedText: string | RegExp,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(key);
  await expect(locator, message).toContainText(expectedText);
}

// Verify element text NOT present
public async assertNotContainsTextByKey(
  key: LocatorKey,
  unexpectedText: string | RegExp,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(key);
  await expect(locator, message).not.toContainText(unexpectedText);
}

// Verify clickable (enabled)
public async assertClickableByKey(
  locatorKey: LocatorKey,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(locatorKey);
  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be clickable`
  ).toBeEnabled();
}

// Verify is a clickable link (anchor tag with href)
public async assertClickableLinkByKey(
  locatorKey: LocatorKey,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(locatorKey);
  
  await locator.scrollIntoViewIfNeeded();
  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be visible`
  ).toBeVisible();
  
  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be enabled`
  ).toBeEnabled();
  
  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be an anchor link`
  ).toHaveJSProperty('tagName', 'A');
  
  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to have href`
  ).toHaveAttribute('href', /.+/);
}

// Verify NOT clickable (not interactive)
public async assertNotClickableByKey(
  locatorKey: LocatorKey,
  message?: string
): Promise<void> {
  const locator = await this.getWorkingLocatorByKey(locatorKey);
  const tagName = await locator.evaluate((el) => el.tagName);
  const isInteractive = ['BUTTON', 'A', 'INPUT'].includes(tagName);
  
  await expect(
    isInteractive,
    message ?? `Expected "${String(locatorKey)}" to not be clickable`
  ).toBeFalsy();
}
```

#### Visual Testing

```typescript
// Compare full page screenshot with baseline
async assertPageScreenshot(
  snapshotFileName: string,
  visualOpts?: VisualCompareOptions,
  shotOpts?: PageShotOptions
): Promise<void>

// Compare element screenshot with baseline
async assertElementScreenshot(
  element: Locator,
  snapshotFileName: string,
  visualOpts?: VisualCompareOptions,
  shotOpts?: LocatorShotOptions
): Promise<void>
```

#### Public vs Protected Methods

**Public Methods** (used in steps):
- `$(key)` - Get locator by key
- `clickByKey(key)` - Click element
- `inputInElementByKey(key, input)` - Input text
- `assertVisibleByKey(key)` - Visibility assertion
- `assertClickableByKey(key)` - Clickable assertion
- `assertClickableLinkByKey(key)` - Link assertion
- `assertNotClickableByKey(key)` - Not clickable assertion
- `assertContainsTextByKey(key, text)` - Text assertion
- `assertNotContainsTextByKey(key, text)` - Text not present assertion
- `assertElementByTextIsVisible(text)` - Element visible by text
- `assertElementByTextIsNotVisible(text)` - Element not visible by text
- `assertPageScreenshot()` - Page visual test
- `assertElementScreenshot()` - Element visual test

**Protected Methods** (used in page object implementations):
- `byId()`, `byDataTest()`, `byText()`, `byRole()`, `byTitle()` - Locator factories
- `getWorkingLocatorByKey()` - Get resolved locator with fallbacks
- `getLocatorCandidates()` - Get all candidates for a key
- `resolveRawLocator()` - Resolve raw string to Locator

### LoginPage (Specialized)

```typescript
import BasePage from './BasePage';

export default class LoginPage extends BasePage {
  async attemptLogin(username: string, password: string): Promise<void> {
    this.logger.info(`Attempting login for user: ${username}`);
    
    // Use inherited public methods from BasePage
    await this.inputInElementByKey('login_username', username);
    await this.inputInElementByKey('login_password', password);
    await this.clickByKey('login_loginButton');
    
    this.logger.info('Login submitted');
  }
}
```

### InventoryPage (Specialized)

```typescript
import BasePage from './BasePage';

export default class InventoryPage extends BasePage {
  // Add inventory-specific methods here
  
  async verifyProductExists(productName: string): Promise<void> {
    // Implementation using inherited BasePage methods
  }
  
  async addProductToCart(productLocatorKey: string): Promise<void> {
    // Implementation using inherited BasePage methods
  }
}
```

### CommonPage (Shared)

Shared page object for common functionality:

```typescript
import BasePage from './BasePage';

export default class CommonPage extends BasePage {
  // Visual testing helpers
  
  async assertVisualPage(pageName: string): Promise<void> {
    const key = pageName.trim().toLowerCase();
    const snapshot = `pageUnderTest_${key}.png`;
    await this.assertPageScreenshot(snapshot);
  }

  async assertVisualElement(locatorKeyText: string): Promise<void> {
    const locatorKey = asLocatorKey(locatorKeyText);
    const snapshot = `elementUnderTest_${String(locatorKey).toLowerCase()}.png`;
    const locator = await this.getWorkingLocatorByKey(locatorKey);
    await this.assertElementScreenshot(locator, snapshot);
  }
}
```

### Creating New Page Objects

When adding a new page (e.g., CheckoutPage):

1. **Create the file**
   ```typescript
   // src/pages/CheckoutPage.ts
   import BasePage from './BasePage';
   
   export default class CheckoutPage extends BasePage {
     // Page-specific methods
   }
   ```

2. **Add locators to config**
   ```typescript
   // src/config/config_locators.ts
   export const L = {
     // ... existing locators ...
     
     // Checkout page
     checkout_firstName: 'checkout-firstname',
     checkout_lastName: 'checkout-lastname',
     checkout_postalCode: 'checkout-postalcode',
     checkout_continueButton: 'checkout-button',
   };
   ```

3. **Add page-specific methods**
   ```typescript
   export default class CheckoutPage extends BasePage {
     async fillShippingDetails(
       firstName: string,
       lastName: string,
       postalCode: string
     ): Promise<void> {
       await this.inputInElementByKey('checkout_firstName', firstName);
       await this.inputInElementByKey('checkout_lastName', lastName);
       await this.inputInElementByKey('checkout_postalCode', postalCode);
     }
     
     async clickContinue(): Promise<void> {
       await this.clickByKey('checkout_continueButton');
     }
   }
   ```

4. **Register in fixtures**
   ```typescript
   // src/fixtures/Fixtures.ts
   import CheckoutPage from '../pages/CheckoutPage';
   
   export type AppFixtures = {
     checkoutPage: CheckoutPage;
     // ... existing ...
   };
   
   checkoutPage: async ({ page }, use) => {
     await use(new CheckoutPage(page));
   },
   ```

5. **Use in steps**
   ```typescript
   When('user fills shipping details with {string}, {string}, {string}',
     async ({ checkoutPage, td }, firstName, lastName, postalCode) => {
       await checkoutPage.fillShippingDetails(
         td(firstName),
         td(lastName),
         td(postalCode)
       );
     }
   );
   ```

---

## Test Data Management

### Directory Structure

```
src/test-data/
├── dev/         # Development environment
│   ├── login.json
│   ├── inventory.json
│   ├── checkout.json
│   └── ...
├── pp/          # Pre-production environment
│   ├── login.json
│   ├── inventory.json
│   └── ...
└── prod/        # Production environment
    ├── login.json
    ├── inventory.json
    └── ...
```

### Test Data Format

Each JSON file contains test data keyed by TCId:

```json
{
  "TCId-Feature001": {
    "username": "standard_user",
    "password": "secret_sauce",
    "email": "user@example.com"
  },
  "TCId-Feature002": {
    "username": "visual_user",
    "password": "secret_sauce",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Naming Convention

**File Format:** `{featureName}.json`

Matches feature file name:
```
src/features/ui/login.feature      → src/test-data/dev/login.json
src/features/ui/inventory.feature  → src/test-data/dev/inventory.json
src/features/ui/checkout.feature   → src/test-data/dev/checkout.json
```

**Test Case Key:** `TCId-FeatureName-###`

Matches @TCId tag in feature:
```gherkin
@TCId-Login001      → "TCId-Login001": { ... } in login.json
@TCId-Login002      → "TCId-Login002": { ... } in login.json
@TCId-Inventory001  → "TCId-Inventory001": { ... } in inventory.json
```

### Accessing Test Data in Steps

#### Method 1: Using `td()` Helper (Recommended)

```typescript
When('user performs UI login with {string} and {string}',
  async ({ loginPage, td }, username: string, password: string) => {
    // td() automatically resolves "testdata.username" from JSON
    await loginPage.attemptLogin(td(username), td(password));
  }
);
```

**Feature file:**
```gherkin
When user performs UI login with "testdata.username" and "testdata.password"
```

**Execution:**
1. Steps receives: `username = "testdata.username"`, `password = "testdata.password"`
2. `td()` detects "testdata." prefix
3. Loads JSON file matching feature name + TCId
4. Returns actual value: `"standard_user"`, `"secret_sauce"`

#### Method 2: Direct Fixture Usage

```typescript
When('user enters test data',
  async ({ resolveTestData, $testInfo }, username: string) => {
    const actualUsername = resolveTestData(username, $testInfo);
    // Use actualUsername
  }
);
```

### Complete Example

**Feature file:** `src/features/ui/login.feature`
```gherkin
@TCId-Login001
Scenario: Valid user login
  Given user opens "saucedemoUrl"
  When user enters "testdata.username" in "login_username"
  And user enters "testdata.password" in "login_password"
  And user clicks "login_loginButton"
  Then "inventory_page" should be visible
```

**Test data:** `src/test-data/dev/login.json`
```json
{
  "TCId-Login001": {
    "username": "standard_user",
    "password": "secret_sauce"
  }
}
```

**Step definition:**
```typescript
When('user enters {string} in {string}',
  async ({ commonPage, td }, value: string, key: string) => {
    // td("testdata.username") → "standard_user"
    await commonPage.inputInElementByKey(asLocatorKey(key), td(value));
  }
);
```

**Execution Flow:**
1. Feature file specifies `"testdata.username"`
2. Step receives `value = "testdata.username"`
3. `td(value)` checks for "testdata." prefix
4. Loads `login.json` (matches feature name)
5. Gets `TCId-Login001` entry (from @TCId tag)
6. Retrieves `"username"` field
7. Returns `"standard_user"`
8. Inputs into `login_username` field

### Environment Selection

**Default:** `dev`

**Switch environment:**
```bash
# Use dev environment
ENV=dev npm run pw:test

# Use pre-production environment
ENV=pp npm run pw:test

# Use production environment
ENV=prod npm run pw:test

# Specific test with environment
ENV=prod npx playwright test --grep @TCId-Inv003
```

**playwright.config.ts:**
```typescript
const ENV = process.env.ENV ?? 'dev';
const envFile = path.resolve(process.cwd(), 'env', `${ENV}.env`);
dotenv.config({ path: envFile });
```

### Adding Test Data for New Features

1. **Create feature file:** `src/features/ui/newFeature.feature`
   ```gherkin
   @TCId-NewFeature001
   Scenario: ...
   ```

2. **Create matching JSON file:** `src/test-data/dev/newFeature.json`
   ```json
   {
     "TCId-NewFeature001": {
       "field1": "value1",
       "field2": "value2"
     }
   }
   ```

3. **Create for each environment:**
   ```bash
   src/test-data/dev/newFeature.json
   src/test-data/pp/newFeature.json
   src/test-data/prod/newFeature.json
   ```

4. **Use in steps:**
   ```typescript
   When('step using test data with {string}',
     async ({ commonPage, td }, fieldKey: string) => {
       const value = td(`testdata.${fieldKey}`);
       // Use value
     }
   );
   ```

5. **Use in feature:**
   ```gherkin
   When step using test data with "field1"
   ```

### Test Data Best Practices

1. **Keep same structure across environments**
   ```json
   // dev/login.json
   { "TCId-Login001": { "username": "dev_user", "password": "dev_pass" } }
   
   // pp/login.json
   { "TCId-Login001": { "username": "pp_user", "password": "pp_pass" } }
   
   // prod/login.json
   { "TCId-Login001": { "username": "prod_user", "password": "prod_pass" } }
   ```

2. **Use descriptive field names**
   ```json
   ✓ { "username": "...", "password": "..." }
   ✗ { "u1": "...", "p1": "..." }
   ```

3. **Group related data in same object**
   ```json
   ✓ { "TCId-Checkout001": { "firstName": "John", "lastName": "Doe" } }
   ✗ { "TCId-Checkout001FirstName": "John", "TCId-Checkout001LastName": "Doe" }
   ```

4. **Don't hardcode credentials in code**
   ```typescript
   ✓ await loginPage.attemptLogin(td("testdata.username"), td("testdata.password"));
   ✗ await loginPage.attemptLogin("admin", "password123");
   ```

5. **Use "testdata." prefix convention**
   ```typescript
   ✓ td("testdata.username")
   ✗ td("username")
   ```

---

## Fixtures & Dependency Injection

Fixtures are instances (like page objects) automatically provided to test steps via dependency injection.

### Location
`src/fixtures/Fixtures.ts`

### Defining Fixtures

```typescript
import { test as base } from 'playwright-bdd';

export type AppFixtures = {
  loginPage: LoginPage;           // Page object
  commonPage: CommonPage;         // Shared page object
  inventoryPage: InventoryPage;   // Specialized page object
  
  apiContext: APIRequestContext;  // API context
  apiService: ApiService;         // API service wrapper
  
  // Test data resolver
  resolveTestData: (value: string, testInfo: TestInfo) => unknown;
  
  // Convenience test data helper
  td: (value: string) => string;
};

export const test = base.extend<AppFixtures>({
  // Implementation for each fixture
});

export const { Given, When, Then } = createBdd(test);
```

### Fixture Implementation

#### Page Objects

```typescript
loginPage: async ({ page }, use) => {
  // 'use' is a callback function
  // Called with instance when test needs it
  await use(new LoginPage(page));
  // Cleanup after test (if needed)
},

commonPage: async ({ page }, use) => {
  await use(new CommonPage(page));
},

inventoryPage: async ({ page }, use) => {
  await use(new InventoryPage(page));
},
```

#### API Service

```typescript
apiContext: async ({}, use) => {
  const baseURL = 
    process.env.API_BASE_URL ?? 
    process.env.APP_URL ?? 
    'https://www.saucedemo.com/';

  const ctx = await request.newContext({ baseURL });
  await use(ctx);
  // Cleanup: dispose context
  await ctx.dispose();
},

apiService: async ({ apiContext }, use) => {
  await use(new ApiService(apiContext));
},
```

#### Test Data Resolver

```typescript
resolveTestData: async ({}, use) => {
  // Cache loaded JSON files
  const cache = new Map<string, Record<string, any>>();

  const resolver = (value: string, testInfo: TestInfo): unknown => {
    // Return non-string values as-is
    if (typeof value !== 'string') return value;
    
    // Return non-prefixed values as-is
    if (!value.startsWith('testdata.')) return value;

    // Get environment
    const env = process.env.ENV ?? 'dev';
    
    // Get @TCId tag from test
    const tcId = getTcIdFromTags(testInfo.tags ?? []);
    
    // Get feature name
    const feature = getFeatureBaseNameFromGeneratedSpec(testInfo);

    // Check cache
    const cacheKey = `${env}::${feature}`;
    let json = cache.get(cacheKey);
    if (!json) {
      json = loadFeatureJson(env, feature);
      cache.set(cacheKey, json);
    }

    // Extract key (remove "testdata." prefix)
    const key = value.replace(/^testdata\./, '');
    
    // Get test case data
    const row = json[tcId];
    if (!row) throw new Error(`No data for ${tcId} in ${feature}.json (env=${env})`);
    if (!(key in row)) throw new Error(`Key "${key}" missing for ${tcId}`);

    return row[key];
  };

  await use(resolver);
},

// Convenience helper
td: async ({ resolveTestData, $testInfo }, use) => {
  await use((value: string) => String(resolveTestData(value, $testInfo)));
},
```

### Using Fixtures in Steps

#### With Destructuring

```typescript
When('step that needs multiple fixtures',
  async ({ loginPage, commonPage, td }, param1: string, param2: string) => {
    // loginPage, commonPage, and td are all available
    const resolved = td("testdata.value");
    await loginPage.attemptLogin(resolved, "password");
    await commonPage.assertVisibleByKey(asLocatorKey(param1));
  }
);
```

#### Only Using Needed Fixtures

```typescript
// Only use fixtures you need
When('simple step',
  async ({ commonPage }, key: string) => {
    await commonPage.assertVisibleByKey(asLocatorKey(key));
  }
);

// Can mix test framework fixtures with custom
Then('step with page object',
  async ({ page, loginPage }, param: string) => {
    // Both built-in 'page' and custom 'loginPage' available
    await loginPage.attemptLogin("user", "pass");
    await page.waitForTimeout(1000);
  }
);
```

### Creating New Fixtures

**Add new API service:**

1. Create service class:
   ```typescript
   // src/services/PaymentService.ts
   export default class PaymentService {
     constructor(private readonly request: APIRequestContext) {}
     
     async processPayment(amount: number): Promise<void> {
       const response = await this.request.post('/api/payment', {
         data: { amount }
       });
       expect(response.status()).toBe(200);
     }
   }
   ```

2. Add to fixtures:
   ```typescript
   // src/fixtures/Fixtures.ts
   import PaymentService from '../services/PaymentService';
   
   export type AppFixtures = {
     // ... existing ...
     paymentService: PaymentService;
   };
   
   paymentService: async ({ apiContext }, use) => {
     await use(new PaymentService(apiContext));
   },
   ```

3. Use in steps:
   ```typescript
   When('user makes payment of {int}',
     async ({ paymentService }, amount: number) => {
       await paymentService.processPayment(amount);
     }
   );
   ```

---

## Hooks

Hooks allow setup and teardown logic around tests.

### Location
`src/hooks/hooks.ts`

### Hook Types

#### BeforeAll
Runs once before all tests in the worker:

```typescript
BeforeAll(async ({ $workerInfo }) => {
  logger.info(`=== BeforeAll | worker ${$workerInfo.workerIndex} started ===`);
  // Setup shared resources
});
```

#### AfterAll
Runs once after all tests in the worker:

```typescript
AfterAll(async ({ $workerInfo }) => {
  logger.info(`=== AfterAll | worker ${$workerInfo.workerIndex} finished ===`);
  // Cleanup shared resources
});
```

#### Before
Runs before each scenario:

```typescript
Before(async ({ page, $testInfo, $tags }) => {
  logger.info(`=== Before Scenario === ${$testInfo.title}`);
  logger.info(`Tags: ${($tags ?? []).join(', ') || 'No tags'}`);

  // Listen for browser console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (LOG_ALL_BROWSER_CONSOLE) {
      logger.info(`[BrowserConsole][${type}] ${text}`);
      return;
    }

    if (type === 'error') {
      logger.error(`[BrowserConsole][${type}] ${text}`);
      return;
    }

    if (type === 'warning') {
      logger.warn(`[BrowserConsole][${type}] ${text}`);
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    logger.error(`[PageError] ${error.message}`);
  });
});
```

#### After
Runs after each scenario:

```typescript
After(async ({ page, $testInfo, $tags }) => {
  const failed = $testInfo.status !== $testInfo.expectedStatus;

  logger.info(`=== After Scenario === ${$testInfo.title}`);
  logger.info(`Status: ${$testInfo.status}`);
  logger.info(`Tags: ${($tags ?? []).join(', ') || 'No tags'}`);

  if (!failed) return; // Only action on failure

  // Screenshot on failure
  const fileName = `${safeFileName($testInfo.title)}.png`;
  const screenshotPath = path.join(HOOKS_ARTIFACTS_DIR, fileName);

  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await $testInfo.attach('failure-screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });

    logger.error(`Failure screenshot attached: ${screenshotPath}`);
  } catch (error) {
    logger.error(`Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`);
  }
});
```

#### BeforeStep
Runs before each step:

```typescript
BeforeStep(async ({ $step, $testInfo }) => {
  if (!LOG_STEP_HOOKS) return;
  logger.info(`--- BeforeStep --- ${$step.title} | Scenario: ${$testInfo.title}`);
});
```

#### AfterStep
Runs after each step:

```typescript
AfterStep(async ({ $step, $testInfo }) => {
  if (!LOG_STEP_HOOKS) return;
  logger.info(`--- AfterStep --- ${$step.title} | Scenario: ${$testInfo.title}`);
});
```

### Hook Context

Available properties in hooks:

```typescript
$testInfo: TestInfo        // Test information
$tags: string[]           // Feature and scenario tags
$step: Step               // Current step info
$workerInfo: WorkerInfo   // Worker-specific info

page: Page                // Playwright page object
```

### Common Hook Patterns

#### Database Setup/Cleanup

```typescript
Before(async ({ $testInfo, $tags }) => {
  if ($tags?.includes('@db')) {
    const testId = $testInfo.title;
    await setupTestDatabase(testId);
  }
});

After(async ({ $testInfo, $tags }) => {
  if ($tags?.includes('@db')) {
    const testId = $testInfo.title;
    await cleanupTestDatabase(testId);
  }
});
```

#### API Reset

```typescript
Before(async ({ apiService, $tags }) => {
  if ($tags?.includes('@resetApi')) {
    await apiService.reset();
  }
});
```

#### Test-Specific Configuration

```typescript
Before(async ({ $testInfo }) => {
  // Set viewport size based on test name
  if ($testInfo.title.includes('mobile')) {
    await page.setViewportSize({ width: 375, height: 667 });
  }
});
```

#### Environment-Specific Setup

```typescript
Before(async ({ $tags }) => {
  if ($tags?.includes('@production')) {
    // Extra caution for production tests
    SLOW_MO = 1000;
  }
});
```

---

## Utilities

### Logger (Winston)

**Location:** `src/utils/logger.ts`

```typescript
import logger from '../utils/logger';

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

**Output:**
- Console: Formatted with timestamp
- File: `logs/test.log`

**Format:** `TIMESTAMP [LEVEL]: MESSAGE`

### DataUtils

**Location:** `src/utils/dataUtils.ts`

Utilities for generating and manipulating test data:

#### Faker (Random Data Generation)

```typescript
DataUtils.personName()              // "John Smith"
DataUtils.email()                   // "john.smith123@example.com"
DataUtils.phone()                   // "+1 (555) 123-4567"
DataUtils.uuid()                    // "550e8400-e29b-41d4-a716-446655440000"
DataUtils.randomAlphaNum(10)        // "aBc123xYz45"
DataUtils.randomNumeric(6)          // "547892"
DataUtils.randomFrom(['a', 'b', 'c'])  // "b"
```

#### Date Utilities

```typescript
DataUtils.now()                     // Current Date
DataUtils.randomDateBetween('2024-01-01', '2024-12-31')  // Random date in range
DataUtils.addDays(new Date(), 5)    // Date + 5 days
DataUtils.subDays(new Date(), 3)    // Date - 3 days
DataUtils.addMonths(new Date(), 1)  // Date + 1 month
DataUtils.subMonths(new Date(), 1)  // Date - 1 month
DataUtils.addYears(new Date(), 1)   // Date + 1 year
DataUtils.subYears(new Date(), 1)   // Date - 1 year

// Formatting
DataUtils.format(new Date(), 'yyyy-MM-dd')  // "2024-03-19"
DataUtils.formatTZ(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX')
// "2024-03-19 14:30:00+05:30"

// Parsing
DataUtils.parseISODate('2024-03-19T10:30:00Z')  // Date object
```

#### File Utilities

```typescript
// JSON file reading/writing
const data = await DataUtils.readJson<MyType>('path/to/file.json');
await DataUtils.writeJson('path/to/file.json', { key: 'value' });

// Excel file reading
const rows = await DataUtils.readExcelSheet('data/customers.xlsx', 'Sheet1');
const rows = await DataUtils.readExcelSheet('data/customers.xlsx', 1); // 1-indexed
```

### TestData

**Location:** `src/utils/testData.ts`

Static URL configuration:

```typescript
export const testData: TestData = {
  saucedemoUrl: 'https://www.saucedemo.com/',
  googleUrl: 'https://www.google.com/',
};

// Usage in steps:
Given('user opens {string}', async ({ page }, urlKey: string) => {
  await page.goto(testData[urlKey]);
});

// Feature:
// Given user opens "saucedemoUrl"
```

### Locator Key Validator

**Location:** `src/utils/asLocatorKey.ts`

Validates and converts string to LocatorKey type:

```typescript
export function asLocatorKey(value: string): LocatorKey {
  const key = value.trim() as LocatorKey;
  if (!(key in L)) {
    throw new Error(`Unknown locator key "${value}". Valid keys: ${Object.keys(L).join(', ')}`);
  }
  return key;
}

// Usage:
const key = asLocatorKey("login_username");  // Type-safe LocatorKey
// Throws if key not found in L object
```

### Visual Comparison

**Location:** `src/utils/visualCompare.ts`

Pixel-level image comparison:

#### Visual Compare Options

```typescript
export type VisualCompareOptions = {
  threshold?: number;            // Sensitivity 0-1 (lower = more sensitive)
  maxDiffPixels?: number;        // Max different pixels (-1 = disable)
  maxDiffPixelRatio?: number;    // Max ratio of different pixels (0-1)
  maxSizeDiffPixels?: number;    // Allowed size difference
  includeAA?: boolean;           // Include anti-aliased pixels in comparison
  alpha?: number;                // Blend factor for diff output
  writeDiffOnPass?: boolean;     // Write diff image even on pass
};
```

#### Usage in BasePage

```typescript
async assertPageScreenshot(
  snapshotFileName: string,
  visualOpts?: VisualCompareOptions
): Promise<void> {
  const options: VisualCompareOptions = {
    threshold: 0.1,
    maxDiffPixels: -1,
    maxDiffPixelRatio: 0.001,
    maxSizeDiffPixels: 0,
  };
  
  const buffer = await this.page.screenshot({ fullPage: true });
  await compareWithBaseline({
    screenshotBuffer: buffer,
    snapshotFileName,
    options,
  });
}
```

#### Creating Baselines

```bash
# Create/update baseline images
UPDATE_BASELINES=1 npm run pw:test

# This captures current screenshots as baselines
# Stored in: screenshots/visual/baseline/
```

#### Baseline Structure

```
screenshots/visual/
├── baseline/          # Reference images (created once)
│   ├── pageUnderTest_login.png
│   ├── elementUnderTest_login_username.png
│   └── ...
├── actual/            # Current test run images
│   ├── pageUnderTest_login.png
│   └── ...
└── diff/              # Difference images (if differences found)
    ├── pageUnderTest_login.diff.png
    └── ...
```

---

## Running Tests

### Basic Commands

```bash
# Install dependencies
npm install

# Generate test files from features
npm run bddgen

# Run all tests
npm run pw:test

# Or directly
npm test
```

### Running Specific Test Groups

```bash
# By tag
npm run pw:smoke        # @smoke tests
npm run pw:ui           # @ui tests
npm run pw:regression   # @regression tests
npm run pw:login        # @login tests
npm run pw:inventory    # @inventory tests
npm run pw:api          # @api tests

# By test ID
npx playwright test --grep @TCId-Login001

# By scenario name
npx playwright test --grep "Valid user login"
```

### Running with Different Environments

```bash
# Default (dev)
npm run pw:test

# Pre-production
ENV=pp npm run pw:test

# Production
ENV=prod npm run pw:test

# Specific test in environment
ENV=prod npx playwright test --grep @TCId-Inv003
```

### Advanced Options

```bash
# List tests without running
npm run pw:list

# Headless mode (default)
npx playwright test

# Headed mode (see browser)
npx playwright test --headed

# Debug mode (step through with inspector)
npx playwright test --debug

# Single worker (sequential, no parallelization)
npx playwright test --workers=1

# Save for debugging failed tests
npx playwright test --trace on

# Update visual baselines
UPDATE_BASELINES=1 npm run pw:test

# View HTML report
npx playwright show-report
```

### Configuration Options

Control test execution via environment variables:

```bash
# Logging
LOG_ALL_CONSOLE=true npm run pw:test          # Log all browser console
LOG_STEP_HOOKS=true npm run pw:test           # Log before/after steps

# Retries
PW_RETRIES=3 npm run pw:test                  # Retry failed 3 times

# Workers (parallel execution)
PW_WORKERS=4 npm run pw:test                  # Run 4 tests in parallel
```

### Debugging Failed Tests

```bash
# 1. View HTML report
npx playwright show-report
# Opens http://localhost:9323

# 2. See failure screenshots in test-results/hooks/

# 3. Check logs
cat logs/test.log

# 4. Run with inspector
npx playwright test --debug --grep @TCId-Login001

# 5. Re-run failed only
npx playwright test --last-failed
```

---

## Reports & Logging

### Logging

**Location:** `logs/test.log`

Logs all test execution details with timestamps:

```
2024-03-19T14:30:15.123Z [info]: LoginPage initialized
2024-03-19T14:30:15.234Z [info]: === Before Scenario === Valid user login
2024-03-19T14:30:16.456Z [info]: Attempting login for user: standard_user
2024-03-19T14:30:17.789Z [info]: Login submitted
2024-03-19T14:30:18.901Z [info]: === After Scenario === Valid user login
```

### HTML Report

**Location:** `playwright-report/index.html`

Comprehensive test execution report with:
- Test status (passed, failed, skipped)
- Execution time
- Step details
- Failure screenshots
- Trace files

**View:**
```bash
npx playwright show-report
```

### JUnit XML Report

**Location:** `reports/junit-results.xml`

Standard JUnit XML format for CI/CD integration:
- Jenkins
- Azure DevOps
- GitLab CI
- GitHub Actions

### Custom Flaky Reporter

**Location:** `test-results/`

Automatic tracking of flaky tests:

```
test-results/
├── retried-tests.json          # Tests that were retried
├── retried-tests.md            # Human-readable retry report
├── flaky-tests.json            # Tests that passed after retries
├── flaky-tests.md              # Human-readable flaky report
├── failed-after-retries.json   # Tests that failed all retries
└── failed-after-retries.md     # Human-readable failure report
```

**Sample flaky-tests.md:**
```
# Flaky Tests

## summary
Total: 2

## list
1. features/ui/login > Valid user login
   - Retries: 2
   - Attempts:
     - Attempt 1: FAILED (2000ms)
     - Attempt 2: FAILED (2150ms)
     - Attempt 3: PASSED (1900ms)

2. features/ui/inventory > Add product to cart
   - Retries: 1
   - Attempts:
     - Attempt 1: FAILED (3000ms)
     - Attempt 2: PASSED (2800ms)
```

### All Report Types

| Report | Location | Purpose | Format |
|--------|----------|---------|--------|
| HTML | `playwright-report/index.html` | Detailed test results | HTML |
| JUnit | `reports/junit-results.xml` | CI/CD integration | XML |
| Flaky Tracking | `test-results/*.json` | Identify unstable tests | JSON |
| Flaky Report | `test-results/*.md` | Human readable flaky analysis | Markdown |
| Failures | `test-results/hooks/` | Failure screenshots | PNG |
| Test Log | `logs/test.log` | Execution log | Text |

---

## Visual Testing

### Overview

Visual regression testing captures page/element screenshots and compares against baselines using pixel-level comparison.

### Setup Baselines

```bash
# First run - create baseline images
UPDATE_BASELINES=1 npm run pw:test

# Creates screenshots in: screenshots/visual/baseline/
```

### Feature Examples

```gherkin
@smoke @visual
Feature: Visual Testing

  @TCId-Visual001
  Scenario: Login page visual regression
    Given user opens "saucedemoUrl"
    Then visual validation passes for "login" page

  @TCId-Visual002
  Scenario: Login form element visual regression
    Given user opens "saucedemoUrl"
    Then visual validation passes for "login_username" element
    And visual validation passes for "login_password" element
    And visual validation passes for "login_loginButton" element
```

### Configuration

Visual comparison options in BasePage:

```typescript
protected visualDefaults(): VisualCompareOptions {
  return {
    threshold: 0.1,              // 10% sensitivity
    maxDiffPixels: -1,           // Disable pixel limit
    maxDiffPixelRatio: 0.001,    // Max 0.1% different pixels
    maxSizeDiffPixels: 0,        // No size tolerance
    includeAA: false,            // Ignore anti-aliasing
    alpha: 0.1,                  // 10% blend for diff
  };
}
```

### Directory Structure

```
screenshots/visual/
├── baseline/
│   ├── pageUnderTest_login.png
│   ├── pageUnderTest_inventory.png
│   ├── elementUnderTest_login_username.png
│   ├── elementUnderTest_login_password.png
│   └── elementUnderTest_login_loginbutton.png
├── actual/
│   └── (latest test run screenshots)
└── diff/
    └── (difference images when test fails)
```

### Updating Baselines

When UI intentionally changes:

```bash
# Update baselines
UPDATE_BASELINES=1 npm run pw:test

# Or specific test
UPDATE_BASELINES=1 npx playwright test --grep @visual

# Commit baseline images
git add screenshots/visual/baseline/
git commit -m "Update visual baselines for redesign"
```

### Debugging Visual Failures

```bash
# 1. View actual screenshot
screenshots/visual/actual/pageUnderTest_login.png

# 2. View baseline
screenshots/visual/baseline/pageUnderTest_login.png

# 3. View difference
screenshots/visual/diff/pageUnderTest_login.diff.png

# 4. Check HTML report
npx playwright show-report
# Shows side-by-side comparison
```

---

## API Testing

### API Service

**Location:** `src/services/ApiService.ts`

```typescript
import { APIRequestContext, expect } from '@playwright/test';
import logger from '../utils/logger';
import { saucedemoUrl } from '../utils/testData';

export default class ApiService {
  constructor(private readonly request: APIRequestContext) {}

  async validateSiteIsReachable(): Promise<void> {
    logger.info('API check: GET ' + saucedemoUrl);
    const res = await this.request.get(saucedemoUrl);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
    logger.info('API check passed: site reachable');
  }
}
```

### API Steps

**Location:** `src/step-definitions/functional/apiSteps.ts`

```typescript
import { Given } from '../../fixtures/Fixtures';

Given('API service validates {word} login', 
  async ({ apiService }, userType: string) => {
    await apiService.validateSiteIsReachable();
  }
);
```

### API Feature Example

```gherkin
@api @smoke @functional
Feature: API Testing

  @TCId-API001
  Scenario: Verify saucedemo site is reachable
    Given API service validates standard login
```

### Adding API Tests

1. **Extend ApiService:**
   ```typescript
   async loginViaApi(username: string, password: string): Promise<string> {
     const response = await this.request.post('/api/login', {
       data: { username, password },
     });
     expect(response.status()).toBe(200);
     const json = await response.json();
     return json.token;
   }
   ```

2. **Create API step:**
   ```typescript
   Given('user logs in via API with {string} and {string}',
     async ({ apiService, td }, username: string, password: string) => {
       const token = await apiService.loginViaApi(
         td(username),
         td(password)
       );
       // Store token for use in subsequent steps
     }
   );
   ```

3. **Use in feature:**
   ```gherkin
   @TCId-API002
   Scenario: API login returns valid token
     Given user logs in via API with "testdata.username" and "testdata.password"
     Then API should return valid token
   ```

---

## Environment Configuration

### Environment Files

Located in `env/` directory:

#### env/dev.env
```
ENV=dev
APP_URL=https://www.saucedemo.com/
API_BASE_URL=https://www.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

#### env/pp.env
```
ENV=pp
APP_URL=https://pp.saucedemo.com/
API_BASE_URL=https://pp.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

#### env/prod.env
```
ENV=prod
APP_URL=https://www.saucedemo.com/
API_BASE_URL=https://www.saucedemo.com/api/
GOOGLE_URL=https://www.google.com/
```

### Usage

```bash
# Default (dev)
npm run pw:test

# Pre-production
ENV=pp npm run pw:test

# Production
ENV=prod npm run pw:test
```

### Accessing Environment Variables

In code:

```typescript
const baseUrl = process.env.APP_URL;
const apiUrl = process.env.API_BASE_URL;
```

In playwright.config.ts:

```typescript
const ENV = process.env.ENV ?? 'dev';
const envFile = path.resolve(process.cwd(), 'env', `${ENV}.env`);
dotenv.config({ path: envFile });
```

---

## Best Practices

### 1. Feature File Organization

```gherkin
✓ DO
├─ Meaningful feature descriptions
├─ Clear scenario names that describe outcomes
├─ Consistent use of @TCId tags
├─ Proper Background for shared setup
└─ Scenario Outline for parameterized tests

✗ DON'T
├─ Complex nested step chains
├─ Implementation details in feature language
├─ Inconsistent tagging
└─ Duplicate test data across features
```

### 2. Locator Management

```typescript
✓ DO
├─ Name by page/component: login_username
├─ Use data-test attributes when available
├─ Add fallbacks for changing elements
├─ Document complex CSS selectors
└─ Check existing before adding new

✗ DON'T
├─ Use fragile CSS selectors: div.container > button
├─ Create duplicate locators
├─ Use vague names: button1, element2
└─ Hardcode selectors in steps
```

### 3. Step Definition Quality

```typescript
✓ DO
├─ Keep steps focused and singular
├─ Reuse existing steps
├─ Use asLocatorKey() for type safety
├─ Leverage td() for test data
└─ Log meaningful messages

✗ DON'T
├─ Create similar steps with slight variations
├─ Mix page object creation in steps
├─ Hardcode test data in steps
├─ Create generic catchall steps
└─ Log sensitive information
```

### 4. Page Object Design

```typescript
✓ DO
├─ Inherit from BasePage
├─ Extend with page-specific methods
├─ Use public methods for step consumption
├─ Keep protected for internal use
└─ Delegate assertions to BasePage

✗ DON'T
├─ Create utility methods in page objects
├─ Mix testing logic with interaction
├─ Use page objects without inheritance
└─ Expose internal Locator objects
```

### 5. Test Data Strategy

```typescript
✓ DO
├─ Use "testdata." prefix for JSON resolution
├─ Match TCId tags to JSON keys
├─ Include data for all environments
├─ Use descriptive field names
└─ Store credentials securely in JSON files

✗ DON'T
├─ Hardcode credentials in code
├─ Vary test data structure by environment
├─ Use unclear field names (u1, p1)
└─ Commit sensitive data files
```

### 6. Assertion Best Practices

```typescript
✓ DO
├─ Use specific assertions
├─ Include custom failure messages
├─ Check visibility before interaction
├─ Verify expected outcomes explicitly
└─ Use appropriate timeout values

✗ DON'T
├─ Use generic expect statements
├─ Assume elements are visible
├─ Skip assertions for time-sensitive actions
└─ Test implementation details
```

### 7. Test Execution

```bash
✓ DO
├─ Run full test suite regularly
├─ Use specific tags for test groups
├─ Monitor flaky test reports
├─ Update baselines when UI changes
└─ Review HTML reports for failures

✗ DON'T
├─ Only run individual tests
├─ Skip visual regression tests
├─ Ignore flaky test warnings
└─ Commit outdated baseline images
```

### 8. Code Quality

```typescript
✓ DO
├─ Use TypeScript strict mode
├─ Type all function parameters
├─ Follow naming conventions
├─ Add JSDoc comments for complex logic
└─ Use constants for repeated values

✗ DON'T
├─ Use 'any' types
├─ Mix naming styles
├─ Comment obvious code
└─ Hardcode values in implementations
```

### 9. Error Handling

```typescript
✓ DO
├─ Log meaningful error context
├─ Use appropriate wait strategies
├─ Handle fallback locators gracefully
├─ Distinguish expected vs unexpected failures
└─ Include retry logic for flaky operations

✗ DON'T
├─ Silently ignore errors
├─ Use excessive wait times
├─ Assume selectors always exist
└─ Mask actual errors with generic messages
```

### 10. Documentation

```markdown
✓ DO
├─ Write clear step descriptions
├─ Document locator strategies used
├─ Explain test data structure
├─ Keep README updated
└─ Comment non-obvious logic

✗ DON'T
├─ Use cryptic scenario names
├─ Leave magic numbers unexplained
├─ Assume others understand your code
└─ Outdated or missing documentation
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Locator not found" error

**Cause:** Locator key doesn't exist in config or browser element changed

**Solution:**
1. Check locator key spelling in feature
2. Verify key exists in `config_locators.ts`
3. Inspect element in browser for current selector
4. Add fallback locator if selector changes frequently
5. check UpdateBaselines if using visual testing

#### Issue: Test data resolve error

**Cause:** TCId tag or JSON field missing

**Solution:**
1. Verify @TCId-xxx tag in feature file
2. Check JSON file name matches feature name
3. Verify TCId key exists in JSON
4. Check field name under TCId entry
5. Ensure ENV variable points to correct directory

#### Issue: Tests running in parallel but failing

**Cause:** Shared state or resource contention

**Solution:**
1. Run tests sequentially: `--workers=1`
2. Check for test isolation issues
3. Verify test data doesn't conflict
4. Review hook implementations

#### Issue: Visual test baselines keep changing

**Cause:** Non-deterministic rendering, timing issues

**Solution:**
1. Increase wait times before screenshot
2. Disable animations: `animations: 'disabled'`
3. Fix viewport size: `setViewportSize()`
4. Check for flaky CSS transitions

#### Issue: "Trace file not found" in report

**Cause:** Trace configured but tests didn't collect it

**Solution:**
1. Ensure `trace: 'on-first-retry'` in config
2. Use `--trace on` flag
3. Check for errors before trace collection

---

## Quick Start Example

### Create a Complete Test Suite (5 minutes)

**1. Create feature file:**
```bash
cat > src/features/ui/demo.feature << 'EOF'
@smoke @ui @demo
Feature: Demo Test Suite

  @TCId-Demo001
  Scenario: User can login and see inventory
    Given user opens "saucedemoUrl"
    When user performs UI login with "testdata.username" and "testdata.password"
    Then "inventory_page" should be visible
    And page title should be "Products"
EOF
```

**2. Add test data:**
```bash
cat > src/test-data/dev/demo.json << 'EOF'
{
  "TCId-Demo001": {
    "username": "standard_user",
    "password": "secret_sauce"
  }
}
EOF

# Copy for other environments
cp src/test-data/dev/demo.json src/test-data/pp/demo.json
cp src/test-data/dev/demo.json src/test-data/prod/demo.json
```

**3. Run test:**
```bash
npm run bddgen
npx playwright test --grep @TCId-Demo001 --headed

# View results
npx playwright show-report
```

**Done!** You have a working test case.

---

## Summary

This Playwright BDD framework provides:

✓ **Separation of Concerns:** Features → Steps → Pages → Locators  
✓ **Maintainability:** Centralized locators and test data  
✓ **Reusability:** Shared steps and page methods  
✓ **Scalability:** Easy to add new features and tests  
✓ **Reliability:** Fallback locators and visual regression  
✓ **Debugging:** Comprehensive logging and reports  
✓ **Flexibility:** Environment-specific configuration  

Use this documentation as a reference for:
- Creating new test cases
- Adding new page objects
- Writing step definitions
- Managing test data
- Configuring environments
- Debugging failures
- Best practices

For questions or updates to this documentation, refer to the existing code examples in the repository.

