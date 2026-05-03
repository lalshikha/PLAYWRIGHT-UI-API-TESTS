import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export type VisualCompareOptions = {
  // pixelmatch sensitivity (0..1). Smaller = more sensitive.
  threshold?: number;

  // Absolute pixel limit. Set to -1 to disable (default in this file).
  maxDiffPixels?: number;

  // Ratio limit (0..1). Set to -1 to disable.
  maxDiffPixelRatio?: number;

  // Allowed width/height delta before failing.
  maxSizeDiffPixels?: number;

  // pixelmatch option: if true, disables detecting and ignoring anti-aliased pixels.
  includeAA?: boolean;

  // pixelmatch option: blending factor for unchanged pixels in diff output (0..1).
  alpha?: number;

  // Write diff image even on pass (default false).
  writeDiffOnPass?: boolean;
};

type ResolvedOptions = Required<
  Pick<
    VisualCompareOptions,
    | 'threshold'
    | 'maxDiffPixels'
    | 'maxDiffPixelRatio'
    | 'maxSizeDiffPixels'
    | 'includeAA'
    | 'alpha'
    | 'writeDiffOnPass'
  >
>;

function resolveOptions(options: VisualCompareOptions): ResolvedOptions {
  return {
    threshold: options.threshold ?? 0.1,

    // IMPORTANT: disabled by default as requested
    maxDiffPixels: options.maxDiffPixels ?? -1,

    // keep ratio gate enabled by default (tune as needed)
    maxDiffPixelRatio: options.maxDiffPixelRatio ?? 0.001,

    maxSizeDiffPixels: options.maxSizeDiffPixels ?? 0,
    includeAA: options.includeAA ?? false,
    alpha: options.alpha ?? 0.1,
    writeDiffOnPass: options.writeDiffOnPass ?? false,
  };
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function normalizePngName(name: string): string {
  return name.toLowerCase().endsWith('.png') ? name : `${name}.png`;
}

function padToSize(src: PNG, width: number, height: number): PNG {
  const out = new PNG({ width, height });
  PNG.bitblt(src, out, 0, 0, src.width, src.height, 0, 0);
  return out;
}

export async function compareWithBaseline(params: {
  screenshotBuffer: Buffer;
  snapshotFileName: string; // e.g. "pageUnderTest_login.png"
  options: VisualCompareOptions;
}): Promise<void> {
  const { screenshotBuffer } = params;
  const snapshotFileName = normalizePngName(params.snapshotFileName);
  const opt = resolveOptions(params.options);

  const baseDir = path.join('screenshots', 'visual');
  const baselineDir = path.join(baseDir, 'baseline');
  const actualDir = path.join(baseDir, 'actual');
  const diffDir = path.join(baseDir, 'diff');

  ensureDir(baselineDir);
  ensureDir(actualDir);
  ensureDir(diffDir);

  const baselinePath = path.join(baselineDir, snapshotFileName);
  const actualPath = path.join(actualDir, snapshotFileName);
  const diffPath = path.join(
    diffDir,
    snapshotFileName.replace(/\.png$/i, '.diff.png')
  );

  // Always write actual (useful for debugging)
  fs.writeFileSync(actualPath, screenshotBuffer);

  // UPDATE MODE: always overwrite baseline and exit
  if (process.env.UPDATE_BASELINES === '1') {
    fs.writeFileSync(baselinePath, screenshotBuffer);
    return;
  }

  // Normal mode: baseline must exist
  if (!fs.existsSync(baselinePath)) {
    throw new Error(
      'Baseline missing: ' +
        baselinePath +
        ' (Run with UPDATE_BASELINES=1 once to create/update baselines)'
    );
  }

  const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
  const actualImg = PNG.sync.read(fs.readFileSync(actualPath));

  const widthDiff = Math.abs(baselineImg.width - actualImg.width);
  const heightDiff = Math.abs(baselineImg.height - actualImg.height);

  if (widthDiff > opt.maxSizeDiffPixels || heightDiff > opt.maxSizeDiffPixels) {
    throw new Error(
      'Screenshot size mismatch. baseline=' +
        baselineImg.width +
        'x' +
        baselineImg.height +
        ' actual=' +
        actualImg.width +
        'x' +
        actualImg.height +
        ' maxSizeDiff=' +
        opt.maxSizeDiffPixels
    );
  }

  // pixelmatch requires identical dimensions: pad smaller to larger (within allowed size diff)
  const width = Math.max(baselineImg.width, actualImg.width);
  const height = Math.max(baselineImg.height, actualImg.height);

  const baselinePadded =
    baselineImg.width === width && baselineImg.height === height
      ? baselineImg
      : padToSize(baselineImg, width, height);

  const actualPadded =
    actualImg.width === width && actualImg.height === height
      ? actualImg
      : padToSize(actualImg, width, height);

  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baselinePadded.data,
    actualPadded.data,
    diff.data,
    width,
    height,
    {
      threshold: opt.threshold,
      includeAA: opt.includeAA,
      alpha: opt.alpha,
    }
  );

  const totalPixels = width * height;
  const diffPixelRatio = totalPixels === 0 ? 0 : diffPixels / totalPixels;

  const pixelLimitEnabled = opt.maxDiffPixels >= 0;
  const ratioLimitEnabled = opt.maxDiffPixelRatio >= 0;

  const tooManyPixels = pixelLimitEnabled && diffPixels > opt.maxDiffPixels;
  const tooHighRatio =
    ratioLimitEnabled && diffPixelRatio > opt.maxDiffPixelRatio;

  const isMismatch = tooManyPixels || tooHighRatio;

  if (isMismatch || opt.writeDiffOnPass) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  if (isMismatch) {
    throw new Error(
      'Visual mismatch for ' +
        snapshotFileName +
        ' | pixels: ' +
        diffPixels +
        (pixelLimitEnabled
          ? ' (allowed maxDiffPixels=' + opt.maxDiffPixels + ')'
          : ' (maxDiffPixels=DISABLED)') +
        ' | pixelRatio: ' +
        diffPixelRatio.toFixed(6) +
        (ratioLimitEnabled
          ? ' (allowed maxDiffPixelRatio=' + opt.maxDiffPixelRatio + ')'
          : ' (maxDiffPixelRatio=DISABLED)') +
        ' | threshold: ' +
        opt.threshold +
        ' | includeAA: ' +
        opt.includeAA +
        ' | alpha: ' +
        opt.alpha +
        ' | maxSizeDiff: ' +
        opt.maxSizeDiffPixels +
        ' | baseline=' +
        baselinePath +
        ' | actual=' +
        actualPath +
        ' | diff=' +
        diffPath
    );
  }
}
