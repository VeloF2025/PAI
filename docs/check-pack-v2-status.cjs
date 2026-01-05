const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

const skills = [
  'upgrade',
  'agent-observability',
  'fabric',
  'research',
  'alex-hormozi-pitch',
  'create-skill',
  'mcp-builder',
  'ffuf',
  'python-agent-patterns',
  'meta-prompting'
];

const skillsDir = 'C:/Users/HeinvanVuuren/.claude/skills';

console.log('\n=== Pack v2.0 Re-validation Summary ===\n');

skills.forEach(skill => {
  const skillDir = join(skillsDir, skill);
  if (!existsSync(skillDir)) {
    console.log(`❌ ${skill}: SKILL NOT FOUND`);
    return;
  }

  const readme = existsSync(join(skillDir, 'README.md'));
  const install = existsSync(join(skillDir, 'INSTALL.md'));
  const verify = existsSync(join(skillDir, 'VERIFY.md'));
  const srcDir = existsSync(join(skillDir, 'src'));

  let codeFileCount = 0;
  if (srcDir) {
    const srcFiles = readdirSync(join(skillDir, 'src'), { recursive: true, withFileTypes: true });
    codeFileCount = srcFiles.filter(f => f.isFile() && /\.(ts|js|json|yaml|yml)$/i.test(f.name)).length;
  }

  const status = readme && install && verify && srcDir && codeFileCount > 0 ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${skill}`);
  console.log(`   README: ${readme ? '✅' : '❌'}  INSTALL: ${install ? '✅' : '❌'}  VERIFY: ${verify ? '✅' : '❌'}  src/: ${srcDir ? '✅' : '❌'}  code files: ${codeFileCount}`);
});

console.log('\n');
