const fs = require('fs');
const {execSync} = require('child_process');

const currentBranch = execSync('git branch --show-current').toString().trim();

if (!currentBranch.includes('/release')) {
  throw Error('⚠️  Warning: Not on a release branch.');
}

/**
 * Обновить версию расширения
 */
(() => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const version = packageJson.version;

    const manifestVersion = version + '.0';
    const manifestPath = './template/manifest.json';

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.version = manifestVersion;

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Updated template/manifest.json version to ${manifestVersion}`);

    execSync('git add template/manifest.json package.json package-lock.json');
    execSync(`git commit -m "${manifestVersion}"`);
    execSync(`git tag ${manifestVersion}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();

const merge = (a, b) => {
  execSync(`git checkout ${b}`);
  execSync(`git pull origin ${b}`);
  execSync(`git merge ${a} --no-edit --no-ff`);
};

/**
 * Влить в ветку разработки
 */
(() => {
  try {
    const developBranch = currentBranch.replace('/release', '/develop');
    const gitverseBranch = currentBranch.replace('/release', '/gitverse');
    merge(currentBranch, developBranch);
    merge(developBranch, gitverseBranch);
    execSync(`git checkout ${currentBranch}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(2);
  }
})();
