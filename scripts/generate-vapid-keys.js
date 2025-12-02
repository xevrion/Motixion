#!/usr/bin/env node

/**
 * Helper script to generate VAPID keys for push notifications
 * 
 * Usage:
 *   node scripts/generate-vapid-keys.js
 * 
 * Or add to package.json scripts:
 *   "generate-vapid": "node scripts/generate-vapid-keys.js"
 */

import crypto from 'crypto';

// Generate VAPID keys
function generateVapidKeys() {
  const curve = crypto.createECDH('prime256v1');
  curve.generateKeys();

  const publicKey = curve.getPublicKey('base64url');
  const privateKey = curve.getPrivateKey('base64url');

  return {
    publicKey,
    privateKey,
  };
}

const { publicKey, privateKey } = generateVapidKeys();

console.log('\n✅ VAPID Keys Generated Successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Add these to your configuration:\n');

console.log('1️⃣  Frontend (.env file):');
console.log('   VITE_VAPID_PUBLIC_KEY=' + publicKey);
console.log('\n');

console.log('2️⃣  Backend (Supabase Secrets):');
console.log('   VAPID_PUBLIC_KEY=' + publicKey);
console.log('   VAPID_PRIVATE_KEY=' + privateKey);
console.log('   VAPID_EMAIL=noreply@motixion.vercel.app');
console.log('\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Next steps:');
console.log('   1. Add VITE_VAPID_PUBLIC_KEY to your .env file');
console.log('   2. Add VAPID keys to Supabase secrets');
console.log('   3. Deploy the Edge Function');
console.log('   4. Set up the cron job\n');

