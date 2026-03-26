# Business Management Dashboard

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Login page with username/password form
- Role-based access: Admin, Operator, Employee
- Simple dashboard page after login showing role-specific welcome and basic stats
- Logout functionality

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Use `authorization` component for role-based access control
2. Backend: user registration/login with roles stored, seed demo accounts for each role
3. Frontend: Login page → Dashboard page with sidebar, role badge, and simple stat cards
4. Role-specific content: Admin sees all stats, Operator sees limited stats, Employee sees personal info
