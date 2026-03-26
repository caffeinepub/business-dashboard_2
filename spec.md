# Business Dashboard

## Current State
Full-stack app with login, user management (CRUD), role-based access (superAdmin, admin, dataOperator, employee), settings/password change. Backend: Motoko with authenticate, listUsers, createUser, updateUser, deleteUser, changePassword, resetPassword, initializeDefaults.

## Requested Changes (Diff)

### Add
- Employee Management module: add, edit, delete, list employees
- Employee fields: name (Text), phone (Text), role (Text - job title), salary (Nat)
- Backend: EmployeeRecord type, addEmployee, updateEmployee, deleteEmployee, listEmployees functions
- Frontend: "Employee Management" page accessible to superAdmin, admin, dataOperator; employees can view only
- Nav link for Employee Management in sidebar

### Modify
- backend main.mo: add Employee state and CRUD functions
- backend.d.ts: add EmployeeInfo interface and new function signatures
- App.tsx: add EmployeeManagementPage component and nav link

### Remove
- Nothing removed

## Implementation Plan
1. Add EmployeeRecord/EmployeeInfo types to backend, auto-increment ID
2. Add listEmployees (authenticated), addEmployee, updateEmployee, deleteEmployee (admin/dataOperator+)
3. Update backend.d.ts with EmployeeInfo and new methods
4. Add EmployeeManagementPage to App.tsx with table, add/edit/delete dialogs
5. Add "Employees" nav item visible to superAdmin, admin, dataOperator
