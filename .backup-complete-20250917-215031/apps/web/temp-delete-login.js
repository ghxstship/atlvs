// Temporary file to help delete the marketing login directory
const fs = require('fs');
const path = require('path');

const loginDir = path.join(__dirname, 'app/(marketing)/login');
console.log('Attempting to delete:', loginDir);

try {
  fs.rmSync(loginDir, { recursive: true, force: true });
  console.log('Successfully deleted marketing login directory');
} catch (error) {
  console.error('Error deleting directory:', error);
}
