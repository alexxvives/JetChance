// Generate password hashes for admin users
// Run with: node generate-admin-hash.js

const bcrypt = require('bcrypt');

const passwords = [
  { email: 'admin@jetchance.com', password: 'Admin123!' },
  { email: 'operator@jetchance.com', password: 'Operator123!' }
];

async function generateHashes() {
  console.log('Generating password hashes for admin users...\n');
  
  for (const user of passwords) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Hash: ${hash}\n`);
  }
  
  console.log('Copy these hashes to your seed.sql file');
  console.log('⚠️  CHANGE THESE PASSWORDS after first login!');
}

generateHashes();
