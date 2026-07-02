/**
 * Migration Dashboard Scanner
 *
 * Audits every UI component for Visual Platform adoption.
 * Reports measurable completion percentages.
 *
 * Run: node scripts/migration-dashboard.cjs
 * Output: coverage/migration-dashboard.json + console report
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const OUT_DIR = path.resolve(__dirname, '..', 'coverage');
const OUT_FILE = path.join(OUT_DIR, 'migration-dashboard.json');

function findAllFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('__') && !entry.name.startsWith('node_modules')) {
      results.push(...findAllFiles(full, ext));
    } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const files = findAllFiles(SRC, ['.tsx', '.ts']);
  const uiFiles = files.filter(f => !f.includes('__tests__') && !f.includes('node_modules') && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'));

  // Count usage patterns
  let visualManagerUsage = 0;
  let presentationModelUsage = 0;
  let cardRendererUsage = 0;
  let richTooltipUsage = 0;
  let skeletonLoaderUsage = 0;
  let assetImageUsage = 0;
  let legacyAssetsUsage = 0;

  for (const file of uiFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('visual-manager') || content.includes('VisualManager') || content.includes('visualManager')) visualManagerUsage++;
    if (content.includes('PresentationModel') || content.includes('buildPresentationModel')) presentationModelUsage++;
    if (content.includes('CardRenderer')) cardRendererUsage++;
    if (content.includes('RichTooltip')) richTooltipUsage++;
    if (content.includes('SkeletonLoader') || content.includes('skeleton-loader')) skeletonLoaderUsage++;
    if (content.includes('AssetImage')) assetImageUsage++;
    if (content.includes('from.*utils/assets') || content.includes('utils/assets')) legacyAssetsUsage++;
  }

  const totalUIConsidered = uiFiles.length;
  const pct = (val) => ((val / totalUIConsidered) * 100).toFixed(1);

  const dashboard = {
    generatedAt: new Date().toISOString(),
    totalUIComponents: totalUIConsidered,
    systems: {
      VisualManager: { files: visualManagerUsage, pct: pct(visualManagerUsage) },
      PresentationModel: { files: presentationModelUsage, pct: pct(presentationModelUsage) },
      CardRenderer: { files: cardRendererUsage, pct: pct(cardRendererUsage) },
      RichTooltip: { files: richTooltipUsage, pct: pct(richTooltipUsage) },
      SkeletonLoader: { files: skeletonLoaderUsage, pct: pct(skeletonLoaderUsage) },
      AssetImage: { files: assetImageUsage, pct: pct(assetImageUsage) },
      LegacyAssets: { files: legacyAssetsUsage, pct: pct(legacyAssetsUsage) },
    },
  };

  console.log('\n=== Migration Dashboard ===\n');
  console.log(`  Total UI components scanned: ${totalUIConsidered}`);
  console.log('');
  console.log('  System              Files     %');
  console.log('  ─────────────────────────────────');
  for (const [key, val] of Object.entries(dashboard.systems)) {
    console.log(`  ${key.padEnd(20)} ${String(val.files).padStart(5)} ${val.pct.padStart(6)}%`);
  }
  console.log('');

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(dashboard, null, 2));
  console.log(`  Dashboard written to ${OUT_FILE}`);
}

main();
