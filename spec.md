# Business Dashboard

## Current State
- Login system with 4 roles: Super Admin, Admin, Data Operator, Employee
- User management (CRUD, password reset)
- Employee management (CRUD: name, phone, role, salary)
- All features connected to backend with session-based auth (username/password passed per call)

## Requested Changes (Diff)

### Add
- CRM module: Customer Inquiries
  - Fields: id, name, phone, requirement, status (New | Follow-up | Closed), createdAt (timestamp)
  - Backend: addInquiry, listInquiries, updateInquiryStatus, deleteInquiry
  - Frontend: "CRM" sidebar item, inquiry list table, add inquiry form/dialog, status badge, status update action

### Modify
- App.tsx: add CRM page/section to the sidebar and routing

### Remove
- Nothing removed

## Implementation Plan
1. Add InquiryStatus variant and InquiryInfo type to backend
2. Add inquiry Map and nextInquiryId counter to backend state
3. Implement addInquiry, listInquiries, updateInquiryStatus, deleteInquiry backend functions
4. Update frontend: add CRM page with inquiry list, add inquiry dialog, status badges, update/delete actions
