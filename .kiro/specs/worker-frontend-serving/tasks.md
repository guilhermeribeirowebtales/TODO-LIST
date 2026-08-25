# Implementation Plan: Worker Frontend Serving

## Overview

Restructure the Cloudflare Worker to properly serve the Vue.js frontend as static assets while maintaining the `/login` API endpoint. The key changes are: fix the Vite build output path, enforce correct route ordering (API → static → SPA fallback), and set up the testing infrastructure with property-based tests for the authentication and routing logic.

## Tasks

- [x] 1. Fix Vite build configuration and verify asset output
  - [x] 1.1 Fix the `outDir` typo in `frontend/vite.config.js`
    - Change `otuDir: '../dist'` to `outDir: '../dist'` so Vite outputs compiled assets to the Worker project root's `dist/` directory
    - Verify the `emptyOutDir: true` setting is correct
    - _Requirements: 5.1_

  - [x] 1.2 Add `.gitignore` entry for the root `dist/` directory
    - Ensure the built assets in `dist/` are not committed to version control
    - _Requirements: 5.1_

- [x] 2. Restructure Worker routing for correct request handling order
  - [x] 2.1 Refactor `src/index.ts` to enforce API-first route ordering
    - Remove the existing `app.get('/', ...)` plain text handler
    - Ensure `POST /login` is registered before the static asset catch-all
    - Ensure `app.get("/*", serveStatic())` comes after all API routes
    - Ensure the `app.notFound` SPA fallback serves `index.html` with HTTP 200
    - _Requirements: 1.1, 2.1, 2.2, 4.1, 4.2_

  - [x] 2.2 Update CORS middleware configuration
    - Keep CORS configured for `http://localhost:5173` for local development
    - Ensure CORS applies to all routes including OPTIONS preflight
    - _Requirements: 6.1, 6.2_

  - [x] 2.3 Validate the login handler implementation
    - Confirm credential matching against `users.json` uses exact match on both username and password
    - Confirm JWT payload includes `username` and `exp` (current time + 7200 seconds)
    - Confirm JWT is signed with `SECRET_KEY` from environment bindings
    - Confirm 401 response with `{ "error": "Invalid credentials" }` on mismatch
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Checkpoint - Verify build and routing
  - Ensure the frontend builds successfully to `dist/` at the project root with `npm run build:frontend`. Ensure all tests pass, ask the user if questions arise.

- [x] 4. Set up testing infrastructure
  - [x] 4.1 Install test dependencies and configure Vitest
    - Add `vitest`, `fast-check`, and `@cloudflare/vitest-pool-workers` (or equivalent) as dev dependencies
    - Create `vitest.config.ts` at the project root
    - Add a `test` script to `package.json`
    - _Requirements: 3.1, 3.2_

  - [ ]* 4.2 Write property test: Valid credentials always produce a verifiable JWT (Property 1)
    - **Property 1: Valid credentials always produce a verifiable JWT**
    - Generate random selections from the user store; submit to `POST /login`; verify response is 200 with a JWT that decodes to the correct `username` and valid `exp`
    - **Validates: Requirements 3.1, 3.3, 3.4**

  - [ ]* 4.3 Write property test: Invalid credentials always produce 401 (Property 2)
    - **Property 2: Invalid credentials always produce 401**
    - Generate arbitrary string pairs filtered to exclude valid user store entries; submit to `POST /login`; verify response is 401 with JSON `error` field
    - **Validates: Requirements 3.2**

  - [ ]* 4.4 Write property test: API routes take precedence over static asset serving (Property 3)
    - **Property 3: API routes take precedence over static asset serving**
    - Generate requests matching API route patterns; verify they are processed as API calls and never return static asset content
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 4.5 Write property test: Non-API, non-asset paths always receive index.html (Property 4)
    - **Property 4: Non-API, non-asset paths always receive index.html**
    - Generate random URL paths that don't match known static files or API routes; verify response is `index.html` with HTTP 200
    - **Validates: Requirements 2.1, 2.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wire everything together and validate deployment readiness
  - [x] 6.1 Verify `wrangler.toml` configuration matches the design
    - Confirm `[assets]` has `directory = "./dist"` and `binding = "ASSETS"`
    - Confirm `main = "src/index.ts"`
    - _Requirements: 1.2, 1.3, 5.2_

  - [x] 6.2 Verify deploy script runs end-to-end
    - Ensure `npm run deploy` builds the frontend and then deploys the Worker with assets
    - Validate with `wrangler deploy --dry-run` that both Worker code and `dist/` assets are packaged
    - _Requirements: 5.1, 5.2_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The TypeScript implementation uses Hono framework patterns already established in the codebase
- The `fast-check` library is used for property-based testing as specified in the design

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "4.5"] },
    { "id": 4, "tasks": ["6.1", "6.2"] }
  ]
}
```
