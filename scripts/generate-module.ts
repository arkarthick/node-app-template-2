import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const args = process.argv.slice(2);
const moduleName = args[0];
const version = args[1] || 'v1';

if (!moduleName) {
  console.error(`${colors.red}${colors.bold}Error:${colors.reset} Please provide a module name.`);
  console.log(`${colors.cyan}Usage:${colors.reset} npm run generate:module <moduleName> [version]`);
  process.exit(1);
}

// Validation: Alpha-numeric, hyphens, and underscores allowed
if (!/^[a-zA-Z0-9\-_]+$/.test(moduleName)) {
  console.error(
    `${colors.red}${colors.bold}Error:${colors.reset} Invalid module name "${moduleName}". Only alphanumeric characters, hyphens, and underscores are allowed.`,
  );
  process.exit(1);
}

// Validation: Version format (e.g., v1, v2)
if (!/^v\d+$/.test(version)) {
  console.error(
    `${colors.red}${colors.bold}Error:${colors.reset} Invalid version format "${version}". Expected format like "v1", "v2", etc.`,
  );
  process.exit(1);
}

const ModuleName = moduleName
  .split(/[-_]/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join('');

const camelModuleName = ModuleName.charAt(0).toLowerCase() + ModuleName.slice(1);
const modulePath = path.join(__dirname, '../src/modules', moduleName, version);
const templatesPath = path.join(__dirname, 'templates');

const filesToGenerate = [
  { template: 'controller.ts.template', output: `${moduleName}.controller.ts` },
  { template: 'dto.ts.template', output: `${moduleName}.dto.ts` },
  { template: 'module.ts.template', output: `${moduleName}.module.ts` },
  { template: 'repository.ts.template', output: `${moduleName}.repository.ts` },
  { template: 'routes.ts.template', output: `${moduleName}.routes.ts` },
  { template: 'validation.ts.template', output: `${moduleName}.validation.ts` },
  { template: 'usecase.ts.template', output: path.join('usecase', `${moduleName}.usecase.ts`) },
];

function generateFiles() {
  console.log(`${colors.blue}Generating module "${moduleName}" (${version})...${colors.reset}\n`);

  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
    fs.mkdirSync(path.join(modulePath, 'usecase'), { recursive: true });
  } else {
    console.error(
      `${colors.red}${colors.bold}Error:${colors.reset} Module ${moduleName} version ${version} already exists at ${modulePath}`,
    );
    process.exit(1);
  }

  filesToGenerate.forEach((file) => {
    try {
      const templateContent = fs.readFileSync(path.join(templatesPath, file.template), 'utf8');
      const processedContent = templateContent
        .replace(/{{moduleName}}/g, moduleName as string)
        .replace(/{{ModuleName}}/g, ModuleName)
        .replace(/{{camelModuleName}}/g, camelModuleName)
        .replace(/{{version}}/g, version);

      const outputPath = path.join(modulePath, file.output);
      fs.writeFileSync(outputPath, processedContent);
      console.log(`${colors.green}✓${colors.reset} Generated: ${outputPath}`);
    } catch (err) {
      console.error(
        `${colors.red}✗${colors.reset} Failed to generate ${file.output}: ${(err as Error).message}`,
      );
    }
  });

  console.log(`\n${colors.green}${colors.bold}Module generated successfully!${colors.reset}`);
  console.log(`\n${colors.yellow}${colors.bold}Next steps:${colors.reset}`);
  console.log(`${colors.cyan}1. Register the module in src/routes/index.ts:${colors.reset}`);
  console.log(
    `   ${colors.bold}router.use('/${version}/${moduleName}s', build${ModuleName}Module());${colors.reset}`,
  );
}

generateFiles();
