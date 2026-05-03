import { Given, When, Then } from '../../fixtures/Fixtures';
import { expect } from '@playwright/test';
import logger from '../../utils/logger';
import '../../config/env';

function parseExpectedValue(raw: string): any {
  const value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;

  if (!Number.isNaN(Number(value)) && value !== '') {
    return Number(value);
  }

  return value;
}

function normalizePath(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1');
}

function getPathValue(obj: any, path: string): any {
  const normalizedPath = normalizePath(path);

  return normalizedPath
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key: string) => acc?.[key], obj);
}

function hasPath(obj: any, path: string): boolean {
  return getPathValue(obj, path) !== undefined;
}

function expectArrayResponse(response: any): any[] {
  expect(Array.isArray(response), 'Response should be an array').toBe(true);
  return response as any[];
}

function assertResponseNotEmpty(response: any): void {
  expect(response, 'Response data should be defined').toBeDefined();

  if (Array.isArray(response)) {
    expect(response.length, 'Response array is empty').toBeGreaterThan(0);
    return;
  }

  if (typeof response === 'object' && response !== null) {
    expect(
      Object.keys(response).length,
      'Response object is empty'
    ).toBeGreaterThan(0);
    return;
  }

  expect(
    String(response).trim().length,
    'Response value is empty'
  ).toBeGreaterThan(0);
}

function getHeaderValue(headers: Record<string, string>, headerName: string): string {
  return (
    Object.entries(headers).find(
      ([key]) => key.toLowerCase() === headerName.toLowerCase()
    )?.[1] || ''
  );
}

// ============================================================================
// REQUEST SETUP
// ============================================================================

Given('url {word}', async ({ apiService }, envVarName: string) => {
  const url = process.env[envVarName];
  if (!url) {
    throw new Error(`Environment variable ${envVarName} is not defined`);
  }

  apiService.setUrl(url);
  logger.info(`Set URL from ${envVarName}: ${url}`);
});

Given('header {word} = {string}', async ({ apiService }, key: string, value: string) => {
  apiService.setHeader(key, value);
  logger.info(`Set header ${key}=${value}`);
});

Given('param {word} = {string}', async ({ apiService }, key: string, value: string) => {
  apiService.setQueryParam(key, value);
  logger.info(`Set query param ${key}=${value}`);
});

Given('path {word}', async ({ apiService }, envVarName: string) => {
  const path = process.env[envVarName];
  if (!path) {
    throw new Error(`Environment variable ${envVarName} is not defined`);
  }

  apiService.setPath(path);
  logger.info(`Set path from ${envVarName}: ${path}`);
});

Given('body is {string}', async ({ apiService }, bodyJson: string) => {
  try {
    const body = JSON.parse(bodyJson);
    apiService.setBody(body);
    logger.info(`✓ Request body set: ${bodyJson}`);
  } catch {
    throw new Error(`Invalid JSON in body: ${bodyJson}`);
  }
});

Given('request body is cleared', async ({ apiService }) => {
  apiService.setBody(null);
  logger.info('✓ Request body cleared');
});

Given('all request context is cleared', async ({ apiService }) => {
  apiService.clearAll();
  logger.info('✓ All request context cleared (URL, headers, params, body)');
});

// ============================================================================
// HTTP METHODS
// ============================================================================

When('method get', async ({ apiService }) => {
  await apiService.sendGetRequest();
  logger.info('✓ GET request sent');
});

When('method post', async ({ apiService }) => {
  await apiService.sendPostRequest();
  logger.info('✓ POST request sent');
});

When('method put', async ({ apiService }) => {
  await apiService.sendPutRequest();
  logger.info('✓ PUT request sent');
});

When('method patch', async ({ apiService }) => {
  await apiService.sendPatchRequest();
  logger.info('✓ PATCH request sent');
});

When('method delete', async ({ apiService }) => {
  await apiService.sendDeleteRequest();
  logger.info('✓ DELETE request sent');
});

When('method options', async ({ apiService }) => {
  await apiService.sendOptionsRequest();
  logger.info('✓ OPTIONS request sent');
});

When('method head', async ({ apiService }) => {
  await apiService.sendHeadRequest();
  logger.info('✓ HEAD request sent');
});

// ============================================================================
// BASIC RESPONSE VALIDATIONS
// ============================================================================

Then('status {int}', async ({ apiService }, expectedStatus: number) => {
  const actualStatus = apiService.getResponseStatus();
  expect(actualStatus, `Expected status ${expectedStatus}, but got ${actualStatus}`).toBe(expectedStatus);
  logger.info(`✓ Status is ${expectedStatus}`);
});

Then(
  /^match response\.headers\['content-type'\] contains "([^"]+)"$/,
  async ({ apiService }, expectedValue: string) => {
    apiService.validateHeaderContains('content-type', expectedValue);
    logger.info(`✓ Header content-type contains ${expectedValue}`);
  }
);

Then('match response is not empty', async ({ apiService }) => {
  const response = apiService.getResponseData();
  assertResponseNotEmpty(response);
  logger.info('✓ Response is not empty');
});

Then('match response is empty', async ({ apiService }) => {
  const response = apiService.getResponseData();

  if (Array.isArray(response)) {
    expect(response.length, 'Response array should be empty').toBe(0);
  } else if (typeof response === 'object' && response !== null) {
    expect(Object.keys(response).length, 'Response object should be empty').toBe(0);
  } else {
    expect(response, 'Response should be empty/null').toBeFalsy();
  }

  logger.info('✓ Response is empty');
});

Then('match response is an object', async ({ apiService }) => {
  const data = apiService.getResponseData();
  expect(
    typeof data === 'object' && data !== null && !Array.isArray(data),
    'Response should be an object'
  ).toBe(true);
  logger.info('✓ Response is an object');
});

Then('match response is an array of objects', async ({ apiService }) => {
  const response = apiService.getResponseData();
  const data = expectArrayResponse(response);

  const isArrayOfObjects = data.every(
    (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
  );

  expect(isArrayOfObjects, 'Response should be an array of objects').toBe(true);
  logger.info('✓ Response is an array of objects');
});

Then('match response is null', async ({ apiService }) => {
  const data = apiService.getResponseData();
  expect(data, 'Response should be null').toBeNull();
  logger.info('✓ Response is null');
});

Then('match response is a number', async ({ apiService }) => {
  const data = apiService.getResponseData();
  expect(typeof data === 'number', 'Response should be a number').toBe(true);
  logger.info('✓ Response is a number');
});

Then('match response is a string', async ({ apiService }) => {
  const data = apiService.getResponseData();
  expect(typeof data === 'string', 'Response should be a string').toBe(true);
  logger.info('✓ Response is a string');
});

Then('match response is a boolean', async ({ apiService }) => {
  const data = apiService.getResponseData();
  expect(typeof data === 'boolean', 'Response should be a boolean').toBe(true);
  logger.info('✓ Response is a boolean');
});

// ============================================================================
// RESPONSE FIELD VALIDATIONS
// ============================================================================

Then('match response has field {string}', async ({ apiService }, fieldPath: string) => {
  const data = apiService.getResponseData();
  expect(hasPath(data, fieldPath), `Field "${fieldPath}" not found in response`).toBe(true);
  logger.info(`✓ Response has field: ${fieldPath}`);
});

Then(
  /^match response\.(\S+) == (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = getPathValue(data, fieldPath);
    const expected = parseExpectedValue(expectedValue);

    expect(
      actualValue,
      `Field "${fieldPath}" expected "${expected}" but got "${actualValue}"`
    ).toEqual(expected);

    logger.info(`✓ Response.${fieldPath} == ${expectedValue}`);
  }
);

Then(
  /^match response\.(\S+) != (.+)$/,
  async ({ apiService }, fieldPath: string, unexpectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = getPathValue(data, fieldPath);
    const unexpected = parseExpectedValue(unexpectedValue);

    expect(
      actualValue,
      `Field "${fieldPath}" should not be "${unexpected}"`
    ).not.toEqual(unexpected);

    logger.info(`✓ Response.${fieldPath} != ${unexpectedValue}`);
  }
);

Then(
  /^match response\.(?!headers\b)(\S+) contains "([^"]+)"$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = getPathValue(data, fieldPath);

    expect(actualValue, `Field "${fieldPath}" not found in response`).toBeDefined();
    expect(
      String(actualValue),
      `Expected response.${fieldPath} to contain "${expectedValue}", but got "${actualValue}"`
    ).toContain(expectedValue);

    logger.info(`✓ Response.${fieldPath} contains "${expectedValue}"`);
  }
);

Then(
  /^match response\.(\S+) does not contain "([^"]+)"$/,
  async ({ apiService }, fieldPath: string, unexpectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = getPathValue(data, fieldPath);

    expect(actualValue, `Field "${fieldPath}" not found in response`).toBeDefined();
    expect(
      String(actualValue).includes(unexpectedValue),
      `Field "${fieldPath}" should not contain "${unexpectedValue}"`
    ).toBe(false);

    logger.info(`✓ Response.${fieldPath} does not contain "${unexpectedValue}"`);
  }
);

Then(
  /^match response\.(\S+) > (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = Number(getPathValue(data, fieldPath));
    const expected = Number(expectedValue);

    expect(
      actualValue > expected,
      `Field "${fieldPath}" ${actualValue} is not greater than ${expected}`
    ).toBe(true);

    logger.info(`✓ Response.${fieldPath} > ${expectedValue}`);
  }
);

Then(
  /^match response\.(\S+) < (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = Number(getPathValue(data, fieldPath));
    const expected = Number(expectedValue);

    expect(
      actualValue < expected,
      `Field "${fieldPath}" ${actualValue} is not less than ${expected}`
    ).toBe(true);

    logger.info(`✓ Response.${fieldPath} < ${expectedValue}`);
  }
);

Then(
  /^match response\.(\S+) >= (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = Number(getPathValue(data, fieldPath));
    const expected = Number(expectedValue);

    expect(
      actualValue >= expected,
      `Field "${fieldPath}" ${actualValue} is not >= ${expected}`
    ).toBe(true);

    logger.info(`✓ Response.${fieldPath} >= ${expectedValue}`);
  }
);

Then(
  /^match response\.(\S+) <= (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const data = apiService.getResponseData();
    const actualValue = Number(getPathValue(data, fieldPath));
    const expected = Number(expectedValue);

    expect(
      actualValue <= expected,
      `Field "${fieldPath}" ${actualValue} is not <= ${expected}`
    ).toBe(true);

    logger.info(`✓ Response.${fieldPath} <= ${expectedValue}`);
  }
);

// ============================================================================
// ARRAY VALIDATIONS
// ============================================================================

Then(
  /^match response array length is (greater than |less than |at least |at most )?(\d+)$/,
  async ({ apiService }, operator: string | undefined, expectedLength: string) => {
    const response = apiService.getResponseData();
    const data = expectArrayResponse(response);

    const length = data.length;
    const expected = Number(expectedLength);

    if (!operator || operator.trim() === '') {
      expect(length, `Array length should be ${expected}`).toBe(expected);
      logger.info(`✓ Response array length is ${expected}`);
      return;
    }

    if (operator.includes('greater than')) {
      expect(length > expected, `Array length ${length} is not greater than ${expected}`).toBe(true);
      logger.info(`✓ Response array length is greater than ${expected}`);
      return;
    }

    if (operator.includes('less than')) {
      expect(length < expected, `Array length ${length} is not less than ${expected}`).toBe(true);
      logger.info(`✓ Response array length is less than ${expected}`);
      return;
    }

    if (operator.includes('at least')) {
      expect(length >= expected, `Array length ${length} is not at least ${expected}`).toBe(true);
      logger.info(`✓ Response array length is at least ${expected}`);
      return;
    }

    if (operator.includes('at most')) {
      expect(length <= expected, `Array length ${length} is not at most ${expected}`).toBe(true);
      logger.info(`✓ Response array length is at most ${expected}`);
    }
  }
);

Then(
  /^match each response\[\*\]\.(\S+) == (.+)$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const response = apiService.getResponseData();
    const data = expectArrayResponse(response);

    expect(
      data.length,
      `Response array is empty. Cannot validate that each response item has ${fieldPath} == ${expectedValue}.`
    ).toBeGreaterThan(0);

    const expected = parseExpectedValue(expectedValue);
    const actualValues = data.map((item: any) => getPathValue(item, fieldPath));

    expect(
      actualValues.every((val: any) => val === expected),
      `Not all items have ${fieldPath} == "${expected}". Found values: ${JSON.stringify(actualValues)}`
    ).toBe(true);

    logger.info(`✓ Each response[*].${fieldPath} == ${expectedValue}`);
  }
);

Then(
  /^match each response\[\*\]\.(\S+) != (.+)$/,
  async ({ apiService }, fieldPath: string, unexpectedValue: string) => {
    const response = apiService.getResponseData();
    const data = expectArrayResponse(response);

    expect(data.length, 'Response array is empty').toBeGreaterThan(0);

    const unexpected = parseExpectedValue(unexpectedValue);

    data.forEach((item: any, index: number) => {
      const actualValue = getPathValue(item, fieldPath);

      expect(
        actualValue !== unexpected,
        `Item at index ${index} has ${fieldPath} = "${actualValue}", expected not to be "${unexpected}"`
      ).toBe(true);
    });

    logger.info(`✓ Each response[*].${fieldPath} != ${unexpectedValue}`);
  }
);

Then(
  /^match each response\[\*\]\.(\S+) contains "([^"]+)"$/,
  async ({ apiService }, fieldPath: string, expectedValue: string) => {
    const response = apiService.getResponseData();
    const data = expectArrayResponse(response);

    expect(data.length, 'Response array is empty').toBeGreaterThan(0);

    data.forEach((item: any, index: number) => {
      const actualValue = String(getPathValue(item, fieldPath) ?? '');

      expect(
        actualValue.includes(expectedValue),
        `Item at index ${index}: "${actualValue}" does not contain "${expectedValue}"`
      ).toBe(true);
    });

    logger.info(`✓ Each response[*].${fieldPath} contains "${expectedValue}"`);
  }
);

// ============================================================================
// STORE VALUES
// ============================================================================

When(
  /^I store response\.(\S+) as "([^"]+)"$/,
  async ({ apiService }, fieldPath: string, variableName: string) => {
    const data = apiService.getResponseData();
    const value = getPathValue(data, fieldPath);

    if (value === undefined) {
      throw new Error(`Field "${fieldPath}" not found in response to store as ${variableName}`);
    }

    (globalThis as any)[variableName] = value;
    process.env[variableName] = String(value);
    logger.info(`✓ Stored response.${fieldPath} as ${variableName} = ${value}`);
  }
);

When(
  /^I store the response as "([^"]+)"$/,
  async ({ apiService }, variableName: string) => {
    const response = apiService.getResponseData();
    (globalThis as any)[variableName] = response;
    logger.info(`✓ Stored entire response as ${variableName}`);
  }
);

// ============================================================================
// RESPONSE HEADER VALIDATIONS
// ============================================================================

Then('match response has header {string}', async ({ apiService }, headerName: string) => {
  const headers = apiService.getResponseHeaders();
  const headerExists = Object.keys(headers).some(
    (key) => key.toLowerCase() === headerName.toLowerCase()
  );

  expect(headerExists, `Header "${headerName}" not found in response`).toBe(true);
  logger.info(`✓ Response has header: ${headerName}`);
});

Then(
  /^match response header (\S+) == "([^"]*)"$/,
  async ({ apiService }, headerName: string, expectedValue: string) => {
    const headers = apiService.getResponseHeaders();
    const headerValue = getHeaderValue(headers, headerName);

    expect(
      headerValue,
      `Header "${headerName}" expected "${expectedValue}" but got "${headerValue}"`
    ).toBe(expectedValue);

    logger.info(`✓ Response header ${headerName} == "${expectedValue}"`);
  }
);

Then(
  /^match response header (\S+) contains "([^"]+)"$/,
  async ({ apiService }, headerName: string, expectedValue: string) => {
    const headers = apiService.getResponseHeaders();
    const headerValue = getHeaderValue(headers, headerName);

    expect(
      headerValue.includes(expectedValue),
      `Header "${headerName}" with value "${headerValue}" does not contain "${expectedValue}"`
    ).toBe(true);

    logger.info(`✓ Response header ${headerName} contains "${expectedValue}"`);
  }
);

// ============================================================================
// RESPONSE TIME VALIDATION
// ============================================================================

Then(
  /^match response time should be (less than|greater than) (\d+) ms$/,
  async ({ apiService }, operator: string, expectedTime: string) => {
    const responseTime = apiService.getResponseTime();
    const expected = Number(expectedTime);

    if (operator === 'less than') {
      expect(
        responseTime < expected,
        `Response time ${responseTime}ms is not less than ${expected}ms`
      ).toBe(true);
      logger.info(`✓ Response time ${responseTime}ms is less than ${expected}ms`);
      return;
    }

    expect(
      responseTime > expected,
      `Response time ${responseTime}ms is not greater than ${expected}ms`
    ).toBe(true);
    logger.info(`✓ Response time ${responseTime}ms is greater than ${expected}ms`);
  }
);