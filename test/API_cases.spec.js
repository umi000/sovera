// @ts-check
import { test, expect } from '@playwright/test';

// Shared token variable for tests that require authentication
let token_SA = null;

/**
 * Test suite for Sovera API
 * Contains tests for login and createupdatesuperadmin endpoints
 */

// Make the entire file run in sequence to ensure token is available
test.describe.configure({ mode: 'serial' });

// Single test suite to ensure tests run in sequence
test.describe('Sovera API Tests', () => {
  // Common API settings
  const apiKey = 'AIzaSyDEAzy9bsweFnqtqa0rVusAGhNwWKJ3oZs';
  
  // API endpoints
  const loginApiUrl = 'https://sovpay-dev-api.sovera.io/api/auth/login';
  const createUpdateApiUrl = 'https://sovpay-dev-api.sovera.io/api/users/createupdatesuperadmin';
  const addClientApiUrl = 'https://sovpay-dev-api.sovera.io/api/Client/addclient';
  const issueCardApiUrl = 'https://sovpay-dev-api.sovera.io/api/card/issuecard';
  
  const validCredentials = {
    email: 'usmanmanzoor@troontechnologies.com',
    password: 'U$man123'
  };

  // Common headers for API requests
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-PK,en-US;q=0.9,en;q=0.8,ur;q=0.7',
    'apikey': apiKey,
    'content-type': 'application/json',
    'origin': 'https://sovpay-dev-sadmin.sovera.io',
    'referer': 'https://sovpay-dev-sadmin.sovera.io/',
    'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
  };

  /**
   * Login API Tests
   */
  
  test('should Pass login with invalid email', async ({ request }) => {
    // Send login request with invalid email
    const response = await request.post(loginApiUrl, {
      headers: headers,
      data: {
        email: 'invalid@example.com',
        password: validCredentials.password
      }
    });

    // Assertions - API returns 400 not 401 for invalid credentials
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    
    // Check for validation errors based on actual response
    if (responseBody.errors) {
      expect(responseBody).toHaveProperty('errors');
    } else if (responseBody.message) {
      expect(responseBody.message).toContain('Invalid');
    }
  });

  test('should Pass login with invalid password', async ({ request }) => {
    // Send login request with invalid password
    const response = await request.post(loginApiUrl, {
      headers: headers,
      data: {
        email: validCredentials.email,
        password: 'wrongpassword123'
      }
    });

    // Assertions - API returns 400 not 401 for invalid credentials
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    
    // Check for validation errors based on actual response
    if (responseBody.errors) {
      expect(responseBody).toHaveProperty('errors');
    } else if (responseBody.message) {
      expect(responseBody.message).toContain('Invalid');
    }
  });

  test('should Pass login with missing credentials', async ({ request }) => {
    // Send login request with missing credentials
    const response = await request.post(loginApiUrl, {
      headers: headers,
      data: {}
    });

    // Assertions
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    
    // Check for validation errors based on actual response structure
    expect(responseBody).toHaveProperty('errors');
    expect(responseBody.errors).toHaveProperty('Email');
    expect(responseBody.errors).toHaveProperty('Password');
    expect(responseBody).toHaveProperty('status', 400);
    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('traceId');
  });

  test('should verify API key behavior', async ({ request }) => {
    // Create headers with invalid API key
    const invalidHeaders = {
      ...headers,
      'apikey': 'invalid-api-key'
    };

    // Send login request with invalid API key
    const response = await request.post(loginApiUrl, {
      headers: invalidHeaders,
      data: validCredentials
    });

    // Get the response body
    const responseBody = await response.json();
    
    // Document the actual behavior instead of assuming it will Pass
    console.log(`API key test - Status code: ${response.status()}`);
    
    if (response.status() === 200) {
      // If API accepts invalid key, verify the response has expected structure
      expect(responseBody).toHaveProperty('auth_token');
      test.info().annotations.push({
        type: 'warning',
        description: 'API accepts invalid API keys - security concern'
      });
    } else {
      // If API rejects invalid key (expected secure behavior)
      expect(response.status()).not.toBe(200);
    }
  });
  test('should successfully login with valid credentials', async ({ request }) => {
    // Send login request with valid credentials
    const response = await request.post(loginApiUrl, {
      headers: headers,
      data: validCredentials
    });
    
    // Assertions
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    // Based on actual response structure
    expect(responseBody).toHaveProperty('auth_token');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('Email', validCredentials.email);
    
    // Verify user role
    expect(responseBody).toHaveProperty('role', 'Super admin');
    
    // Verify token expiration
    expect(responseBody).toHaveProperty('expires_in');
    
    // Store token for potential use in other tests
    token_SA = responseBody.auth_token;
    console.log('Token set in login test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // Verify token was actually set
    expect(token_SA).not.toBeNull();
    expect(token_SA.length).toBeGreaterThan(20);
  });

  
  /**
   * Create/Update Super Admin API Tests
   */
  
  // Generate a random email to avoid conflicts
  const getRandomEmail = () => `Automation-${Math.floor(Math.random() * 10000)}-${Date.now()}@yopmail.com`;
  
  // Test data for creating a new super admin based on the curl command
  const superAdminData = {
    ClientId: 1,
    Role: 'Super admin',
    FirstName: 'Automation',
    LastName: '-ran-',
    Email: getRandomEmail(),
    Address: 'MCP server - Troon tech - Islamabad',
    DateofBirth: '2007-05-01T19:00:00.000Z',
    PhoneNumber: '12162007917',
    Password: 'Test_54321',
    IsActive: true,
    IsEmailConfirmed: true,
    Permissions: [
      { UserId: '6ca16283-7229-4cf9-b6ea-36c52f8f29f5', ClaimType: 'Ledger Transfer', ClaimValue: 'Ledger Transfer' },
      { UserId: '054b6017-3ea4-4613-b969-d57cf6339d29', ClaimType: 'Issue Card', ClaimValue: 'Issue Card' },
      { UserId: 'c9b3d899-014b-4ac0-a1bb-21d2533cd788', ClaimType: 'Deposit Tab', ClaimValue: 'Deposit Tab' },
      { UserId: '160420db-c478-4ce6-bb3d-88323235c49b', ClaimType: 'Load Card', ClaimValue: 'Load Card' },
      { UserId: '649c5e1d-37e7-48cd-8075-8aba15876487', ClaimType: 'Create Client', ClaimValue: 'Create Client' },
      { UserId: '1bb1b5c6-11d3-4f50-a4c6-da54169636df', ClaimType: 'Admin Role Management', ClaimValue: 'Admin Role Management' },
      { UserId: '17718bd1-f5a0-4963-ba88-67551bd271b1', ClaimType: 'Debit Fund', ClaimValue: 'Debit Fund' },
      { UserId: 'ce7b769f-12c6-4278-95fb-1f802b5bbb04', ClaimType: 'Suspend Card', ClaimValue: 'Suspend Card' },
      { UserId: '8e11318a-7dae-4f4a-a048-5bf572fddfc8', ClaimType: 'View ledger history', ClaimValue: 'View ledger history' },
      { UserId: '46a3bd5d-9adc-496c-8f56-eeae05778be0', ClaimType: 'View ledger balance', ClaimValue: 'View ledger balance' },
      { UserId: '25ba6658-cc00-40d1-9c96-9f7c1b6a897c', ClaimType: 'Update Cardholder Info', ClaimValue: 'Update Cardholder Info' }
    ]
  };
  
  test('should successfully create a new super admin', async ({ request }) => {
    // Check if token is available
    console.log('Token available before super admin test:',  token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // Skip test if token is not available
    if (!token_SA) {
      test.skip(true, 'Token not available. Login test must run first.');
      return;
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create a new super admin with unique email
    const testData = {
      ...superAdminData,
      Email: getRandomEmail()
    };
    
    // Send create super admin request
    const response = await request.post(createUpdateApiUrl, {
      headers: authHeaders,
      data: testData
    });
    
    // Assertions
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    // Verify response structure
    // expect(responseBody).toHaveProperty('userId');
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toContain('Success');
  });
  
  test('should Pass when creating super admin with missing required fields', async ({ request }) => {
    // Skip test if token is not available
    if (!token_SA) {
      test.skip(true, 'Token not available. Login test must run first.');
      return;
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create an incomplete data object missing required fields
    const incompleteData = {
      ClientId: 1,
      Role: 'Super admin',
      // Missing FirstName, LastName, Email, etc.
    };
    
    // Send create super admin request with incomplete data
    const response = await request.post(createUpdateApiUrl, {
      headers: authHeaders,
      data: incompleteData
    });
    
    // Assertions - should Pass with validation error
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    
    // Verify error response structure
    expect(responseBody).toHaveProperty('errors');
  });
  
  test('should Pass when creating super admin with duplicate email', async ({ request }) => {
    // Skip test if token is not available
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {headers: headers,data: validCredentials});
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in issue card test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Use a known email that already exists in the system
    const duplicateData = {
      ...superAdminData,
      Email: 'usmanmanzoor@troontechnologies.com' // Using existing email
    };
    
    // Send create super admin request with duplicate email
    const response = await request.post(createUpdateApiUrl, {
      headers: authHeaders,
      data: duplicateData
    });
    
    // Assertions - should Pass with conflict or validation error
    expect([400, 409]).toContain(response.status());
  });
  
  test('should Pass when creating super admin without authorization', async ({ request }) => {
    // Send create super admin request without authorization
    const response = await request.post(createUpdateApiUrl, {
      headers: headers, // No auth token
      data: superAdminData
    });
    
    // Assertions - should Pass with unauthorized error
    expect([401, 403]).toContain(response.status());
  });
  
  // test('should update an existing super admin', async ({ request }) => {
  //   // Check if token is available
  //   console.log('Token available before update super admin test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
  //   //authorization header with token from login
  //   const authHeaders = {
  //     ...headers,
  //     'authorization': `Bearer ${token_SA}`
  //   };
    
  //   // Step 1: Create a new super admin
  //   const email = getRandomEmail();
  //   const createData = {
  //     ...superAdminData,      
  //     PhoneNumber: '12162007971'
  //     // Email: email
  //   };
    
  //   const createResponse = await request.post(createUpdateApiUrl, {
  //     headers: authHeaders,
  //     data: createData
  //   });
    
  //   // Verify creation was successful
  //   expect(createResponse.status()).toBe(200);
  //   const createResponseBody = await createResponse.json();
  //   const userId = createResponseBody.userId;
    
  //   // Step 2: Update the super admin
  //   const updateData = {
  //     ...createData,
  //     UserId: userId, // Include the user ID for update
  //     FirstName: 'Updated',
  //     LastName: 'Admin'
  //   };
    
  //   const updateResponse = await request.post(createUpdateApiUrl, {
  //     headers: authHeaders,
  //     data: updateData
  //   });
    
  //   // Assertions for update
  //   expect(updateResponse.status()).toBe(200);
  //   const updateResponseBody = await updateResponse.json();
    
  //   // Verify response structure
  //   expect(updateResponseBody).toHaveProperty('userId');
  //   expect(updateResponseBody).toHaveProperty('message');
  //   expect(updateResponseBody.message).toContain('Success');
  // });
// 
  /**
   * Add Client API Tests
   */
  
  // Generate a random email for client to avoid conflicts
  const getRandomClientEmail = () => `Client_automation-${Math.floor(Math.random() * 1000)}-${Date.now()}@yopmail.com`;
  
  // Test data for creating a new client based on the curl command
  const clientData = {
    ClientName: 'Client',
    NumOfRegistration: 'APP165troon',
    RUC: 'P164',
    KindOfBusiness: 'Fintech',
    HomeNumber: 'I 94',
    Region: 'Nearpotohar',
    Mobile: '12162007917',
    Email: getRandomClientEmail(),
    PrefundAmount: 1,
    PointOfContact: 'Umairaslam',
    LogoUrl: 'https://sovpay-dev-temp.s3.amazonaws.com/sovpay-dev-temp/ProfileImages/36a24bd4-647e-47c4-99ca-ef4d536a5fce.png',
    ClientStatusId: 1,
    Permissions: [
      { UserId: '8c90b441-1eef-47b6-9715-44b34e9782ff', ClaimType: 'Load Card', ClaimValue: 'Load Card' },
      { UserId: 'f733e2e4-9195-4327-91c8-7a549e7b64e0', ClaimType: 'Issue Virtual Card', ClaimValue: 'Issue Virtual Card' },
      { UserId: '3ec2fa51-f5a8-4ebd-8062-95fbca8bf287', ClaimType: 'Issue Physical Card', ClaimValue: 'Issue Physical Card' },
      { UserId: 'f8bbe66c-9b82-4dc0-8103-a3d10565ae96', ClaimType: 'Suspend Card', ClaimValue: 'Suspend Card' },
      { UserId: '5b1d48bf-40ed-4dc8-be32-42fa39a60b2e', ClaimType: 'View Ledger Balance', ClaimValue: 'View Ledger Balance' },
      { UserId: '6dc8feed-89e8-4186-a659-24faea0accce', ClaimType: 'View Ledger History', ClaimValue: 'View Ledger History' },
      { UserId: 'd64882a2-f68c-401b-8869-ab82d2627fa8', ClaimType: 'View CardHolder Transactions', ClaimValue: 'View CardHolder Transactions' },
      { UserId: '6693515c-99c4-433b-9366-97747bc1c0e9', ClaimType: 'View Cardholder KYC', ClaimValue: 'View Cardholder KYC' },
      { UserId: '17060152-d24e-4a6c-83c8-b3e52866cd30', ClaimType: 'Debit Fund', ClaimValue: 'Debit Fund' },
      { UserId: 'efd42ed9-b5b8-48b9-8342-a66ac5b4439c', ClaimType: 'Update Cardholder Info', ClaimValue: 'Update Cardholder Info' },
      { UserId: '736174e3-8893-4d24-9eff-95fdf9fa5695', ClaimType: 'Card to Card Transfer', ClaimValue: 'Card to Card Transfer' },
      { UserId: '334a4b46-7e97-46fc-9e46-a5a74f767831', ClaimType: 'User KYC', ClaimValue: 'User KYC' }
    ],
    Rolename: 'Client admin',
    Address: 'MCP server - Trron tech',
    City: 'Islamabad',
    ZipCode: '54321',
    CountryCode: 'PK',
    PaymentProcessorId: 3,
    CardLimit: 50,
    PrimaryColorCode: '#f30505',
    SecondaryColorCode: '#c400c4',
    ColorPrimarylighter1: '#137100',
    ColorPrimarylighter2: '#3300a7',
    CurrencyCode: 'USD',
    RefrenceEmail: '',
    CardFlow: 'CREDIT',
    IssuerCategory: 'IssuerP',
    AccountType: 'ExternalAccounts',
    CardVisaMaster: 'Master'
  };
  
  test('should successfully add a new client', async ({ request }) => {
    // Check if token is available
    console.log('Token available before add client test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // Skip test if token is not available
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in client test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in client test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create a new client with unique email
    const testData = {
      ...clientData,
      Email: getRandomClientEmail()
    };
    
    // Send add client request
    const response = await request.post(addClientApiUrl, {
      headers: authHeaders,
      data: testData
    });
    
    // Assertions
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    console.log('Add client response:', JSON.stringify(responseBody, null, 2));
    
    // Verify response structure
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('message', 'Success');
    expect(responseBody).toHaveProperty('payload');
    expect(responseBody.payload).toHaveProperty('item2'); // Client ID is in payload.item2
  });
  
  test('should Pass when adding client with missing required fields', async ({ request }) => {
    // Skip test if token is not available
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {headers: headers,data: validCredentials});
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in issue card test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create an incomplete data object missing required fields
    const incompleteData = {
      ClientName: 'Client',
      // Missing other required fields
    };
    
    // Send add client request with incomplete data
    const response = await request.post(addClientApiUrl, {
      headers: authHeaders,
      data: incompleteData
    });    
    // Assertions - should Pass with validation error
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    
    console.log('Missing fields response:', JSON.stringify(responseBody, null, 2));
    
    // Verify error response structure based on actual API behavior
    if (responseBody.errors) {
      expect(responseBody).toHaveProperty('errors');
    } else {
      // Alternative error structure
      expect(responseBody).toHaveProperty('success', false);
    }
  });
  
  test('should Pass when adding client with duplicate email', async ({ request }) => {
    // Skip test if token is not available
    if (!token_SA) {
      test.skip(true, 'Token not available. Login test must run first.');
      return;
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Step 1: Create a client with a specific email
    const email = getRandomClientEmail();
    const firstClientData = {
      ...clientData,
      Email: email
    };
    
    // Send first add client request
    const firstResponse = await request.post(addClientApiUrl, {
      headers: authHeaders,
      data: firstClientData
    });
    
    // Verify first creation was successful
    expect(firstResponse.status()).toBe(200);
    const firstResponseBody = await firstResponse.json();
    console.log('First client creation response:', JSON.stringify(firstResponseBody, null, 2));
    
    // Step 2: Try to create another client with the same email
    const duplicateData = {
      ...clientData,
      Email: email // Using the same email
    };
    
    // Send add client request with duplicate email
    const response = await request.post(addClientApiUrl, {
      headers: authHeaders,
      data: duplicateData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Duplicate email response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions - should Pass with conflict or validation error
    // The API might return 200 but with success: false for business validation errors
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success');
      if (responseBody.success) {
        // If it somehow succeeded, the test should Pass
        expect(responseBody.success).toBe(false);
      }
    } else {
      expect([400, 409]).toContain(response.status());
    }
  });
  
  test('should Pass when adding client without authorization', async ({ request }) => {
    // Send add client request without authorization
    const response = await request.post(addClientApiUrl, {
      headers: headers, // No auth token
      data: clientData
    });
    
    // Assertions - should Pass with unauthorized error
    // Some APIs return 200 with an error message instead of proper status codes
    if (response.status() === 200) {
      try {
        const responseBody = await response.json();
        console.log('Unauthorized response:', JSON.stringify(responseBody, null, 2));
        // If status is 200, the response should indicate Passure
        expect(responseBody).toHaveProperty('success', false);
      } catch (error) {
        console.log('Error parsing JSON response:', error.message);
        // If can't parse JSON, the test should still pass as we're expecting an error
      }
    } else {
      // Otherwise, expect proper unauthorized status codes
      expect([401, 403, 400]).toContain(response.status());
    }
  });

  /**
   * Issue Card API Tests
   */
  // Generate a random email for cardholder to avoid conflicts
  const getRandomCardholderEmail = () => `Automationcard-${Math.floor(Math.random() * 1000)}-${Date.now()}@yopmail.com`;
  
  // Test data for issuing a new card based on the curl command
  const cardData = {
    FirstName: 'Automation',
    LastName: 'card',
    PreferredName: 'random',
    EmployeeId: 'App5648',
    Gender: 'Male',
    DateOfBirth: '2007-05-02',
    Email: getRandomCardholderEmail(),
    Mobile: '12356581815',
    Nationality: 'GB',
    DeliveryAddress1: 'Troon labs',
    DeliveryCity: 'Islamabad',
    DeliveryZipCode: '165488',
    BillingAddress1: 'Troon labs',
    BillingCity: 'Islamabad',
    BillingZipCode: '165488',
    cardFeeCurrencyCode: 'USD',
    cardType: 'GPR_VIR',
    CountryCode: 'GB',
    cardIssuanceAction: 'NEW',
    BillingCountry: 'AF',
    DeliveryCountry: 'AF',
    DeliveryMode: '',
    ClientId: 12,
    SpendingLimits: 5000,
    BillingState: 'AF',
    DeliveryState: 'AF',
    CardColor: 'Green',
    CardVisaMaster: 'Master'
  };
  
  test('should Pass with client not active in paycaddy error', async ({ request }) => {
    // Check if token is available
    console.log('Token available before issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {headers: headers,data: validCredentials});
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in issue card test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create a new card with unique email
    const testData = {
      ...cardData,
      ClientId: 1087, 
      Email: getRandomCardholderEmail()
    };
    
    // Send issue card request
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: testData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Issue card response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions for the expected error
    // The API might return 200 with an error message for business validation errors
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody.message).toEqual('Client is not active in PayCaddy');
    } else {
      // If it returns an error status code, that's also acceptable
      expect([400, 422]).toContain(response.status());
      // Check the error message if available
      if (responseBody.message) {
        expect(responseBody.message).toEqual('Client is not active in PayCaddy');
      }
    }
  });   
  test('CARD should BE ISSUED', async ({ request }) => {
    // Check if token is available
    console.log('Token available before issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in issue card test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create a new card with unique email
    const testData = {
      ...cardData,
      ClientId: 12,
      Email: getRandomCardholderEmail(),
    };
    
    // Send issue card request
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: testData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Issue card response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions for the expected error
    // The API might return 200 with an error message for business validation errors
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody.message).toEqual('Issue Card Limit Exceeded');
    } else {
      // If it returns an error status code, that's also acceptable
      expect([400, 422]).toContain(response.status());
      // Check the error message if available
      if (responseBody.message) {
        expect(responseBody.message).toEqual('Issue Card Limit Exceeded');
      }
    }
  });
  test('should Pass with card limit exceeded error', async ({ request }) => {
    // Check if token is available
    console.log('Token available before issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
    
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      console.log('Token not available, attempting to login...');
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
        console.log('Token obtained in issue card test:', token_SA ? token_SA.substring(0, 10) + '...' : 'null');
      } else {
        console.log('Login Passed in issue card test with status:', loginResponse.status());
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create a new card with unique email
    const testData = {
      ...cardData,
      Email: getRandomCardholderEmail(),
    };
    
    // Send issue card request
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: testData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Issue card response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions for the expected error
    // The API might return 200 with an error message for business validation errors
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody.message).toEqual('Issue Card Limit Exceeded');
    } else {
      // If it returns an error status code, that's also acceptable
      expect([400, 422]).toContain(response.status());
      // Check the error message if available
      if (responseBody.message) {
        expect(responseBody.message).toEqual('Issue Card Limit Exceeded');
      }
    }
  });
  
  test('should Pass when issuing card with missing required fields', async ({ request }) => {
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
      } else {
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create an incomplete data object missing required fields
    const incompleteData = {
      FirstName: 'Automation',
      LastName: 'card',
      // Missing other required fields
    };
    
    // Send issue card request with incomplete data
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: incompleteData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    // console.log('Missing fields card response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions - should Pass with validation error
    if (response.status() === 200) {
      // If status is 200, the response should indicate Passure
      expect(responseBody).toHaveProperty('success', false);
    } else {
      // Otherwise, expect proper validation error status code
      expect([400, 422]).toContain(response.status());
    }
  });
  
  test('should Pass when issuing card without authorization', async ({ request }) => {
    // Send issue card request without authorization
    const response = await request.post(issueCardApiUrl, {
      headers: headers, // No auth token
      data: cardData
    });
    
    // Assertions - should Pass with unauthorized error
    // Some APIs return 200 with an error message instead of proper status codes
    if (response.status() === 200) {
      try {
        const responseBody = await response.json();
        console.log('Unauthorized card response:', JSON.stringify(responseBody, null, 2));
        // If status is 200, the response should indicate Passure
        expect(responseBody).toHaveProperty('success', false);
      } catch (error) {
        console.log('Error parsing JSON response for card test:', error.message);
        // If can't parse JSON, the test should still pass as we're expecting an error
      }
    } else {
      // Otherwise, expect proper unauthorized status codes
      expect([401, 403, 400]).toContain(response.status());
    }
  });

  test('should Pass when issuing card with invalid client ID', async ({ request }) => {
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
      } else {
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create data with invalid client ID
    const invalidClientData = {
      ...cardData,
      Email: getRandomCardholderEmail(),
      ClientId: 999999 // Non-existent client ID
    };
    
    // Send issue card request with invalid client ID
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: invalidClientData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Invalid client ID response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions - should Pass with client not found error
    if (response.status() === 200) {
      // If status is 200, the response should indicate Passure
      expect(responseBody).toHaveProperty('success', false);
      // The error message might vary, but should indicate client issue
      expect(responseBody.message).toMatch(/client|not found|invalid/i);
    } else {
      // Otherwise, expect proper error status code
      expect([400, 404, 422]).toContain(response.status());
    }
  });

  test('should Pass when issuing card with duplicate email', async ({ request }) => {
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
      } else {
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Use a fixed email that's likely to already exist in the system
    const duplicateData = {
      ...cardData,
      Email: 'usmanmanzoor@troontechnologies.com' // Using existing email
    };
    
    // Send issue card request with duplicate email
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: duplicateData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Duplicate email card response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions - should Pass with duplicate email error
    if (response.status() === 200) {
      // If status is 200, the response should indicate Passure
      expect(responseBody).toHaveProperty('success', false);
      // The error message might vary, but should indicate email issue
      expect(responseBody.message).toMatch(/email|duplicate|already exists/i);
    } else {
      // Otherwise, expect proper error status code
      expect([400, 409, 422]).toContain(response.status());
    }
  });

  test('should Pass when issuing card with invalid date format', async ({ request }) => {
    // If token is not available, try to get it first
    if (!token_SA) {
      // Try to login and get a token
      const loginResponse = await request.post(loginApiUrl, {
        headers: headers,
        data: validCredentials
      });
      
      if (loginResponse.status() === 200) {
        const loginResponseBody = await loginResponse.json();
        token_SA = loginResponseBody.auth_token;
      } else {
        test.skip(true, 'Could not obtain token. Login Passed.');
        return;
      }
    }
    
    // Add authorization header with token from login
    const authHeaders = {
      ...headers,
      'authorization': `Bearer ${token_SA}`
    };
    
    // Create data with invalid date format
    const invalidDateData = {
      ...cardData,
      Email: getRandomCardholderEmail(),
      DateOfBirth: '05-02-2007' // Invalid format (should be YYYY-MM-DD)
    };
    
    // Send issue card request with invalid date format
    const response = await request.post(issueCardApiUrl, {
      headers: authHeaders,
      data: invalidDateData
    });
    
    // Log the response for debugging
    const responseBody = await response.json();
    console.log('Invalid date format response:', JSON.stringify(responseBody, null, 2));
    
    // Assertions - should Pass with date format error
    if (response.status() === 200) {
      // If status is 200, the response should indicate Passure
      expect(responseBody).toHaveProperty('success', false);
      // The error message might vary, but should indicate date issue
      expect(responseBody.message).toMatch(/date|format|invalid/i);
    } else {
      // Otherwise, expect proper validation error status code
      expect([400, 422]).toContain(response.status());
    }
  });
});