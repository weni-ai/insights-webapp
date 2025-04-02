/**
 * Script to generate a unified translations file from individual language files
 * This script reads all locale files and combines them into a single unified JSON file
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../src/locales');
const OUTPUT_FILE = path.resolve(LOCALES_DIR, 'translations.json');
const SUPPORTED_LOCALES = ['en', 'pt_br', 'es'];

(() => {
  console.log('Generating unified translations file...');

  const unifiedTranslations = {};

  // Read all locale files and merge them into a single object
  for (const locale of SUPPORTED_LOCALES) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(fileContent);
      unifiedTranslations[locale] = translations;
      console.log(`✓ Loaded ${locale} translations`);
    } catch (error) {
      console.error(`× Error loading ${locale} translations:`, error.message);
    }
  }

  // Write the unified translations to file
  try {
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(unifiedTranslations, null, 2),
      'utf8',
    );
    console.log(`✓ Unified translations file created at: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`× Error writing unified translations file:`, error.message);
    process.exit(1);
  }
})();
