import { logger } from '../utils/logger';

// Types for parsed intents
export interface TestCase {
  name: string;
  steps: TestStep[];
  assertions: string[];
}

export interface TestStep {
  action: string;  // Simplified to allow any action type
  params: Record<string, string>;
}

export interface ParsedIntent {
  url?: string;
  testCases: TestCase[];
  framework?: string;
  style?: string;
  format?: string;
}

/**
 * Simple NLP parser for test generation prompts
 * This is a basic implementation that uses pattern matching
 * In a full implementation, this would use a more sophisticated NLP approach
 */
export async function parsePrompt(prompt: string, url?: string): Promise<ParsedIntent> {
  try {
    logger.info('Parsing prompt:', prompt);
    
    const result: ParsedIntent = {
      url,
      testCases: []
    };
    
    // Extract framework preference if mentioned
    const frameworkMatch = prompt.match(/using (playwright|cypress|mocha|jest)/i);
    if (frameworkMatch) {
      result.framework = frameworkMatch[1].toLowerCase();
    }
    
    // Extract format preference if mentioned
    const formatMatch = prompt.match(/in (javascript|typescript)/i);
    if (formatMatch) {
      result.format = formatMatch[1].toLowerCase();
    }
    
    // Extract style preference if mentioned
    const styleMatch = prompt.match(/(bdd|tdd) style/i);
    if (styleMatch) {
      result.style = styleMatch[1].toLowerCase();
    }
    
    // If URL not provided but mentioned in prompt, extract it
    if (!result.url) {
      const urlMatch = prompt.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        result.url = urlMatch[0];
      }
    }
    
    // Check for common test scenarios
    const testCases: TestCase[] = [];
    
    // Detect login test scenarios
    if (prompt.match(/login|sign in|authenticate/i)) {
      testCases.push(createLoginTestCase(prompt, result.url));
    }
    
    // Detect registration test scenarios
    if (prompt.match(/register|sign up|create account/i)) {
      testCases.push(createRegistrationTestCase(prompt, result.url));
    }
    
    // Detect form submission test scenarios
    if (prompt.match(/submit|form|fill|input/i) && !testCases.some(tc => tc.name.includes('Login') || tc.name.includes('Register'))) {
      testCases.push(createFormTestCase(prompt, result.url));
    }
    
    // Detect navigation test scenarios
    if (prompt.match(/navigate|browse|go to|visit/i) && !testCases.length) {
      testCases.push(createNavigationTestCase(prompt, result.url));
    }
    
    // If no specific test cases were identified, create a generic one
    if (!testCases.length) {
      testCases.push(createGenericTestCase(prompt, result.url));
    }
    
    result.testCases = testCases;
    
    logger.info('Parsed intent:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    logger.error('Error parsing prompt:', error);
    // Return a fallback generic test case
    return {
      url,
      testCases: [createGenericTestCase(prompt, url)]
    };
  }
}

/**
 * Create a login test case based on the prompt
 */
function createLoginTestCase(prompt: string, url?: string): TestCase {
  // Extract potential username/password from prompt
  const usernameMatch = prompt.match(/username[:\s]+['"]?([^'")\s]+)['"]?/i);
  const passwordMatch = prompt.match(/password[:\s]+['"]?([^'")\s]+)['"]?/i);
  
  const username = usernameMatch ? usernameMatch[1] : 'testuser';
  const password = passwordMatch ? passwordMatch[1] : 'password123';
  
  const steps: TestStep[] = [
    { action: 'navigate', params: { url: url || 'https://example.com' } },
    // Check if the prompt suggests clicking a login button first
    ...(prompt.match(/click login|login button|sign in button/i) ? 
        [{ action: 'click', params: { selector: '[data-testid="login-button"], .login-button, #login-button, button:has-text("Login"), button:has-text("Sign In")' } }] : 
        []),
    { action: 'type', params: { selector: '[data-testid="username-input"], #username, #email, input[name="username"], input[name="email"], input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i]', text: username } },
    { action: 'type', params: { selector: '[data-testid="password-input"], #password, input[name="password"], input[type="password"], input[placeholder*="password" i]', text: password } },
    { action: 'click', params: { selector: '[data-testid="login-submit"], #login-submit, button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")' } }
  ];
  
  const assertions = [
    'Successful login should redirect to dashboard or home page',
    'User should be authenticated after login',
    'Error message should be displayed for invalid credentials'
  ];
  
  // Check if the prompt mentions invalid credentials testing
  if (prompt.match(/invalid|incorrect|wrong|fail/i)) {
    assertions.push('System should prevent login with invalid credentials');
    assertions.push('Error message should be properly displayed');
  }
  
  return {
    name: 'Login Functionality Test',
    steps,
    assertions
  };
}

/**
 * Create a registration test case based on the prompt
 */
function createRegistrationTestCase(prompt: string, url?: string): TestCase {
  const steps: TestStep[] = [
    { action: 'navigate', params: { url: url || 'https://example.com' } },
    // Check if the prompt suggests clicking a register button first
    ...(prompt.match(/click register|register button|sign up button/i) ? 
        [{ action: 'click', params: { selector: '[data-testid="register-button"], .register-button, #register-button, button:has-text("Register"), button:has-text("Sign Up")' } }] : 
        []),
    { action: 'type', params: { selector: '[data-testid="name-input"], #name, input[name="name"], input[placeholder*="name" i]', text: 'Test User' } },
    { action: 'type', params: { selector: '[data-testid="email-input"], #email, input[name="email"], input[type="email"], input[placeholder*="email" i]', text: 'testuser@example.com' } },
    { action: 'type', params: { selector: '[data-testid="password-input"], #password, input[name="password"], input[type="password"], input[placeholder*="password" i]', text: 'SecurePassword123' } },
    { action: 'type', params: { selector: '[data-testid="confirm-password-input"], #confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i], input[placeholder*="verify" i]', text: 'SecurePassword123' } },
    { action: 'click', params: { selector: '[data-testid="register-submit"], #register-submit, button[type="submit"], input[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Create Account")' } }
  ];
  
  const assertions = [
    'User account should be created successfully',
    'User should be redirected to login page or directly logged in',
    'Validation should prevent weak passwords',
    'Email verification process should be triggered'
  ];
  
  return {
    name: 'User Registration Test',
    steps,
    assertions
  };
}

/**
 * Create a form submission test case based on the prompt
 */
function createFormTestCase(prompt: string, url?: string): TestCase {
  // Try to determine what kind of form from the prompt
  let formName = 'Form Submission';
  if (prompt.match(/contact/i)) formName = 'Contact Form';
  if (prompt.match(/checkout/i)) formName = 'Checkout Form';
  if (prompt.match(/search/i)) formName = 'Search Form';
  if (prompt.match(/profile/i)) formName = 'Profile Update Form';
  
  const steps: TestStep[] = [
    { action: 'navigate', params: { url: url || 'https://example.com' } }
  ];
  
  // Add different fields based on form type
  if (formName === 'Contact Form') {
    steps.push(
      { action: 'type', params: { selector: '#name, input[name="name"], input[placeholder*="name" i]', text: 'Test User' } },
      { action: 'type', params: { selector: '#email, input[name="email"], input[type="email"]', text: 'testuser@example.com' } },
      { action: 'type', params: { selector: '#message, textarea[name="message"], textarea', text: 'This is a test message for the contact form.' } }
    );
  } else if (formName === 'Checkout Form') {
    steps.push(
      { action: 'type', params: { selector: '#name, input[name="name"], [placeholder*="name" i]', text: 'Test User' } },
      { action: 'type', params: { selector: '#email, input[name="email"], input[type="email"]', text: 'testuser@example.com' } },
      { action: 'type', params: { selector: '#address, input[name="address"], [placeholder*="address" i]', text: '123 Test Street' } },
      { action: 'type', params: { selector: '#city, input[name="city"], [placeholder*="city" i]', text: 'Test City' } },
      { action: 'type', params: { selector: '#zip, input[name="zip"], input[name="postalCode"], [placeholder*="zip" i], [placeholder*="postal" i]', text: '12345' } },
      { action: 'type', params: { selector: '#creditCard, input[name="creditCard"], [placeholder*="card" i]', text: '4111111111111111' } }
    );
  } else if (formName === 'Search Form') {
    steps.push(
      { action: 'type', params: { selector: '#search, input[name="search"], input[type="search"], [placeholder*="search" i]', text: 'test query' } }
    );
  } else {
    // Generic form fields
    steps.push(
      { action: 'type', params: { selector: 'input[type="text"]:nth-of-type(1)', text: 'Test Input' } }
    );
  }
  
  // Add submit button click for all forms
  steps.push({ action: 'click', params: { selector: 'button[type="submit"], input[type="submit"], [data-testid="submit-button"]' } });
  
  const assertions = [
    'Form should submit successfully',
    'Validation errors should be displayed for invalid inputs',
    'Confirmation message should appear after successful submission'
  ];
  
  return {
    name: `${formName} Test`,
    steps,
    assertions
  };
}

/**
 * Create a navigation test case based on the prompt
 */
function createNavigationTestCase(prompt: string, url?: string): TestCase {
  const steps: TestStep[] = [
    { action: 'navigate', params: { url: url || 'https://example.com' } }
  ];
  
  // Try to extract potential navigation targets from prompt
  const navTargets = prompt.match(/navigate to ([^,.]+)/i) || 
                     prompt.match(/visit ([^,.]+)/i) || 
                     prompt.match(/browse ([^,.]+)/i);
                     
  if (navTargets && navTargets[1]) {
    const target = navTargets[1].trim().toLowerCase();
    if (target.includes('about')) {
      steps.push({ action: 'click', params: { selector: 'a[href*="about" i], .nav-item:has-text("About"), nav a:has-text("About")' } });
    } else if (target.includes('contact')) {
      steps.push({ action: 'click', params: { selector: 'a[href*="contact" i], .nav-item:has-text("Contact"), nav a:has-text("Contact")' } });
    } else if (target.includes('product')) {
      steps.push({ action: 'click', params: { selector: 'a[href*="product" i], .nav-item:has-text("Products"), nav a:has-text("Products")' } });
    } else {
      // Generic navigation
      steps.push({ action: 'click', params: { selector: `a:has-text("${target}"), .nav-item:has-text("${target}")` } });
    }
  } else {
    // Default navigation test
    steps.push(
      { action: 'click', params: { selector: 'nav a:nth-child(1), .nav-item:nth-child(1), header a:nth-child(1)' } }
    );
  }
  
  const assertions = [
    'Page should navigate successfully',
    'URL should update correctly',
    'New page content should load properly'
  ];
  
  return {
    name: 'Navigation Test',
    steps,
    assertions
  };
}

/**
 * Create a generic test case when no specific scenario is detected
 */
function createGenericTestCase(prompt: string, url?: string): TestCase {
  return {
    name: 'Automated Test Case',
    steps: [
      { action: 'navigate', params: { url: url || 'https://example.com' } },
      { action: 'click', params: { selector: 'button, a, .clickable, [role="button"]' } }
    ],
    assertions: [
      'Page should load successfully',
      'UI elements should be interactive',
      'No console errors should be present'
    ]
  };
}
