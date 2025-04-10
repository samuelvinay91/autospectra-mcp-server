import { ParsedIntent, TestCase, TestStep } from '../nlp/promptParser';
import { logger } from '../utils/logger';
import Handlebars from 'handlebars';

interface GenerateOptions {
  style: string;
  format: string;
}

/**
 * Generate Playwright test code based on parsed intent
 */
export async function generatePlaywrightTest(
  intent: ParsedIntent,
  options: GenerateOptions
): Promise<string> {
  const { style, format } = options;
  logger.info(`Generating Playwright test with style: ${style}, format: ${format}`);
  
  // Register Handlebars helpers
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });
  
  // Select the appropriate template based on style and format
  const templateSource = selectPlaywrightTemplate(style, format);
  const template = Handlebars.compile(templateSource);
  
  // Prepare the template data
  const testUrl = intent.url || 'https://example.com';
  
  const testData = {
    url: testUrl,
    testCases: intent.testCases,
    format,
    style,
    usesTypeScript: format === 'typescript',
    date: new Date().toISOString().split('T')[0],
    hasMultipleTestCases: intent.testCases.length > 1,
  };
  
  // Generate code using the template
  return template(testData);
}

/**
 * Select the appropriate template based on style and format
 */
function selectPlaywrightTemplate(style: string, format: string): string {
  if (style === 'bdd' && format === 'typescript') {
    return playwrightBddTypeScriptTemplate;
  } else if (style === 'bdd' && format === 'javascript') {
    return playwrightBddJavaScriptTemplate;
  } else if (style === 'tdd' && format === 'typescript') {
    return playwrightTddTypeScriptTemplate;
  } else {
    // Default to TDD JavaScript
    return playwrightTddJavaScriptTemplate;
  }
}

// Templates for Playwright tests
// BDD TypeScript Template
const playwrightBddTypeScriptTemplate = `
import { test, expect, Page } from '@playwright/test';

/**
 * Automated test suite generated by AutoSpectra
 * URL: {{url}}
 * Date: {{date}}
 */

{{#each testCases}}
test.describe('{{name}}', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });
  
  test.afterEach(async () => {
    await page.close();
  });
  
  test('should complete successfully', async () => {
    // Arrange - Set up the test environment
    {{#each steps}}
    {{#if (eq action "navigate")}}
    // Navigate to the target page
    await page.goto('{{params.url}}');
    {{/if}}
    {{#if (eq action "click")}}
    // Click on the element
    await page.click('{{params.selector}}');
    {{/if}}
    {{#if (eq action "type")}}
    // Type text into the input field
    await page.fill('{{params.selector}}', '{{params.text}}');
    {{/if}}
    {{#if (eq action "select")}}
    // Select an option from dropdown
    await page.selectOption('{{params.selector}}', '{{params.value}}');
    {{/if}}
    {{#if (eq action "check")}}
    // Check a checkbox
    await page.check('{{params.selector}}');
    {{/if}}
    {{#if (eq action "uncheck")}}
    // Uncheck a checkbox
    await page.uncheck('{{params.selector}}');
    {{/if}}
    {{#if (eq action "hover")}}
    // Hover over an element
    await page.hover('{{params.selector}}');
    {{/if}}
    {{#if (eq action "wait")}}
    // Wait for a condition
    await page.waitForSelector('{{params.selector}}');
    {{/if}}
    {{/each}}
    
    // Assert - Verify the expected outcomes
    {{#each assertions}}
    // {{this}}
    {{/each}}
    
    // Take a screenshot for verification
    await page.screenshot({ path: '{{name}}.png' });
  });
});
{{/each}}
`;

// BDD JavaScript Template
const playwrightBddJavaScriptTemplate = `
const { test, expect } = require('@playwright/test');

/**
 * Automated test suite generated by AutoSpectra
 * URL: {{url}}
 * Date: {{date}}
 */

{{#each testCases}}
test.describe('{{name}}', () => {
  let page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });
  
  test.afterEach(async () => {
    await page.close();
  });
  
  test('should complete successfully', async () => {
    // Arrange - Set up the test environment
    {{#each steps}}
    {{#if (eq action "navigate")}}
    // Navigate to the target page
    await page.goto('{{params.url}}');
    {{/if}}
    {{#if (eq action "click")}}
    // Click on the element
    await page.click('{{params.selector}}');
    {{/if}}
    {{#if (eq action "type")}}
    // Type text into the input field
    await page.fill('{{params.selector}}', '{{params.text}}');
    {{/if}}
    {{#if (eq action "select")}}
    // Select an option from dropdown
    await page.selectOption('{{params.selector}}', '{{params.value}}');
    {{/if}}
    {{#if (eq action "check")}}
    // Check a checkbox
    await page.check('{{params.selector}}');
    {{/if}}
    {{#if (eq action "uncheck")}}
    // Uncheck a checkbox
    await page.uncheck('{{params.selector}}');
    {{/if}}
    {{#if (eq action "hover")}}
    // Hover over an element
    await page.hover('{{params.selector}}');
    {{/if}}
    {{#if (eq action "wait")}}
    // Wait for a condition
    await page.waitForSelector('{{params.selector}}');
    {{/if}}
    {{/each}}
    
    // Assert - Verify the expected outcomes
    {{#each assertions}}
    // {{this}}
    {{/each}}
    
    // Take a screenshot for verification
    await page.screenshot({ path: '{{name}}.png' });
  });
});
{{/each}}
`;

// TDD TypeScript Template
const playwrightTddTypeScriptTemplate = `
import { test, expect, Page } from '@playwright/test';

/**
 * Automated test suite generated by AutoSpectra
 * URL: {{url}}
 * Date: {{date}}
 */

let page: Page;

test.beforeEach(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterEach(async () => {
  await page.close();
});

{{#each testCases}}
test('{{name}}', async () => {
  // Arrange - Set up the test environment
  {{#each steps}}
  {{#if (eq action "navigate")}}
  // Navigate to the target page
  await page.goto('{{params.url}}');
  {{/if}}
  {{#if (eq action "click")}}
  // Click on the element
  await page.click('{{params.selector}}');
  {{/if}}
  {{#if (eq action "type")}}
  // Type text into the input field
  await page.fill('{{params.selector}}', '{{params.text}}');
  {{/if}}
  {{#if (eq action "select")}}
  // Select an option from dropdown
  await page.selectOption('{{params.selector}}', '{{params.value}}');
  {{/if}}
  {{#if (eq action "check")}}
  // Check a checkbox
  await page.check('{{params.selector}}');
  {{/if}}
  {{#if (eq action "uncheck")}}
  // Uncheck a checkbox
  await page.uncheck('{{params.selector}}');
  {{/if}}
  {{#if (eq action "hover")}}
  // Hover over an element
  await page.hover('{{params.selector}}');
  {{/if}}
  {{#if (eq action "wait")}}
  // Wait for a condition
  await page.waitForSelector('{{params.selector}}');
  {{/if}}
  {{/each}}
  
  // Assert - Verify the expected outcomes
  {{#each assertions}}
  // {{this}}
  {{/each}}
  
  // Take a screenshot for verification
  await page.screenshot({ path: '{{name}}.png' });
});
{{/each}}
`;

// TDD JavaScript Template
const playwrightTddJavaScriptTemplate = `
const { test, expect } = require('@playwright/test');

/**
 * Automated test suite generated by AutoSpectra
 * URL: {{url}}
 * Date: {{date}}
 */

let page;

test.beforeEach(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterEach(async () => {
  await page.close();
});

{{#each testCases}}
test('{{name}}', async () => {
  // Arrange - Set up the test environment
  {{#each steps}}
  {{#if (eq action "navigate")}}
  // Navigate to the target page
  await page.goto('{{params.url}}');
  {{/if}}
  {{#if (eq action "click")}}
  // Click on the element
  await page.click('{{params.selector}}');
  {{/if}}
  {{#if (eq action "type")}}
  // Type text into the input field
  await page.fill('{{params.selector}}', '{{params.text}}');
  {{/if}}
  {{#if (eq action "select")}}
  // Select an option from dropdown
  await page.selectOption('{{params.selector}}', '{{params.value}}');
  {{/if}}
  {{#if (eq action "check")}}
  // Check a checkbox
  await page.check('{{params.selector}}');
  {{/if}}
  {{#if (eq action "uncheck")}}
  // Uncheck a checkbox
  await page.uncheck('{{params.selector}}');
  {{/if}}
  {{#if (eq action "hover")}}
  // Hover over an element
  await page.hover('{{params.selector}}');
  {{/if}}
  {{#if (eq action "wait")}}
  // Wait for a condition
  await page.waitForSelector('{{params.selector}}');
  {{/if}}
  {{/each}}
  
  // Assert - Verify the expected outcomes
  {{#each assertions}}
  // {{this}}
  {{/each}}
  
  // Take a screenshot for verification
  await page.screenshot({ path: '{{name}}.png' });
});
{{/each}}
`;
