import fs from 'node:fs';
import path from 'node:path';

const configDir = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(configDir, '..', '.env'));
loadEnvFile(path.resolve(configDir, '..', '..', 'backend', '.env'));

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
