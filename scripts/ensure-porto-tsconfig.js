const fs = require('node:fs');
const path = require('node:path');

const portoDir = path.join(__dirname, '..', 'node_modules', 'porto');
const baseTsconfigPath = path.join(portoDir, 'tsconfig.base.json');

if (!fs.existsSync(portoDir)) {
  console.warn('[ensure-porto-tsconfig] porto package not installed – skipping.');
  process.exit(0);
}

if (fs.existsSync(baseTsconfigPath)) {
  process.exit(0);
}

const fallbackConfig = {
  extends: undefined,
  compilerOptions: {
    target: 'ES2020',
    module: 'esnext',
    moduleResolution: 'bundler',
    strict: true,
    noEmit: true,
    jsx: 'react-jsx'
  },
  include: ['src']
};

fs.writeFileSync(
  baseTsconfigPath,
  `${JSON.stringify(fallbackConfig, null, 2)}\n`,
  'utf8'
);
console.log('[ensure-porto-tsconfig] Added missing tsconfig.base.json for porto.');
