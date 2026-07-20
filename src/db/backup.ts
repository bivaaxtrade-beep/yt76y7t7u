import path from 'path';
import fs from 'fs';
import logger from '../lib/logger.ts';
import dotenv from 'dotenv';

dotenv.config();

export function backupDatabase() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `mysql-backup-${timestamp}.sqlite`);

  const dbPath = path.join(process.cwd(), 'database.sqlite');

  if (fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, backupPath);
      logger.info(`SQLite database backup successful: ${backupPath}`);
      
      // Cleanup old backups (keep last 7)
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('mysql-backup-'))
        .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 7) {
        files.slice(7).forEach(f => {
          try {
            fs.unlinkSync(path.join(backupDir, f.name));
            logger.info(`Old backup deleted: ${f.name}`);
          } catch (e) {
            logger.error(`Failed to delete old backup ${f.name}:`, e);
          }
        });
      }
    } catch (err: any) {
      logger.error('SQLite backup failed:', err);
    }
  } else {
    logger.warn('SQLite database file not found, backup skipped');
  }
}

