# Implementation Plan: GitHub Authentication with Better Auth

## Overview

This implementation plan breaks down the GitHub authentication feature into discrete coding tasks. Each task builds on previous work and includes specific requirements references. The plan follows a logical progression: configuration → UI implementation → state management → error handling → testing → integration.

## Tasks

- [x] 1. Configure Better Auth client for staging API
  - Update `lib/auth-client.ts` to use staging API base URL
  - Set baseURL to "https://staging-api.boundlessfi.xyz"
  - Ensure no production URLs or hardcoded secrets
  - Verify GitHub provider is available via Better Auth
  - _Requirements: 1.1, 1.3, 1.4, 8.3, 8.4_

- [ ]* 1.1 Write unit tests for auth client configuration
  - **Property 1: Auth client staging configuration**
  - **Validates: Requirements 1.1, 1.3, 8.3, 8.4**
  - Test baseURL is set to staging API
  - Test no production URLs in configuration
  - **Property 2: GitHub provider support**
  - **Validates: Requirements 1.4**
  - Test signIn.social method exists and accepts "github" provider

- [x] 2. Implement sign-in button UI
  - Update `components/login/sign-in.tsx` with GitHub sign-in button
  - Add button with text "Sign in with GitHub"
  - Include GitHub logo/icon on button
  - Use existing Button component from UI library
  - Ensure button follows design system styling
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 2.1 Write unit tests for button rendering
  - **Property 3: Sign-in button presence**
  - **Validates: Requirements 3.1, 3.2**
  - Test button renders with correct text
  - Test GitHub icon is present in button

- [x] 3. Implement OAuth flow initiation
  - Add click handler to sign-in button
  - Call `authClient.signIn.social({ provider: "github" })` on click
  - Import authClient from `lib/auth-client.ts`
  - _Requirements: 3.3, 4.1, 4.2_

- [ ]* 3.1 Write unit tests for OAuth initiation
  - **Property 4: OAuth flow initiation**
  - **Validates: Requirements 3.3, 4.1, 4.2**
  - Mock authClient.signIn.social
  - Test method is called with provider "github" on button click

- [x] 4. Implement loading state management
  - Add loading state using useState hook
  - Set loading to true when button is clicked
  - Disable button when loading is true
  - Add loading indicator (spinner or text) when loading
  - Reset loading state after OAuth completes or fails
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 4.1 Write unit tests for loading state
  - **Property 5: Loading state activation**
  - **Validates: Requirements 5.1**
  - Test loading state becomes true on button click
  - **Property 6: Button disabled during loading**
  - **Validates: Requirements 5.2, 5.5**
  - Test button is disabled when loading is true
  - **Property 7: Loading indicator display**
  - **Validates: Requirements 5.3**
  - Test loading indicator appears when loading is true
  - **Property 8: Loading state reset**
  - **Validates: Requirements 5.4**
  - Test loading state resets after OAuth completes or errors

- [x] 5. Implement error handling
  - Add error state using useState hook
  - Wrap OAuth call in try-catch block
  - Catch errors and set error state with message
  - Use getErrorMessage utility for user-friendly messages
  - Reset loading state in finally block
  - Re-enable button after error
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 5.1 Write unit tests for error handling
  - **Property 9: Error catching**
  - **Validates: Requirements 6.1**
  - Test errors are caught and don't crash component
  - **Property 10: Error message display**
  - **Validates: Requirements 6.2, 6.3**
  - Test error message displays in UI when error occurs
  - **Property 11: Button re-enabled after error**
  - **Validates: Requirements 6.4**
  - Test button is re-enabled after error

- [x] 6. Implement error message display UI
  - Add conditional rendering for error message below button
  - Display error text from error state
  - Style error message for visibility (red text or alert component)
  - Clear error message when user retries sign-in
  - _Requirements: 6.2, 6.3_

- [ ]* 6.1 Write unit tests for error UI
  - Test error message is visible in DOM when error state exists
  - Test error message is not visible when no error
  - Test error clears on retry

- [x] 7. Handle specific error types
  - Implement error categorization logic
  - Handle popup blocked errors with specific message
  - Handle OAuth failure errors with specific message
  - Handle network errors with specific message
  - Update getErrorMessage utility if needed
  - _Requirements: 6.5, 6.6, 6.7_

- [ ]* 7.1 Write unit tests for specific error types
  - **Edge Case 1: Popup blocked error**
  - **Validates: Requirements 6.5**
  - Test popup blocked error shows correct message
  - **Edge Case 2: OAuth failure error**
  - **Validates: Requirements 6.6**
  - Test OAuth failure shows correct message
  - **Edge Case 3: Network error**
  - **Validates: Requirements 6.7**
  - Test network error shows correct message

- [x] 8. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Fix any failing tests
  - Ensure code compiles without TypeScript errors
  - Ask the user if questions arise

- [ ] 9. Manual end-to-end testing
  - Test complete OAuth flow on staging
  - Verify redirect to GitHub works
  - Verify redirect back to app works
  - Verify session persists on page refresh
  - Verify loading states display correctly
  - Verify error handling works for various scenarios
  - Verify no production URLs in network requests
  - Verify no secrets exposed in client code
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2_

- [ ] 10. Code cleanup and final review
  - Remove unused imports and variables
  - Add TypeScript types where needed
  - Ensure code follows React best practices
  - Verify error handling is reusable
  - Add code comments for complex logic
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The checkpoint (task 8) ensures incremental validation
- Manual testing (task 9) verifies end-to-end functionality
- Better Auth handles session persistence automatically (no custom implementation needed)
- OAuth callback is handled by staging API (no client-side callback implementation needed)
- Focus on client-side implementation only (staging API already configured)
