const https = require('https');
const fs = require('fs');
const path = require('path');

// Read config to get token
const configPath = path.join(__dirname, '../database/supabase-config.js');
const sqlPath = path.join(__dirname, '../database/create_works_table.sql');

if (!fs.existsSync(configPath)) {
    console.error('❌ Supabase config not found!');
    process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf8');
// Extract token and project ID using simple regex
const tokenMatch = configContent.match(/accessToken\s*=\s*'([^']+)'/);
const urlMatch = configContent.match(/supabaseUrl\s*=\s*'https:\/\/([^.]+)\.supabase\.co'/);

if (!tokenMatch || !urlMatch) {
    console.error('❌ Could not find access token or project ID in config!');
    console.log('Ensure database/supabase-config.js has accessToken and supabaseUrl set.');
    process.exit(1);
}

const accessToken = tokenMatch[1];
const projectRef = urlMatch[1];
const sqlQuery = fs.readFileSync(sqlPath, 'utf8');

console.log('🚀 Setting up Works table...');
console.log(`📦 Project: ${projectRef}`);

// Call Management API to execute SQL
// POST https://api.supabase.com/v1/projects/{ref}/query
const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Works table created successfully!');
            console.log('🎉 You can now refresh the admin panel.');
        } else {
            console.error(`❌ Error (${res.statusCode}):`, data);
            console.log('\n⚠️ If this failed, please copy the content of database/create_works_table.sql and run it in your Supabase SQL Editor manually.');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.write(JSON.stringify({ query: sqlQuery }));
req.end();
