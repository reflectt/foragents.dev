/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs/promises');
const path = require('path');

const ROOT = __dirname;
const BACKUP_DIR = path.join(ROOT, '.tmp-jest-backups');

const FILES_TO_RESTORE = [
  path.join(ROOT, 'data', 'artifacts.json'),
  path.join(ROOT, 'data', 'comments.json'),
];

async function fileExists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

module.exports = async function globalTeardown() {
  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });

  for (const filePath of FILES_TO_RESTORE) {
    const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
    if (!(await fileExists(backupPath))) continue;

    // Restore original file contents.
    await fs.copyFile(backupPath, filePath);
  }

  await fs.rm(BACKUP_DIR, { recursive: true, force: true });
};
