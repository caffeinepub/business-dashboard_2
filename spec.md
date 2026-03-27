# Business Dashboard

## Current State
- Full backend with user management, employees, attendance, CRM
- Login page with username/password
- Admin panel (UserManagementPage) already has admin-initiated reset password (requires admin auth)
- No self-service password reset flow exists

## Requested Changes (Diff)

### Add
- Backend: `resetPasswordByPhone(username, phone, newPassword)` — public function, validates username+phone match, min 8 chars, resets password
- Frontend: "Forgot Password" link on login page
- Frontend: ForgotPassword modal/view — step 1: enter username+phone; step 2: enter new password (if matched)
- Password min 8 chars validation on reset form
- Success message after reset

### Modify
- `backend.d.ts`: add `resetPasswordByPhone` signature
- Login page: add "Forgot Password" button below sign-in form
- Admin panel reset password dialog: already exists and works, no change needed

### Remove
- Nothing removed

## Implementation Plan
1. Add `resetPasswordByPhone` to `src/backend/main.mo`
2. Add `resetPasswordByPhone` to `src/frontend/src/backend.d.ts`
3. Add forgot password UI to login page in `src/frontend/src/App.tsx` (modal with 2 steps)
