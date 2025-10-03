import { promises as fs } from 'node:fs';
import path from 'node:path';

async function ensureMarketingClientManifest() {
  const appServerDir = path.join(process.cwd(), '.next', 'server', 'app');
  const sourceFile = path.join(appServerDir, 'page_client-reference-manifest.js');
  const targetDir = path.join(appServerDir, '(marketing)');
  const targetFile = path.join(targetDir, 'page_client-reference-manifest.js');

  try {
    await fs.access(sourceFile);
  } catch {
    console.warn('[fix-client-manifest] source file missing, skipping copy:', sourceFile);
    return;
  }

  try {
    await fs.access(targetFile);
    // Already exists, nothing to do
    return;
  } catch {
    // fallthrough to copy
  }

  await fs.mkdir(targetDir, { recursive: true });
  const contents = await fs.readFile(sourceFile);
  await fs.writeFile(targetFile, contents);
  console.log(`[fix-client-manifest] copied ${path.relative(process.cwd(), sourceFile)} -> ${path.relative(process.cwd(), targetFile)}`);
}

ensureMarketingClientManifest().catch((error) => {
  console.error('[fix-client-manifest] failed:', error);
  process.exitCode = 1;
});
