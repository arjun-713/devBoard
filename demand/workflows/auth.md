# Workflow: Implement JWT Auth

## When to use
When building or debugging the auth system — register, login, token refresh, protected routes.

## Steps

### 1. Backend — User model + routes
- Create `User.model.ts` with fields: `email`, `passwordHash`, `refreshToken[]`
- Hash password with `bcrypt` (saltRounds: 12) before saving
- POST `/auth/register` → validate → hash → save → return tokens
- POST `/auth/login` → find user → compare hash → return tokens
- POST `/auth/refresh` → verify refreshToken → issue new accessToken
- POST `/auth/logout` → remove refreshToken from DB

### 2. Token generation util
```ts
// utils/tokens.ts
generateAccessToken(userId)  → jwt.sign({ id }, ACCESS_SECRET, { expiresIn: '15m' })
generateRefreshToken(userId) → jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' })
```

### 3. Auth middleware
```ts
// middleware/auth.middleware.ts
// Extract Bearer token → verify → attach req.user = { id }
// Return 401 if missing/invalid, 403 if expired
```

### 4. Frontend — Axios interceptor (api/client.ts)
```ts
// Response interceptor:
// On 401 → call POST /auth/refresh with refreshToken (stored in localStorage)
// On success → update accessToken in store → retry original request
// On failure → dispatch logout() → redirect to /login
```

### 5. Redux auth slice
```ts
// authSlice.ts
// State: { user, accessToken, status: 'idle' | 'loading' | 'failed' }
// Thunks: loginThunk, registerThunk, logoutThunk, refreshThunk
// Persist accessToken to localStorage on fulfilled
```

### 6. Protected routes
```tsx
// PrivateRoute.tsx
// Read isAuthenticated from useAuth()
// If false → <Navigate to="/login" replace />
// Wrap Dashboard route with this
```

## Done when
- Register → Login → access protected route → wait 15min → silent refresh → still logged in
- Logout clears both tokens from DB and localStorage