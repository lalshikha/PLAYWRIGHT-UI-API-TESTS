import { APIRequestContext, expect } from '@playwright/test';
import logger from '../utils/logger';
import { saucedemoUrl } from '../utils/testData';

export type ApiResponse = {
  status: number;
  contentType: string;
  data: any;
  headers: Record<string, string>;
  responseTime?: number;
};

export default class ApiService {
  private lastResponse: ApiResponse | null = null;
  private baseUrl = '';
  private path = '';
  private headers: Record<string, string> = {};
  private queryParams: Record<string, string> = {};
  private requestBody: any = null;

  constructor(private readonly request: APIRequestContext) {}

  setUrl(url: string): void {
    this.baseUrl = url;
    logger.info(`Set base URL: ${this.baseUrl}`);
  }

  setPath(path: string): void {
    this.path = path;
    logger.info(`Set path: ${this.path}`);
  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value;
    logger.info(`Set header ${key}=${value}`);
  }

  setQueryParam(key: string, value: string): void {
    this.queryParams[key] = value;
    logger.info(`Set query param ${key}=${value}`);
  }

  clearHeaders(): void {
    this.headers = {};
  }

  clearQueryParams(): void {
    this.queryParams = {};
  }

  clearAll(): void {
    this.baseUrl = '';
    this.path = '';
    this.headers = {};
    this.queryParams = {};
    this.requestBody = null;
    this.lastResponse = null;
  }

  getLastResponse(): ApiResponse | null {
    return this.lastResponse;
  }

  async sendGetRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending GET request to: ${fullUrl}`);
    logger.info(`Headers: ${JSON.stringify(this.headers)}`);
    logger.info(`Query params: ${JSON.stringify(this.queryParams)}`);

    const response = await this.request.get(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
    });

    await this.captureResponse(response, startTime);
  }

  getResponseStatus(): number {
    if (!this.lastResponse) throw new Error('No response has been sent yet');
    return this.lastResponse.status;
  }

  getResponseHeaders(): Record<string, string> {
    if (!this.lastResponse) throw new Error('No response has been sent yet');
    return this.lastResponse.headers;
  }

  getResponseData(): any {
    if (!this.lastResponse) throw new Error('No response has been sent yet');
    return this.lastResponse.data;
  }

  getResponseContentType(): string {
    if (!this.lastResponse) throw new Error('No response has been sent yet');
    return this.lastResponse.contentType;
  }

  isResponseArray(): boolean {
    const data = this.getResponseData();
    return Array.isArray(data);
  }

  isResponseArrayOfObjects(): boolean {
    const data = this.getResponseData();
    if (!Array.isArray(data)) return false;

    return data.every(
      (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
    );
  }

  validateHeaderContains(headerName: string, value: string): void {
    const headers = this.getResponseHeaders();
    const headerValue = headers[headerName.toLowerCase()] || '';

    if (!headerValue.includes(value)) {
      throw new Error(
        `Header "${headerName}" with value "${headerValue}" does not contain "${value}"`
      );
    }
  }

  validateEveryFieldEquals(fieldPath: string, expectedValue: any): void {
    const data = this.getResponseData();

    if (!Array.isArray(data)) {
      throw new Error('Response data is not an array');
    }

    if (data.length === 0) {
      throw new Error(
        `Response data array is empty; cannot validate field "${fieldPath}"`
      );
    }

    data.forEach((item, index) => {
      if (!(fieldPath in item)) {
        throw new Error(`Item at index ${index} does not have field "${fieldPath}"`);
      }

      const actualValue = item[fieldPath];
      expect(
        actualValue,
        `Item at index ${index} has "${fieldPath}" = "${actualValue}", expected "${expectedValue}"`
      ).toBe(expectedValue);
    });
  }

  async validateSiteIsReachable(): Promise<void> {
    logger.info('API check: GET ' + saucedemoUrl);
    const res = await this.request.get(saucedemoUrl);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
    logger.info('API check passed: site reachable');
  }

  // ============================================================================
  // REQUEST BODY
  // ============================================================================

  /**
   * Set request body
   */
  setBody(body: any): void {
    this.requestBody = body;
    if (body) {
      logger.info(`Set request body: ${JSON.stringify(body)}`);
    } else {
      logger.info('Request body cleared');
    }
  }

  // ============================================================================
  // HTTP METHODS - POST, PUT, PATCH, DELETE, etc.
  // ============================================================================

  /**
   * Send POST request
   */
  async sendPostRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending POST request to: ${fullUrl}`);
    logger.info(`Headers: ${JSON.stringify(this.headers)}`);
    logger.info(`Body: ${JSON.stringify(this.requestBody)}`);

    const response = await this.request.post(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
      data: this.requestBody,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Send PUT request
   */
  async sendPutRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending PUT request to: ${fullUrl}`);
    logger.info(`Headers: ${JSON.stringify(this.headers)}`);
    logger.info(`Body: ${JSON.stringify(this.requestBody)}`);

    const response = await this.request.put(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
      data: this.requestBody,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Send PATCH request
   */
  async sendPatchRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending PATCH request to: ${fullUrl}`);
    logger.info(`Headers: ${JSON.stringify(this.headers)}`);
    logger.info(`Body: ${JSON.stringify(this.requestBody)}`);

    const response = await this.request.patch(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
      data: this.requestBody,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Send DELETE request
   */
  async sendDeleteRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending DELETE request to: ${fullUrl}`);
    logger.info(`Headers: ${JSON.stringify(this.headers)}`);

    const response = await this.request.delete(fullUrl, {
      headers: this.headers,
      params: this.queryParams,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Send OPTIONS request
   */
  async sendOptionsRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending OPTIONS request to: ${fullUrl}`);

    const response = await this.request.fetch(fullUrl, {
      method: 'OPTIONS',
      headers: this.headers,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Send HEAD request
   */
  async sendHeadRequest(): Promise<void> {
    const fullUrl = `${this.baseUrl}${this.path}`;
    const startTime = Date.now();

    logger.info(`Sending HEAD request to: ${fullUrl}`);

    const response = await this.request.head(fullUrl, {
      headers: this.headers,
    });

    await this.captureResponse(response, startTime);
  }

  /**
   * Helper: Capture response data consistently across all HTTP methods
   */
  private async captureResponse(response: any, startTime: number): Promise<void> {
    const responseTime = Date.now() - startTime;
    const contentType = response.headers()['content-type'] || '';
    
    let body: any;
    try {
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else if (contentType.includes('text/')) {
        body = await response.text();
      } else {
        body = await response.text().catch(() => null);
      }
    } catch (e) {
      body = null;
      logger.info('Could not parse response body');
    }

    this.lastResponse = {
      status: response.status(),
      contentType,
      data: body,
      headers: response.headers() as Record<string, string>,
      responseTime,
    };

    logger.info(`Response status: ${this.lastResponse.status}`);
    logger.info(`Response time: ${responseTime}ms`);
    logger.info(`Response content-type: ${this.lastResponse.contentType}`);
    logger.info(`Response body: ${JSON.stringify(this.lastResponse.data)}`);
  }

  // ============================================================================
  // RESPONSE FIELD HELPERS
  // ============================================================================

  /**
   * Check if response has a field (supports nested paths like "user.name")
   */
  hasField(fieldPath: string): boolean {
    const value = this.getFieldValue(fieldPath);
    return value !== undefined;
  }

  /**
   * Get field value from response (supports nested paths like "user.profile.email")
   */
  getFieldValue(fieldPath: string): any {
    const data = this.getResponseData();
    
    if (!fieldPath || data === null || data === undefined) {
      return undefined;
    }

    // Handle array indexing like response[0].id
    const pathParts = fieldPath.split('.');
    let current = data;

    for (const part of pathParts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array index notation [0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, fieldName, index] = arrayMatch;
        current = current[fieldName]?.[Number(index)];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Get response time in milliseconds
   */
  getResponseTime(): number {
    if (!this.lastResponse) throw new Error('No response has been sent yet');
    return this.lastResponse.responseTime || 0;
  }
}