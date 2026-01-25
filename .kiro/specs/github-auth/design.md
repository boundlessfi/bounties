# Design Document: GitHub Authentication with Better Auth

## Overview

This design implements GitHub OAuth authentication using the Better Auth library, integrated with a staging API backend. The solution provides a client-side authentication flow with proper state management, error handling, and session persistence. The implementation follows Better Auth's recommended patterns for social authentication and leverages React hooks for state management.

The authentication flow follows the standard OAuth 2.0 authorization code flow:
1. User clicks "Sign in with GitHub" button
2. Client initiates OAuth flow via Better Auth
3. User is redirected to GitHub for authorization
4. GitHub redirects back to staging API callback
5. Staging API validates and creates session
6. User is authenticated with persisted session

## Architecture

### Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Sign-In Component (React)                     │  │
│  │  - GitHub button UI                                   │  │
│  │  - Loading state management                           │  │
│  │  - Error display                                      │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   │ calls signIn.social()                   │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Auth Client (Better Auth)                     │  │
│  │  - baseURL: staging-api.boundlessfi.xyz              │  │
│  │  - GitHub provider configuration                      │  │
│  │  - Session management                                 │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ HTTPS OAuth flow
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Staging API Backend                             │
│         (staging-api.boundlessfi.xyz)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Better Auth Server                            │  │
│  │  - GitHub OAuth provider                              │  │
│  │  - GITHUB_CLIENT_ID (env)                            │  │
│  │  - GITHUB_CLIENT_SECRET (env)                        │  │
│  │  - Callback: /api/auth/callback/github              │  │
│  │  - Session creation & persistence                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                    │
                    │ OAuth authorization
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub OAuth                              │
│  - Authorization page                                        │
│  - Scope: user:email                                         │
│  - Redirect to callback URL                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initialization**: Auth client is created with staging API base URL
2. **User Action**: User clicks sign-in button
3. **State Update**: Component enters loading state, button disabled
4. **OAuth Initiation**: Auth client calls `signIn.social({ provider: "github" })`
5. **Redirect to GitHub**: Browser redirects to GitHub authorization page
6. **User Authorization**: User approves application access on GitHub
7. **Callback**: GitHub redirects to `https://staging-api.boundlessfi.xyz/api/auth/callback/github`
8. **Session Creation**: Staging API validates OAuth code and creates session
9. **Client Update**: Better Auth client receives session, updates state
10. **UI Update**: Component exits loading state, user is authenticated

### Error Flow

1. **Error Occurs**: OAuth fails, network error, or popup blocked
2. **Error Caught**: Component catch block receives error
3. **State Update**: Loading state disabled, button re-enabled
4. **Error Display**: Error message shown to user in UI
5. **Retry Available**: User can click button again to retry

## Components and Interfaces

### Auth Client Module (`lib/auth-client.ts`)

**Purpose**: Centralized Better Auth client configuration

**Interface**:
```typescript
// Export configured auth client
export const authClient: AuthClient

// Configuration
interface AuthClientConfig {
  baseURL: string  // "https://staging-api.boundlessfi.xyz"
}

// Error handling utility
export function getErrorMessage(code: string): string
```

**Implementation Details**:
- Uses `createAuthClient` from "better-auth/react"
- Base URL points to staging API (no production URLs)
- No secrets or credentials in client code
- Error message mapping for user-friendly display

**Key Methods Used**:
- `authClient.signIn.social({ provider: "github" })` - Initiates OAuth flow
- Session state automatically managed by Better Auth

### Sign-In Component (`components/login/sign-in.tsx`)

**Purpose**: User interface for GitHub authentication

**Interface**:
```typescript
export default function SignIn(): JSX.Element
```

**State Management**:
```typescript
interface SignInState {
  loading: boolean      // OAuth flow in progress
  error: string | null  // Error message to display
}
```

**Implementation Details**:
- React functional component with hooks
- `useState` for loading and error states
- Button click handler initiates OAuth flow
- Loading state disables button and shows indicator
- Error state displays message below button
- Uses existing UI components (Button, Card, etc.)

**Event Handlers**:
```typescript
async function handleGitHubSignIn(): Promise<void> {
  // 1. Set loading state
  // 2. Call authClient.signIn.social()
  // 3. Handle success (Better Auth manages redirect)
  // 4. Catch errors and display
  // 5. Reset loading state
}
```

### UI Components

**Button Component** (`components/ui/button.tsx`):
- Existing component from UI library
- Props: `variant`, `className`, `disabled`, `onClick`
- Supports loading state via `disabled` prop

**Card Components** (`components/ui/card.tsx`):
- Existing components for layout
- Used: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Error Display**:
- Rendered conditionally when error state exists
- Positioned below button
- Uses alert or text styling for visibility
- Includes error message from `getErrorMessage()`

## Data Models

### Session Model

**Managed by Better Auth** - No custom implementation needed

```typescript
interface Session {
  user: {
    id: string
    email: string
    name?: string
    image?: string
  }
  expiresAt: Date
}
```

**Persistence**:
- Automatically stored by Better Auth (likely in cookies/localStorage)
- Survives page refreshes
- Validated on each request to staging API

### Error Model

```typescript
interface AuthError {
  code: string          // Error code from Better Auth
  message: string       // Human-readable message
  type: 'oauth' | 'network' | 'popup_blocked' | 'unknown'
}
```

**Error Types**:
- **OAuth Error**: GitHub authorization failed or denied
- **Network Error**: Cannot reach staging API
- **Popup Blocked**: Browser blocked OAuth popup/redirect
- **Unknown**: Unexpected error

### Configuration Model

```typescript
interface GitHubOAuthConfig {
  clientId: string              // Set on staging API (not in client)
  clientSecret: string          // Set on staging API (not in client)
  callbackURL: string          // "https://staging-api.boundlessfi.xyz/api/auth/callback/github"
  scope: string[]              // ["user:email"]
}
```

**Environment Variables** (staging API only):
- `GITHUB_CLIENT_ID`: OAuth application client ID
- `GITHUB_CLIENT_SECRET`: OAuth application client secret

**Client Environment** (if needed):
- `NEXT_PUBLIC_APP_URL`: Could be used for baseURL, but hardcoding staging URL is acceptable for this bounty


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

For this GitHub authentication feature, most requirements are specific examples or integration-level behaviors rather than universal properties. The testable requirements focus on specific UI states, configuration values, and error handling scenarios. Below are the key correctness properties and examples that should be validated:

### Configuration Properties

**Property 1: Auth client staging configuration**
*For the* auth client instance, the baseURL should be set to "https://staging-api.boundlessfi.xyz" and should not contain any production domain references.
**Validates: Requirements 1.1, 1.3, 8.3, 8.4**

**Property 2: GitHub provider support**
*For the* auth client instance, the signIn.social method should exist and accept "github" as a valid provider parameter.
**Validates: Requirements 1.4**

### UI Component Properties

**Property 3: Sign-in button presence**
*For the* Sign_In_Component when rendered, it should display a button with the text "Sign in with GitHub" and contain a GitHub icon/logo element.
**Validates: Requirements 3.1, 3.2**

**Property 4: OAuth flow initiation**
*For any* button click event on the sign-in button, the auth client's signIn.social method should be called with provider set to "github".
**Validates: Requirements 3.3, 4.1, 4.2**

### Loading State Properties

**Property 5: Loading state activation**
*For any* sign-in button click, the component should immediately enter loading state (loading = true).
**Validates: Requirements 5.1**

**Property 6: Button disabled during loading**
*For any* component state where loading is true, the sign-in button should be disabled and prevent duplicate sign-in attempts.
**Validates: Requirements 5.2, 5.5**

**Property 7: Loading indicator display**
*For any* component state where loading is true, a loading indicator (spinner or text) should be visible in the UI.
**Validates: Requirements 5.3**

**Property 8: Loading state reset**
*For any* OAuth flow completion (success or error), the component should exit loading state (loading = false).
**Validates: Requirements 5.4**

### Error Handling Properties

**Property 9: Error catching**
*For any* error thrown during the OAuth flow, the component should catch the error and prevent unhandled exceptions.
**Validates: Requirements 6.1**

**Property 10: Error message display**
*For any* caught error during authentication, the component should display a visible error message in the UI (not console-only).
**Validates: Requirements 6.2, 6.3**

**Property 11: Button re-enabled after error**
*For any* error state, the sign-in button should be re-enabled (loading = false, disabled = false) to allow retry.
**Validates: Requirements 6.4**

### Edge Cases

**Edge Case 1: Popup blocked error**
When a popup is blocked by the browser, the system should display a specific "popup blocked" error message.
**Validates: Requirements 6.5**

**Edge Case 2: OAuth failure error**
When the OAuth flow fails (user denies, GitHub error), the system should display a specific OAuth failure error message.
**Validates: Requirements 6.6**

**Edge Case 3: Network error**
When a network error occurs (cannot reach staging API), the system should display a specific network error message.
**Validates: Requirements 6.7**

## Error Handling

### Error Categories

1. **OAuth Errors**
   - User denies authorization on GitHub
   - Invalid OAuth configuration
   - GitHub service unavailable
   - **Handling**: Display user-friendly message, re-enable button, allow retry

2. **Network Errors**
   - Cannot reach staging API
   - Timeout during OAuth flow
   - Connection interrupted
   - **Handling**: Display network error message, re-enable button, suggest checking connection

3. **Browser Errors**
   - Popup blocked by browser
   - Third-party cookies disabled
   - **Handling**: Display specific message about browser settings, provide instructions

4. **Unknown Errors**
   - Unexpected exceptions
   - Better Auth internal errors
   - **Handling**: Display generic error message, log to console for debugging, re-enable button

### Error Handling Strategy

```typescript
async function handleGitHubSignIn() {
  setLoading(true);
  setError(null);
  
  try {
    await authClient.signIn.social({
      provider: "github",
    });
    // Success - Better Auth handles redirect and session
  } catch (err) {
    // Categorize error
    const errorCode = err?.code || 'UNKNOWN_ERROR';
    const errorMessage = getErrorMessage(errorCode);
    
    // Display to user
    setError(errorMessage);
    
    // Log for debugging
    console.error('GitHub sign-in failed:', err);
  } finally {
    setLoading(false);
  }
}
```

### Error Recovery

- **Automatic Retry**: Not implemented (user must manually retry)
- **State Reset**: Loading state always reset after error
- **Button Re-enable**: Button always re-enabled after error
- **Error Persistence**: Error message persists until next sign-in attempt
- **Error Clearing**: Error cleared when user clicks sign-in again

## Testing Strategy

### Unit Testing Approach

This feature will use a combination of unit tests and integration tests. Given the nature of OAuth flows and external dependencies, we'll focus on testing component behavior, state management, and error handling rather than the actual OAuth flow (which is handled by Better Auth and tested by their library).

**Testing Framework**: Jest with React Testing Library

**Test Categories**:

1. **Configuration Tests** (Unit)
   - Verify auth client is configured with correct baseURL
   - Verify no production URLs in configuration
   - Verify GitHub provider is available

2. **Component Rendering Tests** (Unit)
   - Verify sign-in button renders with correct text
   - Verify GitHub icon is present
   - Verify initial state (not loading, no error)

3. **State Management Tests** (Unit)
   - Verify loading state activates on button click
   - Verify button disables during loading
   - Verify loading indicator appears during loading
   - Verify loading state resets after completion

4. **Error Handling Tests** (Unit)
   - Verify errors are caught and don't crash component
   - Verify error messages display in UI
   - Verify button re-enables after error
   - Verify specific error messages for different error types

5. **Integration Tests** (Integration)
   - Mock Better Auth client
   - Verify signIn.social is called with correct parameters
   - Simulate successful OAuth flow
   - Simulate various error scenarios

**Mocking Strategy**:
- Mock `authClient.signIn.social()` to avoid actual OAuth flows in tests
- Mock successful responses and various error scenarios
- Use React Testing Library to test component behavior, not implementation details

**Test Coverage Goals**:
- 100% coverage of error handling paths
- 100% coverage of state transitions
- All user-facing UI states tested
- All error types tested

### Property-Based Testing

Given the nature of this feature (OAuth integration with specific UI states), property-based testing is less applicable than example-based unit tests. The requirements are primarily about specific configurations, UI states, and error handling scenarios rather than universal properties across varied inputs.

**Why Limited PBT**:
- OAuth flow is deterministic (not random inputs)
- Configuration values are specific constants
- UI states are discrete (loading/not loading, error/no error)
- Error types are enumerated (not infinite variations)

**PBT Opportunities** (if applicable):
- Could generate random error codes and verify error handling doesn't crash
- Could test that any error always results in button re-enable
- Could test that any loading state always disables button

However, for this feature, example-based unit tests with specific scenarios will provide better coverage and clarity than property-based tests.

### Testing Configuration

**Test File Structure**:
```
lib/auth-client.test.ts          # Auth client configuration tests
components/login/sign-in.test.tsx # Sign-in component tests
```

**Test Execution**:
- Run with `npm test` or `npm run test:watch`
- Minimum 100 iterations for any property-based tests (if implemented)
- All tests must pass before considering feature complete

**Test Annotations**:
Each test should reference the design property it validates:
```typescript
// Feature: github-auth, Property 1: Auth client staging configuration
test('auth client should use staging API baseURL', () => {
  // test implementation
});
```

### Manual Testing Checklist

Before considering the feature complete, manually verify:

1. ✅ Click "Sign in with GitHub" button
2. ✅ Redirected to GitHub authorization page
3. ✅ Authorize application on GitHub
4. ✅ Redirected back to application
5. ✅ User is authenticated (session exists)
6. ✅ Refresh page - user stays authenticated
7. ✅ Loading state shows during OAuth flow
8. ✅ Button is disabled during loading
9. ✅ Error message displays if OAuth fails
10. ✅ Button re-enables after error
11. ✅ Can retry after error
12. ✅ No production URLs in network tab
13. ✅ No secrets visible in client code or network requests
14. ✅ All requests go to staging-api.boundlessfi.xyz

### Integration Testing

**End-to-End Flow** (manual or automated with Playwright/Cypress):
1. Start application
2. Navigate to sign-in page
3. Click GitHub button
4. Complete OAuth on GitHub
5. Verify redirect back to app
6. Verify authenticated state
7. Verify session persists on refresh

**Error Scenarios** (manual testing):
1. Deny authorization on GitHub → verify error message
2. Block popup → verify popup blocked message
3. Disconnect network during flow → verify network error
4. Invalid OAuth config (staging API) → verify OAuth error

This testing strategy ensures comprehensive coverage of the GitHub authentication feature while focusing on practical, maintainable tests that validate the requirements.
