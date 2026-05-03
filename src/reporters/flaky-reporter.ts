import fs from 'fs';
import path from 'path';
import type { Reporter, TestCase, FullResult, TestResult } from '@playwright/test/reporter';

type AttemptStatus = TestResult['status'];

type AttemptEntry = {
  retry: number;
  status: AttemptStatus;
  duration: number;
  error?: string;
};

type ReportEntry = {
  title: string;
  fullTitle: string;
  file: string;
  line: number;
  column: number;
  project: string;
  outcome: ReturnType<TestCase['outcome']>;
  retriesConfigured: number;
  retriesUsed: number;
  attempts: AttemptEntry[];
};

class RetryInsightReporter implements Reporter {
  private readonly tests = new Map<string, TestCase>();

  onTestEnd(test: TestCase): void {
    this.tests.set(this.keyOf(test), test);
  }

  async onEnd(_: FullResult): Promise<void> {
    const all = Array.from(this.tests.values())
      .map(test => this.toEntry(test))
      .sort((a, b) => a.fullTitle.localeCompare(b.fullTitle));

    const retried = all.filter(t => t.retriesUsed > 0);
    const flaky = all.filter(t => t.outcome === 'flaky');
    const failedAfterRetries = all.filter(
      t => t.retriesUsed > 0 && t.outcome === 'unexpected'
    );

    const outDir = path.resolve(process.cwd(), 'test-results');
    fs.mkdirSync(outDir, { recursive: true });

    this.writeJson(path.join(outDir, 'retried-tests.json'), retried);
    this.writeJson(path.join(outDir, 'flaky-tests.json'), flaky);
    this.writeJson(path.join(outDir, 'failed-after-retries.json'), failedAfterRetries);

    this.writeMarkdown(path.join(outDir, 'retried-tests.md'), 'Retried Tests', retried);
    this.writeMarkdown(path.join(outDir, 'flaky-tests.md'), 'Flaky Tests', flaky);
    this.writeMarkdown(
      path.join(outDir, 'failed-after-retries.md'),
      'Failed After Retries',
      failedAfterRetries
    );

    console.log('');
    console.log(`Retried tests: ${retried.length}`);
    console.log(`Flaky tests: ${flaky.length}`);
    console.log(`Failed after retries: ${failedAfterRetries.length}`);
    console.log(
      `Artifacts written: ${path.join(outDir, 'retried-tests.json')}, ${path.join(outDir, 'flaky-tests.json')}, ${path.join(outDir, 'failed-after-retries.json')}`
    );
    console.log(
      `Artifacts written: ${path.join(outDir, 'retried-tests.md')}, ${path.join(outDir, 'flaky-tests.md')}, ${path.join(outDir, 'failed-after-retries.md')}`
    );
  }

  private keyOf(test: TestCase): string {
    return [
      test.location.file,
      test.location.line,
      test.location.column,
      ...test.titlePath(),
    ].join('::');
  }

  private toEntry(test: TestCase): ReportEntry {
    const attempts: AttemptEntry[] = test.results.map(result => ({
      retry: result.retry,
      status: result.status,
      duration: result.duration,
      error: this.errorText(result.error),
    }));

    const retriesUsed = Math.max(0, ...attempts.map(a => a.retry));
    const project = this.extractProjectName(test.titlePath());

    return {
      title: test.title,
      fullTitle: test.titlePath().join(' > '),
      file: test.location.file,
      line: test.location.line,
      column: test.location.column,
      project,
      outcome: test.outcome(),
      retriesConfigured: test.retries,
      retriesUsed,
      attempts,
    };
  }

  private extractProjectName(titlePath: string[]): string {
    return titlePath[1] ?? 'unknown';
  }

  private writeJson(filePath: string, data: ReportEntry[]): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private writeMarkdown(filePath: string, title: string, data: ReportEntry[]): void {
    if (data.length === 0) {
      fs.writeFileSync(filePath, `# ${title}\n\nNone detected in this run.\n`, 'utf-8');
      return;
    }

    const lines: string[] = [
      `# ${title}`,
      '',
      '| Test | Outcome | Retries Used | File |',
      '|---|---|---:|---|',
      ...data.map(
        t =>
          `| ${this.escapeMd(t.fullTitle)} | ${t.outcome} | ${t.retriesUsed} | ${this.escapeMd(`${t.file}:${t.line}`)} |`
      ),
      '',
    ];

    for (const test of data) {
      lines.push(`## ${this.escapeMd(test.fullTitle)}`);
      lines.push('');
      lines.push('| Retry | Status | Duration (ms) | Error |');
      lines.push('|---:|---|---:|---|');

      for (const attempt of test.attempts.sort((a, b) => a.retry - b.retry)) {
        lines.push(
          `| ${attempt.retry} | ${attempt.status} | ${attempt.duration} | ${this.escapeMd(attempt.error ?? '')} |`
        );
      }

      lines.push('');
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  private escapeMd(value: string): string {
    return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }

  private errorText(error: unknown): string | undefined {
    if (!error) return undefined;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      return typeof message === 'string' ? message : JSON.stringify(message);
    }
    return String(error);
  }
}

export default RetryInsightReporter;
