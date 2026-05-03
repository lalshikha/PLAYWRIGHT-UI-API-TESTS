// utils/dataUtils.ts
import { faker } from '@faker-js/faker';
import {
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format as formatDate,
  parseISO,
  isValid,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import path from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import ExcelJS from 'exceljs';

export type JsonObject = Record<string, any>;
export type JsonArray = any[];

export type DateInput = Date | string | number;

export const DataUtils = {
  // -------------------------
  // Faker (common test data)
  // -------------------------
  personName(): string {
    return faker.person.fullName();
  },

  email(): string {
    return faker.internet.email();
  },

  phone(): string {
    return faker.phone.number();
  },

  uuid(): string {
    return faker.string.uuid();
  },

  // -------------------------
  // Random strings
  // -------------------------
  randomAlphaNum(length = 10): string {
    return faker.string.alphanumeric({ length });
  },

  randomNumeric(length = 6): string {
    return faker.string.numeric(length);
  },

  randomFrom<T>(items: readonly T[]): T {
    return faker.helpers.arrayElement(items as T[]);
  },

  // -------------------------
  // Dates
  // -------------------------
  now(): Date {
    return new Date();
  },

  randomDateBetween(from: DateInput, to: DateInput): Date {
    return faker.date.between({ from: new Date(from), to: new Date(to) });
  },

  addDays(date: DateInput, days: number): Date {
    return addDays(new Date(date), days);
  },

  subDays(date: DateInput, days: number): Date {
    return subDays(new Date(date), days);
  },

  addMonths(date: DateInput, months: number): Date {
    return addMonths(new Date(date), months);
  },

  subMonths(date: DateInput, months: number): Date {
    return subMonths(new Date(date), months);
  },

  addYears(date: DateInput, years: number): Date {
    return addYears(new Date(date), years);
  },

  subYears(date: DateInput, years: number): Date {
    return subYears(new Date(date), years);
  },

  // Format using local timezone
  format(date: DateInput, pattern = 'yyyy-MM-dd'): string {
    return formatDate(new Date(date), pattern);
  },

  // Format in specific timezone (e.g. 'Asia/Kolkata')
  formatTZ(date: DateInput, timeZone: string, pattern = 'yyyy-MM-dd HH:mm:ssXXX'): string {
    return formatInTimeZone(new Date(date), timeZone, pattern);
  },

  parseISODate(value: string): Date {
    const d = parseISO(value);
    if (!isValid(d)) throw new Error(`Invalid ISO date: ${value}`);
    return d;
  },

  // -------------------------
  // JSON file helpers
  // -------------------------
  async readJson<T = any>(filePath: string): Promise<T> {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  },

  async writeJson(filePath: string, data: any): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  },

  // -------------------------
  // Excel helpers (ExcelJS)
  // -------------------------
  async readExcelSheet(filePath: string, sheetNameOrIndex: string | number = 1): Promise<any[][]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet =
      typeof sheetNameOrIndex === 'number'
        ? workbook.worksheets[sheetNameOrIndex - 1]
        : workbook.getWorksheet(sheetNameOrIndex);

    if (!sheet) throw new Error(`Sheet not found: ${sheetNameOrIndex}`);

    const rows: any[][] = [];
    sheet.eachRow((row) => {
      // row.values[0] is empty by design in ExcelJS; slice it out
      rows.push((row.values as any[]).slice(1));
    });

    return rows;
  },
} as const;

/**
 * Replace values equal to 'random' based on a mapping object.
 * Example:
 *   replaceRandom({ username: 'random' }, { username: 'john' }) -> { username: 'john' }
 */
export function replaceRandom<T extends JsonObject>(obj: T, randomMap: JsonObject): T {
  const out: any = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(out)) {
    const val = out[key];

    if (val === 'random') {
      out[key] = randomMap[key] ?? DataUtils.randomAlphaNum(10);
      continue;
    }

    if (val && typeof val === 'object') {
      out[key] = replaceRandom(val, randomMap);
    }
  }

  return out;
}
