#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const ENC_PATH = 'docs/gen-lang-client-0522472579-9a0d87fe673a.json.enc';
const OUT_PATH = 'docs/gen-lang-client-0522472579-9a0d87fe673a.json';
const pass = process.env.GENLANG_PASSPHRASE;
if (!pass) {
  console.error('Set GENLANG_PASSPHRASE environment variable to the passphrase');
  process.exit(2);
}
if (!fs.existsSync(ENC_PATH)) {
  console.error('Encrypted file not found:', ENC_PATH);
  process.exit(3);
}
const env = JSON.parse(fs.readFileSync(ENC_PATH, 'utf8'));
const salt = Buffer.from(env.salt, 'base64');
const iv = Buffer.from(env.iv, 'base64');
const tag = Buffer.from(env.tag, 'base64');
const data = Buffer.from(env.data, 'base64');
const key = crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
let out = Buffer.concat([decipher.update(data), decipher.final()]);
fs.writeFileSync(OUT_PATH, out);
console.log('Decrypted to', OUT_PATH, ' — remove after use or keep in secure storage.');
