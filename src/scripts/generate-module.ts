import fs from 'fs';
import path from 'path';

// Get module name from command line arguments
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Please provide a module name');
  process.exit(1);
}

const moduleNameCapitalized =
  moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

// Define the base directory for modules
const baseDir = path.join(
  __dirname,
  '..',
  'app',
  'modules',
  moduleNameCapitalized
);

// Create the directory if it doesn't exist
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log(`Created directory: ${baseDir}`);
}

// Create controller file with template
const controllerTemplate = `import { ${moduleNameCapitalized}Service } from './${moduleName}.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

export const ${moduleNameCapitalized}Controller = {
  // Add your controller methods here
};
`;
fs.writeFileSync(
  path.join(baseDir, `${moduleName}.controller.ts`),
  controllerTemplate
);
console.log(`Created ${moduleName}.controller.ts with template`);

// Create service file with template
const serviceTemplate = `export const ${moduleNameCapitalized}Service = {
  // Add your service methods here
};
`;
fs.writeFileSync(
  path.join(baseDir, `${moduleName}.service.ts`),
  serviceTemplate
);
console.log(`Created ${moduleName}.service.ts with template`);

// Create routes file with template
const routesTemplate = `import express from 'express';
const router = express.Router();

// Add your routes here

export const ${moduleNameCapitalized}Routes = router;
`;
fs.writeFileSync(path.join(baseDir, `${moduleName}.routes.ts`), routesTemplate);
console.log(`Created ${moduleName}.routes.ts with template`);

// Create validation file with template
const validationTemplate = `import { z } from 'zod';

export const ${moduleNameCapitalized}Validation = {
  // Add your validation methods here
};
`;
fs.writeFileSync(
  path.join(baseDir, `${moduleName}.validation.ts`),
  validationTemplate
);

console.log(`Created ${moduleName}.validation.ts with template`);

console.log(
  `Module '${moduleNameCapitalized}' has been generated successfully!`
);
