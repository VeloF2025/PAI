const { existsSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

const skillsDir = join(__dirname, '..', 'skills');

// Recursively check for code files in a directory
function hasCodeFilesRecursive(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules and hidden directories
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isFile()) {
        // Check if it's a code file
        if (
          entry.name.endsWith('.ts') ||
          entry.name.endsWith('.js') ||
          entry.name.endsWith('.py') ||
          entry.name.endsWith('.json') ||
          entry.name.endsWith('.yaml') ||
          entry.name.endsWith('.yml')
        ) {
          return true;
        }
      } else if (entry.isDirectory()) {
        // Recursively check subdirectories
        if (hasCodeFilesRecursive(fullPath)) {
          return true;
        }
      }
    }
  } catch (e) {
    return false;
  }

  return false;
}

// Automatically discover all skill directories
const skillsDirEntries = readdirSync(skillsDir, { withFileTypes: true });
const skills = skillsDirEntries
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
  .map(entry => entry.name)
  .sort();

console.log('\n=== Pack v2.0 Validation Summary ===\n');
console.log(`Discovered ${skills.length} skills in ${skillsDir}\n`);

let passCount = 0;
let failCount = 0;
const results = [];

skills.forEach(skill => {
  const skillPath = join(skillsDir, skill);

  const hasReadme = existsSync(join(skillPath, 'README.md'));
  const hasInstall = existsSync(join(skillPath, 'INSTALL.md'));
  const hasVerify = existsSync(join(skillPath, 'VERIFY.md'));
  const hasSrcDir = existsSync(join(skillPath, 'src')) && statSync(join(skillPath, 'src')).isDirectory();
  const hasCodeFiles = hasSrcDir && hasCodeFilesRecursive(join(skillPath, 'src'));

  const allPassing = hasReadme && hasInstall && hasVerify && hasSrcDir && hasCodeFiles;

  if (allPassing) {
    passCount++;
  } else {
    failCount++;
  }

  results.push({
    skill,
    hasReadme,
    hasInstall,
    hasVerify,
    hasSrcDir,
    hasCodeFiles,
    allPassing
  });
});

// Print results table
console.log('Skill'.padEnd(35) + '| README | INSTALL | VERIFY | src/ | Code | Status');
console.log('-'.repeat(35) + '|--------|---------|--------|------|------|--------');

results.forEach(r => {
  const readme = r.hasReadme ? '✓' : '✗';
  const install = r.hasInstall ? '✓' : '✗';
  const verify = r.hasVerify ? '✓' : '✗';
  const src = r.hasSrcDir ? '✓' : '✗';
  const code = r.hasCodeFiles ? '✓' : '✗';
  const status = r.allPassing ? 'PASS' : 'FAIL';

  console.log(
    r.skill.padEnd(35) +
    `| ${readme}      | ${install}       | ${verify}      | ${src}    | ${code}    | ${status}`
  );
});

console.log('\n=== Summary ===');
console.log(`Total skills: ${skills.length}`);
console.log(`Passing: ${passCount} (${Math.round(passCount / skills.length * 100)}%)`);
console.log(`Failing: ${failCount} (${Math.round(failCount / skills.length * 100)}%)`);

if (failCount === 0) {
  console.log('\n✅ All skills are Pack v2.0 compliant!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failCount} skill(s) need attention`);
  process.exit(1);
}
