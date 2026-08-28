# Requirements Document

## Introduction

This feature establishes the Cloudflare Worker as the single entry point for the TODO List application. The Worker serves the Vue.js frontend as static assets to users and exposes a `/login` API endpoint that authenticates users and returns a JWT token. The flow is: user accesses the Worker URL → Worker delivers the SPA frontend → frontend calls `/login` to obtain a JWT → frontend uses the JWT for subsequent authenticated requests.

## Glossary

- **Worker**: The Cloudflare Worker application that handles all incoming HTTP requests, serving both static assets and API endpoints.
- **Frontend**: The Vue.js single-page application (SPA) built with Vite, compiled into static assets (HTML, JS, CSS) in the `dist` directory.
- **JWT**: A JSON Web Token issued by the Worker upon successful authentication, used by the Frontend to authorize subsequent API requests.
- **User_Store**: The JSON-based credential store (`users.json`) containing user records with username, password, name, and role.
- **SPA_Router**: The client-side Vue Router that manages navigation within the Frontend without full page reloads.

## Requirements

### Requirement 1: Serve Frontend Static Assets

**User Story:** As a user, I want to access the TODO List application by navigating to the Worker URL, so that I can use the frontend without a separate hosting service.

#### Acceptance Criteria

1. WHEN a user requests the root path `/`, THE Worker SHALL respond with the Frontend `index.html` file.
2. WHEN a user requests a static asset path (JS, CSS, images, fonts), THE Worker SHALL respond with the corresponding file from the `dist` directory.
3. WHEN a user requests a static asset that exists in the `dist` directory, THE Worker SHALL include the correct `Content-Type` header in the response.

### Requirement 2: Support SPA Client-Side Routing

**User Story:** As a user, I want to navigate directly to any route in the application (e.g., `/tasks`, `/login`) and still see the correct page, so that bookmarks and page refreshes work properly.

#### Acceptance Criteria

1. WHEN a user requests a path that does not match a known API route or static asset, THE Worker SHALL respond with the Frontend `index.html` file to allow the SPA_Router to handle navigation.
2. WHEN the Worker serves `index.html` as a fallback, THE Worker SHALL return HTTP status 200.

### Requirement 3: Authenticate Users via Login Endpoint

**User Story:** As a user, I want to submit my credentials to the `/login` endpoint and receive a JWT, so that I can access protected resources in the application.

#### Acceptance Criteria

1. WHEN a POST request is received at `/login` with a valid username and password matching a record in the User_Store, THE Worker SHALL respond with a JSON body containing a signed JWT.
2. WHEN a POST request is received at `/login` with credentials that do not match any record in the User_Store, THE Worker SHALL respond with HTTP status 401 and a JSON error message.
3. THE Worker SHALL sign the JWT using a secret key stored as an environment variable (`SECRET_KEY`).
4. WHEN a JWT is issued, THE Worker SHALL include the `username` claim and an `exp` claim set to 2 hours from the time of issuance.

### Requirement 4: Separate API Routes from Asset Serving

**User Story:** As a developer, I want API routes to be clearly separated from static asset serving, so that API requests are never accidentally served as frontend pages.

#### Acceptance Criteria

1. WHEN a POST request is received at `/login`, THE Worker SHALL process the request as an API call and NOT serve static assets.
2. THE Worker SHALL evaluate API route matching before static asset fallback logic.

### Requirement 5: Build Pipeline Produces Deployable Assets

**User Story:** As a developer, I want a single build command that compiles the Frontend and prepares it for the Worker to serve, so that deployments are simple and repeatable.

#### Acceptance Criteria

1. WHEN the `build:frontend` script is executed, THE Worker project SHALL contain the compiled Frontend assets in the `dist` directory at the project root.
2. WHEN the `deploy` script is executed, THE Worker project SHALL first build the Frontend and then deploy the Worker with the compiled assets.

### Requirement 6: CORS Configuration for Local Development

**User Story:** As a developer, I want the Worker to allow cross-origin requests from the local Vite development server, so that I can develop the frontend locally while calling the Worker API.

#### Acceptance Criteria

1. WHILE the Worker is running in development mode, THE Worker SHALL accept cross-origin requests from `http://localhost:5173`.
2. WHEN a preflight OPTIONS request is received, THE Worker SHALL respond with the appropriate CORS headers including `Content-Type` and `Authorization` in `Access-Control-Allow-Headers`.
