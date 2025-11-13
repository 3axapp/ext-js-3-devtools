const {execSync} = require('child_process');

const currentBranch = execSync('git branch --show-current').toString().trim();

// Проверяем, что мы на release branch
if (!currentBranch.includes('/release')) {
  console.warn('⚠️  Warning: Not on a release branch.');
  process.exit(1)
}
