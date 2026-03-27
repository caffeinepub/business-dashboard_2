# Business Dashboard

## Current State
Full-stack app with: login, user management (CRUD + password), employee management, CRM/inquiry management, dashboard stats. Attendance sidebar link exists but no attendance logic.

## Requested Changes (Diff)

### Add
- `AttendanceRecord` type: `{ id, employeeId, employeeName, date, checkIn, checkOut, status }`
- `AttendanceStatus`: `#present | #absent | #checkedIn`
- Backend functions: `checkIn`, `checkOut`, `getAttendanceByDate`, `getEmployeeAttendance`, `getAllAttendance`, `markAbsentForDate`
- Frontend Attendance page for employees: Check In / Check Out buttons, today's status card
- Frontend Admin Attendance panel: view all records, filter by date, monthly report tab

### Modify
- `main.mo`: add attendance state and APIs
- `backend.d.ts`: add attendance types and function signatures
- `App.tsx`: wire Attendance sidebar item to real attendance UI

### Remove
- Nothing removed

## Implementation Plan
1. Add `AttendanceRecord`, `AttendanceStatus` types and state to `main.mo`
2. Implement `checkIn`, `checkOut`, `getAttendanceByDate`, `getEmployeeAttendance`, `getAllAttendance` in `main.mo`
3. Update `backend.d.ts` with attendance types and signatures
4. Build `AttendancePage` component in `App.tsx` (employee + admin views)
5. Wire the Attendance sidebar menu item to the new page
