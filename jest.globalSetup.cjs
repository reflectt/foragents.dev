/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs/promises');
const path = require('path');

const ROOT = __dirname;
const BACKUP_DIR = path.join(ROOT, '.tmp-jest-backups');

const FILES_TO_BACKUP = [
  path.join(ROOT, 'data', 'artifacts.json'),
  path.join(ROOT, 'data', 'comments.json'),
];

module.exports = async function globalSetup() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  await Promise.all(
    FILES_TO_BACKUP.map(async (filePath) => {
      const dest = path.join(BACKUP_DIR, path.basename(filePath));
      // If the file doesn't exist, treat it as empty (but still create a backup)
      try {
        await fs.copyFile(filePath, dest);
      } catch (err) {
        if (err && err.code === 'ENOENT') {
          await fs.writeFile(dest, '', 'utf8');
          return;
        }
        throw err;
      }
    })
  );
};
