/**
 * AUTOMATED 3D CANVAS SNAPSHOT GENERATOR (PHASE 5)
 * Captures high-fidelity static social cards & OpenGraph preview assets
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📸 Generating Automated 3D Canvas Social Snapshot...');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let edgePath = edgePaths.find(p => fs.existsSync(p));

if (!edgePath) {
  console.warn('⚠️ Microsoft Edge not found in standard paths. Skipping headless render.');
  process.exit(0);
}

const targetDir = path.join(__dirname, 'static', 'images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const outputPath = path.join(targetDir, 'social_preview_3d.png');
const indexHtmlUrl = `file:///${path.resolve(__dirname, 'index.html').replace(/\\/g, '/')}`;

try {
  const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=1200,630 "${indexHtmlUrl}"`;
  execSync(cmd, { stdio: 'ignore', timeout: 12000 });

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`✅ SUCCESS: Generated 3D Social Snapshot at ${outputPath} (${sizeKB} KB)`);
  } else {
    console.warn('⚠️ Screenshot generation ran but file was not produced or empty.');
  }
} catch (err) {
  console.warn('⚠️ Snapshot process warning:', err.message);
}
