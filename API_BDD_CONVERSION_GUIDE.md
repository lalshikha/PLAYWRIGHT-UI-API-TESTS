# API BDD Automation Conversion Guide
## Playwright + Cucumber + TypeScript Framework

---

## 📋 Document Purpose
This guide demonstrates how to convert plain-English API test cases into production-ready Playwright API BDD automation using the existing framework structure.

**Key Principle**: Maximize code reuse via `apiCommonSteps.ts` generic helpers. Avoid scenario-specific duplicate steps.

---

## 🏗️ Framework Architecture

### Tech Stack
- **Playwright**: API testing via `APIRequestContext`
- **Cucumber/Gherkin**: BDD feature files (`.feature`)
- **TypeScript**: Type-safe step definitions
- **Jest/Playwright Assertions**: Validation

### Core Components
```
src/
├── features/functional/
│   └── *.feature (Gherkin test scenarios)
├── step-definitions/functional/
│   ├── apiCommonSteps.ts (Reusable generic API steps)
│   ├── apiSteps.ts (Scenario-specific steps, if needed)
│   └── [...other scenario steps]
├── services/
│   └── ApiService.ts (API request/response handling)
├── fixtures/
│   └── Fixtures.ts (Test setup, fixtures, utilities)
└── utils/
    └── logger.ts (Logging utility)
```

---

## 🔄 Conversion Process (Step-by-Step)

### Phase 1: Understand the Testcase
Read the plain-English testcase and identify:
1. **Base URL** → Environment variable (e.g., `PETSTORE_BASE_URL`)
2. **API Method** → GET, POST, PUT, DELETE, etc.
3. **Endpoint/Path** → Resource path (e.g., `/pet/findByStatus`)
4. **Headers** → Authentication, Content-Type, custom headers
5. **Query Parameters** → Filters, pagination, etc.
6. **Request Body** → POST/PUT payloads (if applicable)
7. **Response Validations** → Status, body, headers, schema, etc.

### Phase 2: Map to Existing Framework
Check `apiCommonSteps.ts` and `ApiService.ts` for existing helpers:
- ✅ **Already exists?** → Reuse the step
- ❌ **Missing?** → Add generic reusable step to `apiCommonSteps.ts`

**Never create scenario-specific steps** like `createUserWithJohn()`. Create generic steps like `setBody()` instead.

### Phase 3: Create Feature File
Write Gherkin file following the pattern in [petstore.feature](src/features/functional/petstore.feature).

### Phase 4: Create/Update Step Definitions
- Import from `apiCommonSteps.ts`
- Reuse existing steps
- Add scenario-specific steps **only if** they cannot be generalized

### Phase 5: Enhance apiCommonSteps.ts
Add missing generic reusable steps.

---

## 📌 Example Conversion

### ✍️ Input Testcase

```
Feature: Get Pets by Status (PetStore API)

Scenario: Retrieve available pets from PetStore API
  Given base URL is https://petstore.swagger.io/v2
  And header api_key = "special-key"
  And query param status = "available"
  And API endpoint path is /pet/findByStatus
  When I send a GET request
  Then response status should be 200
  And response header content-type contains "application/json"
  And response should not be empty
  And response should be an array of objects
  And each object in response should have status = "available"
```

**Tag**: `@TCId-1001`

---

### 📂 Files to Create

#### **File 1: Feature File**
**Location**: `src/features/functional/petstore.feature`

```gherkin
@regression @functional @api @petstore
Feature: PetStore API - Get Pets by Status

  Background:
    Given PETSTORE base URL is set
    And API request headers are cleared

  @TCId-1001
  Scenario Outline: TC_GET_PET_BY_STATUS_001 - Retrieve pets by status
    # Description: Validate that GET /pet/findByStatus returns a valid list of pets
    # when a specific status is passed. Verify response is JSON array where each
    # object has the requested status value.

    Given url PETSTORE_BASE_URL
    And header api_key = "special-key"
    And param status = <status>
    And path GET_PET_BY_STATUS_ENDPOINT
    When method get
    Then status 200
    And match response.headers['content-type'] contains "application/json"
    And match response is not empty
    And match response is an array of objects
    And match each response[*].status == <status>

    Examples:
      | status      |
      | "available" |
      | "pending"   |
      | "sold"      |

  @TCId-1002
  Scenario: TC_GET_PET_BY_STATUS_002 - Invalid status returns empty or error
    Given url PETSTORE_BASE_URL
    And header api_key = "special-key"
    And param status = "invalid_status"
    And path GET_PET_BY_STATUS_ENDPOINT
    When method get
    Then status 200
    And match response is an array of objects
```

**Gherkin Rules Followed**:
- ✅ Proper feature/scenario syntax
- ✅ Background for reusable setup
- ✅ Scenario Outline for parameterized tests
- ✅ Clear, reusable step wording
- ✅ TCId tags for test tracking

---

#### **File 2: Step Definitions**
**Location**: `src/step-definitions/functional/apiSteps.ts`

```typescript
// src/step-definitions/functional/apiSteps.ts
import { Given } from '../../fixtures/Fixtures';
import logger from '../../utils/logger';
import '../../config/env';

/**
 * PETSTORE-specific setup steps.
 * All generic API steps (url, header, param, path, method, status, match)
 * are in apiCommonSteps.ts — reuse them!
 */

Given('PETSTORE base URL is set', async ({ apiService }) => {
  const baseUrl = process.env.PETSTORE_BASE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable PETSTORE_BASE_URL is not defined');
  }
  apiService.setUrl(baseUrl);
  logger.info(`✓ PetStore base URL set: ${baseUrl}`);
});

Given('API request headers are cleared', async ({ apiService }) => {
  apiService.clearHeaders();
  apiService.clearQueryParams();
  logger.info('✓ Request headers and query params cleared');
});
```

**Key Points**:
- ✅ Imports from `Fixtures`
- ✅ Uses `apiService` fixture
- ✅ Only scenario-specific setup (if needed)
- ✅ All generic steps are in `apiCommonSteps.ts`
- ✅ Proper logging with logger utility

---

#### **File 3: Environment Configuration**
**Location**: `env/dev.env` (add/verify these)

```env
PETSTORE_BASE_URL=https://petstore.swagger.io/v2
GET_PET_BY_STATUS_ENDPOINT=/pet/findByStatus
```

**Or use `.env` at root and source via `src/config/env.ts`**.

---

### 🔧 apiCommonSteps.ts Enhancements

**Location**: `src/step-definitions/functional/apiCommonSteps.ts`

Review existing file. If these generic steps are **already present**, skip them. If missing, add:

```typescript
// ============================================================================
// GENERIC REUSABLE API STEPS (Added to apiCommonSteps.ts)
// ============================================================================

/**
 * IMPORTANT: These steps should be added ONLY IF they don't already exist.
 * Check the current apiCommonSteps.ts before adding duplicates.
 */

// Existing in current file:
// ✅ Given('url {word}', ...)
// ✅ Given('header {word} = {string}', ...)
// ✅ Given('param {word} = {string}', ...)
// ✅ Given('path {word}', ...)
// ✅ When('method get', ...)
// ✅ Then('status {int}', ...)
// ✅ Then(/^match response\.headers\['content-type'\] contains "([^"]+)"$/, ...)
// ✅ Then('match response is an array of objects', ...)
// ✅ Then('match response is not empty', ...)
// ✅ Then(/^match each response\[\*\]\.status == "([^"]+)"$/, ...)

// Potentially Missing — Add ONLY if not present:

/**
 * Generic: Set request body from JSON
 * Usage: "And body is {'name': 'John', 'email': 'john@test.com'}"
 */
Given('body is {string}', async ({ apiService }, bodyJson: string) => {
  try {
    const body = JSON.parse(bodyJson);
    apiService.setBody(body);
    logger.info(`✓ Request body set: ${bodyJson}`);
  } catch (e) {
    throw new Error(`Invalid JSON in body: ${bodyJson}`);
  }
});

/**
 * Generic: Send POST request
 * Usage: "When method is post"
 */
When('method post', async ({ apiService }) => {
  await apiService.sendPostRequest();
  logger.info('✓ POST request sent');
});

/**
 * Generic: Send PUT request
 * Usage: "When method is put"
 */
When('method put', async ({ apiService }) => {
  await apiService.sendPutRequest();
  logger.info('✓ PUT request sent');
});

/**
 * Generic: Send DELETE request
 * Usage: "When method is delete"
 */
When('method delete', async ({ apiService }) => {
  await apiService.sendDeleteRequest();
  logger.info('✓ DELETE request sent');
});

/**
 * Generic: Validate JSON field exists
 * Usage: "Then response has field 'id'"
 */
Then('response has field {string}', async ({ apiService }, fieldPath: string) => {
  const data = apiService.getResponseData();
  expect(fieldPath in data, `Field "${fieldPath}" not found in response`).toBe(true);
  logger.info(`✓ Response has field: ${fieldPath}`);
});

/**
 * Generic: Validate JSON field value equals
 * Usage: "Then response.id == 123"
 */
Then(
  /^response\.([^ ]+) == (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = data[fieldPath];
    
    let expected = expectedValue;
    // Handle quoted strings vs numbers
    if (expectedValue.startsWith('"') && expectedValue.endsWith('"')) {
      expected = expectedValue.slice(1, -1);
    } else if (expectedValue === 'true') {
      expected = true;
    } else if (expectedValue === 'false') {
      expected = false;
    } else if (!isNaN(Number(expectedValue))) {
      expected = Number(expectedValue);
    }
    
    expect(actualValue, `Field "${fieldPath}" expected "${expected}" but got "${actualValue}"`).toEqual(expected);
    logger.info(`✓ Response.${fieldPath} == ${expectedValue}`);
  }
);

/**
 * Generic: Validate response array length
 * Usage: "Then response array length is 5"
 */
Then('response array length is {int}', async ({ apiService }, expectedLength: number) => {
  const data = apiService.getResponseData();
  expect(Array.isArray(data), 'Response is not an array').toBe(true);
  expect(data.length, `Array length should be ${expectedLength}`).toBe(expectedLength);
  logger.info(`✓ Response array length is ${expectedLength}`);
});

/**
 * Generic: Store response value for later use
 * Usage: "And I store response.id as 'petId'"
 * Then use: And param petId = {petId} in next request
 */
When('I store response.{word} as {string}', async ({ apiService }, fieldName: string, variableName: string) => {
  const data = apiService.getResponseData();
  const value = data[fieldName];
  
  if (value === undefined) {
    throw new Error(`Field "${fieldName}" not found in response to store as ${variableName}`);
  }
  
  // Store in process.env or global state (framework-specific)
  (global as any)[variableName] = value;
  logger.info(`✓ Stored response.${fieldName} as ${variableName} = ${value}`);
});

/**
 * Generic: Validate response has multiple objects in array with matching field
 * Usage: "Then each response[*].status should equal 'available'"
 * NOTES: This is essentially the same as existing "match each response[*].status"
 * Consider consolidating if needed.
 */
Then(
  /^each response\[\*\]\.([^ ]+) should (equal|be|contain) (.+)$/,
  async ({ apiService }, fieldPath: string, operator: string, expectedValue: string) => {
    const data = apiService.getResponseData();

    expect(Array.isArray(data), 'Response should be an array').toBe(true);
    expect(data.length, 'Response array is empty').toBeGreaterThan(0);

    // Parse expected value
    let expected = expectedValue.replace(/^["']|["']$/g, '');
    if (!isNaN(Number(expectedValue))) {
      expected = Number(expectedValue);
    }

    data.forEach((item: any, index: number) => {
      const actualValue = item[fieldPath];

      if (operator === 'equal' || operator === 'be') {
        expect(actualValue, `Item ${index}: ${fieldPath} should be ${expected}`).toBe(expected);
      } else if (operator === 'contain') {
        expect(
          String(actualValue).includes(String(expected)),
          `Item ${index}: ${fieldPath} should contain ${expected}`
        ).toBe(true);
      }
    });

    logger.info(`✓ Each object in response[*].${fieldPath} matches validation`);
  }
);
```

**Important Notes**:
- ✅ Check **current** `apiCommonSteps.ts` first
- ✅ Only add missing generic steps
- ✅ Do NOT add scenario-specific steps
- ✅ All steps must be reusable across multiple testcases
- ✅ Use proper regex patterns for flexibility

---

### 🔨 ApiService.ts Enhancements

**Location**: `src/services/ApiService.ts`

**Check if these methods exist. Add ONLY if missing**:

```typescript
// Methods that may need to be added to ApiService:

  /**
   * Set request body
   */
  setBody(body: any): void {
    this.requestBody = body;
    logger.info(`Set request body: ${JSON.stringify(body)}`);
  }

  /**
   * Send POST request
   */
  async sendPostRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    logger.info(`Sending POST request to: ${fullUrl}`);
    logger.info(`Body: ${JSON.stringify(this.requestBody)}`);

    const response = await this.request.post(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
      data: this.requestBody,
    });

    await this.captureResponse(response);
  }

  /**
   * Send PUT request
   */
  async sendPutRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    logger.info(`Sending PUT request to: ${fullUrl}`);

    const response = await this.request.put(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
      data: this.requestBody,
    });

    await this.captureResponse(response);
  }

  /**
   * Send DELETE request
   */
  async sendDeleteRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    logger.info(`Sending DELETE request to: ${fullUrl}`);

    const response = await this.request.delete(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
    });

    await this.captureResponse(response);
  }

  /**
   * Helper: Capture response data consistently
   */
  private async captureResponse(response: any): Promise<void> {
    const contentType = response.headers()['content-type'] || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    this.lastResponse = {
      status: response.status(),
      contentType,
      data: body,
      headers: response.headers() as Record<string, string>,
    };

    logger.info(`Response status: ${this.lastResponse.status}`);
    logger.info(`Response body: ${JSON.stringify(this.lastResponse.data)}`);
  }
```

---

## ✅ Validation Checklist

Before submitting a converted testcase, verify:

- [ ] Feature file has valid Gherkin syntax
- [ ] All steps are generic and reusable (not scenario-specific)
- [ ] No hallucinated payload fields or assumptions
- [ ] Environment variables defined in `.env` files
- [ ] Response validation covers all requirements
- [ ] TCId tag present on scenario(s)
- [ ] No duplicate steps in different files
- [ ] Proper logging at each step
- [ ] Async/await properly used in step definitions
- [ ] TypeScript types are correct
- [ ] No hardcoded values (use env vars or test data)

---

## 🎯 Common Patterns & Examples

### Pattern 1: Query Parameter Filtering
```gherkin
Given url BASE_URL
And header Authorization = "Bearer <token>"
And param status = "active"
And param limit = "10"
And path ENDPOINT_PATH
When method get
Then status 200
And match response is an array of objects
```

### Pattern 2: POST with JSON Body
```gherkin
Given url BASE_URL
And header Content-Type = "application/json"
And body is '{"name":"John","email":"john@test.com"}'
And path /users
When method post
Then status 201
And response has field "id"
And response.name == "John"
```

### Pattern 3: PUT Request with Status Update
```gherkin
Given url BASE_URL
And param userId = "123"
And body is '{"status":"inactive"}'
And path /users/{userId}
When method put
Then status 200
And response.status == "inactive"
```

### Pattern 4: Multi-Step Flow (Get → Store → Use)
```gherkin
Given url BASE_URL
And path /users
When method get
Then status 200
And I store response[0].id as "userId"

Given url BASE_URL
And param userId = {userId}
And path /users/{userId}
When method get
Then status 200
And response.id == {userId}
```

---

## 🚫 Anti-Patterns (Do NOT Do)

❌ **Creating scenario-specific steps**
```typescript
// BAD - Scenario-specific
Given('user creates a pet with name John', async ({ apiService }) => {
  await apiService.createPetWithJohn();
});
```

✅ **Create generic steps instead**
```typescript
// GOOD - Generic, reusable
Given('body is {string}', async ({ apiService }, bodyJson: string) => {
  apiService.setBody(JSON.parse(bodyJson));
});

When('method post', async ({ apiService }) => {
  await apiService.sendPostRequest();
});
```

---

❌ **Hardcoding test data**
```typescript
// BAD
And header Authorization = "Bearer abc123xyz"
```

✅ **Use environment variables**
```typescript
// GOOD
And header Authorization = "{AUTH_TOKEN}"
// Then set AUTH_TOKEN=Bearer abc123xyz in .env
```

---

❌ **Assuming response structure**
```typescript
// BAD - Hallucinated fields
And response.createdAt should be today
```

✅ **Validate only what's in the specification**
```typescript
// GOOD - Explicit from requirements
And response has field "id"
And response.status == "available"
```

---

## 📊 Step Definition Mapping Reference

| Gherkin Step | Existing? | ApiService Method | Notes |
|--|--|--|--|
| `Given url {word}` | ✅ Yes | `setUrl()` | Reuse |
| `Given header {word} = {string}` | ✅ Yes | `setHeader()` | Reuse |
| `Given param {word} = {string}` | ✅ Yes | `setQueryParam()` | Reuse |
| `Given path {word}` | ✅ Yes | `setPath()` | Reuse |
| `When method get` | ✅ Yes | `sendGetRequest()` | Reuse |
| `When method post` | ❓ Check | `sendPostRequest()` | Add if missing |
| `When method put` | ❓ Check | `sendPutRequest()` | Add if missing |
| `When method delete` | ❓ Check | `sendDeleteRequest()` | Add if missing |
| `Then status {int}` | ✅ Yes | `getResponseStatus()` | Reuse |
| `Then match response.headers['content-type'] contains` | ✅ Yes | `validateHeaderContains()` | Reuse |
| `Then match response is not empty` | ✅ Yes | Internal validation | Reuse |
| `Then match response is an array of objects` | ✅ Yes | `isResponseArrayOfObjects()` | Reuse |
| `Then match each response[*].status ==` | ✅ Yes | `validateEveryFieldEquals()` | Reuse |
| `Given body is {string}` | ❓ Check | `setBody()` | Add if missing |
| `Then response has field {string}` | ❓ Check | Generic check | Add if missing |
| `Then response.{field} == {value}` | ❓ Check | Generic comparison | Add if missing |

---

## 🔍 Testing & Validation

### Run a Single Feature
```bash
npm run bdd:fresh -- -g "@TCId-1001"
```

### Run All API Tests
```bash
npm run bdd:fresh -- -t "api"
```

### View Test Report
```bash
npm run report:open
```

---

## 📝 Summary

### Conversion Workflow
1. ✅ Read plain-English testcase
2. ✅ Map steps to existing framework helpers
3. ✅ Identify missing generic reusable steps
4. ✅ Create `.feature` file (Gherkin)
5. ✅ Create/update step definitions (TypeScript)
6. ✅ Enhance `apiCommonSteps.ts` with missing generic steps
7. ✅ Add environment variables to `.env`
8. ✅ Validate against anti-patterns
9. ✅ Run and verify tests pass

### Golden Rules
- 🏆 **Reuse first** — Check existing steps before creating new ones
- 🏆 **Generic over specific** — `setBody()` not `createUserWithJohn()`
- 🏆 **No hallucinations** — Only what's in the testcase specification
- 🏆 **Maximum code reuse** — One place, many scenarios
- 🏆 **Clear, maintainable code** — TypeScript strict mode, proper logging
- 🏆 **Enterprise standard** — Professional, production-grade code

---

## 📚 Related Files Reference

- Framework documentation: [FRAMEWORK_DOCUMENTATION.md](FRAMEWORK_DOCUMENTATION.md)
- ApiService implementation: [src/services/ApiService.ts](src/services/ApiService.ts)
- Common steps: [src/step-definitions/functional/apiCommonSteps.ts](src/step-definitions/functional/apiCommonSteps.ts)
- Example feature: [src/features/functional/petstore.feature](src/features/functional/petstore.feature)
- Fixtures & setup: [src/fixtures/Fixtures.ts](src/fixtures/Fixtures.ts)

---

**Document Version**: 1.0  
**Last Updated**: May 2, 2026  
**Framework**: Playwright + Cucumber + TypeScript  
**Status**: Ready for use
