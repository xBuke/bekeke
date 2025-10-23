#!/usr/bin/env node

/**
 * Configure Supabase Auth Settings for Production
 * This script updates the auth settings via Supabase Management API
 */

const https = require('https');

// Configuration
const PROJECT_REF = 'uebidzpkptdmcnqjaody';
const SITE_URL = 'https://uslugo.vercel.app';
const REDIRECT_URLS = [
  'https://uslugo.vercel.app/auth/callback',
  'http://localhost:3000/auth/callback'
];

// You'll need to get your access token from Supabase Dashboard
// Go to: https://supabase.com/dashboard/account/tokens
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required');
  console.log('Get your access token from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function updateAuthSettings() {
  const authSettings = {
    site_url: SITE_URL,
    redirect_urls: REDIRECT_URLS,
    email_confirmations_enabled: false,
    email_change_confirmations_enabled: false,
    password_resets_enabled: true
  };

  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${PROJECT_REF}/config/auth`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Auth settings updated successfully!');
          console.log('📧 Site URL:', SITE_URL);
          console.log('🔄 Redirect URLs:', REDIRECT_URLS.join(', '));
          resolve(JSON.parse(data));
        } else {
          console.error('❌ Failed to update auth settings:', res.statusCode);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(authSettings));
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Configuring Supabase Auth Settings...');
    console.log('📋 Project:', PROJECT_REF);
    console.log('🌐 Site URL:', SITE_URL);
    console.log('🔄 Redirect URLs:', REDIRECT_URLS.join(', '));
    console.log('');
    
    await updateAuthSettings();
    
    console.log('');
    console.log('🎉 Configuration complete!');
    console.log('🔗 Your production site should now work with password reset flow.');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Test password reset at: https://uslugo.vercel.app/forgot-password');
    console.log('2. Check that emails redirect properly to /auth/callback');
    console.log('3. Verify the reset password page works');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

main();
