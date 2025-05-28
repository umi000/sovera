# Sovera API Testing Framework

## Overview
Sovera is an automated API testing framework built using Playwright. It provides a robust solution for testing the Sovera payment platform's API endpoints, ensuring reliability and functionality across the system.

## Features
- **API Authentication Testing**: Validates login functionality with various test cases
- **User Management Testing**: Tests for creating and updating super admin accounts
- **Cross-Browser Compatibility**: Supports Chromium, Firefox, and WebKit
- **Parallel Test Execution**: Optimized for speed with parallel test execution
- **HTML Reports**: Comprehensive test reports with detailed results

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

```bash
# Clone the repository
git clone https://github.com/umi000/sovera.git

# Navigate to the project directory
cd sovera

# Install dependencies
npm install
```

## Project Structure
```
sovera/
├── test/                  # Test directory
│   └── API_cases.spec.js  # API test cases
├── tests-examples/        # Example tests
├── playwright.config.js   # Playwright configuration
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in a specific browser
npx playwright test --project=chromium

# Run a specific test file
npx playwright test API_cases.spec.js

# Run tests in debug mode
npx playwright test --debug

# Generate and open HTML report
npx playwright show-report
```

## API Endpoints Tested
- **Login API**: Authentication endpoint
- **Create/Update Super Admin API**: User management endpoint
- **Add Client API**: Client creation endpoint
- **Issue Card API**: Card issuance endpoint

## Test Cases
- Login with invalid email
- Login with invalid password
- Login with missing credentials
- API key validation
- Successful login with valid credentials
- Super admin creation and management

## Reports
Test reports are generated in HTML format and can be found in the `playwright-report` directory after test execution. Use `npx playwright show-report` to view the latest report.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
ISC License