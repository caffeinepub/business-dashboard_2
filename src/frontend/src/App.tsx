import { type UserInfo, UserRole } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Pencil,
  Settings,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ── Role helpers ────────────────────────────────────────────────────────────
function roleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.superAdmin:
      return "Super Admin";
    case UserRole.admin:
      return "Admin";
    case UserRole.dataOperator:
      return "Data Operator";
    case UserRole.employee:
      return "Employee";
  }
}

function roleBadgeVariant(role: UserRole): string {
  switch (role) {
    case UserRole.superAdmin:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case UserRole.admin:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case UserRole.dataOperator:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case UserRole.employee:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeVariant(role)}`}
    >
      {roleLabel(role)}
    </span>
  );
}

const ALL_ROLES: UserRole[] = [
  UserRole.superAdmin,
  UserRole.admin,
  UserRole.dataOperator,
  UserRole.employee,
];

// ── Session ─────────────────────────────────────────────────────────────────
interface Session {
  userInfo: UserInfo;
  password: string;
}

type Page =
  | "dashboard"
  | "users"
  | "settings"
  | "employees"
  | "crm"
  | "attendance"
  | "reports";

// ── Employee types ───────────────────────────────────────────────────────────
interface EmployeeInfo {
  id: bigint;
  name: string;
  phone: string;
  role: string;
  salary: bigint;
}

// ── CRM types ───────────────────────────────────────────────────────────────
type InquiryStatus = { new_: null } | { followUp: null } | { closed: null };

interface InquiryInfo {
  id: bigint;
  name: string;
  phone: string;
  requirement: string;
  status: InquiryStatus;
  createdAt: bigint;
}

function inquiryStatusLabel(status: InquiryStatus): string {
  if ("new_" in status) return "New";
  if ("followUp" in status) return "Follow-up";
  return "Closed";
}

function inquiryStatusClass(status: InquiryStatus): string {
  if ("new_" in status)
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if ("followUp" in status)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${inquiryStatusClass(status)}`}
    >
      {inquiryStatusLabel(status)}
    </span>
  );
}

function statusKey(status: InquiryStatus): string {
  if ("new_" in status) return "new_";
  if ("followUp" in status) return "followUp";
  return "closed";
}

function statusFromKey(key: string): InquiryStatus {
  if (key === "new_") return { new_: null };
  if (key === "followUp") return { followUp: null };
  return { closed: null };
}

// ── Login Page ───────────────────────────────────────────────────────────────

// ── Attendance types ─────────────────────────────────────────────────────────
type AttendanceStatus =
  | { present: null }
  | { absent: null }
  | { checkedIn: null };

interface AttendanceRecord {
  id: bigint;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: [] | [bigint];
  checkOut: [] | [bigint];
  status: AttendanceStatus;
}

function attendanceStatusLabel(s: AttendanceStatus): string {
  if ("present" in s) return "Present";
  if ("checkedIn" in s) return "Checked In";
  return "Absent";
}

function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  let cls = "";
  let label = attendanceStatusLabel(status);
  if ("present" in status)
    cls = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  else if ("checkedIn" in status)
    cls =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  else cls = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function fmtTime(ts: [] | [bigint] | bigint | null | undefined): string {
  if (ts === null || ts === undefined) return "—";
  let val: bigint | null = null;
  if (typeof ts === "bigint") val = ts;
  else if (Array.isArray(ts) && ts.length > 0) val = ts[0] ?? null;
  if (val === null) return "—";
  return new Date(Number(val) / 1_000_000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isAdmin(role: UserRole): boolean {
  return (
    role === UserRole.superAdmin ||
    role === UserRole.admin ||
    role === UserRole.dataOperator
  );
}

// ── Attendance Page ───────────────────────────────────────────────────────────
function AttendancePage({ session }: { session: Session }) {
  const { actor } = useActor();
  const today = getToday();

  // My attendance state
  const [myRecord, setMyRecord] = useState<AttendanceRecord | null>(null);
  const [myLoading, setMyLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Admin state
  const [adminTab, setAdminTab] = useState<"daily" | "monthly">("daily");
  const [filterDate, setFilterDate] = useState(today);
  const [dailyRecords, setDailyRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [markingAbsent, setMarkingAbsent] = useState<string | null>(null);

  const admin = isAdmin(session.userInfo.role);

  const loadMyRecord = useCallback(async () => {
    if (!actor) return;
    setMyLoading(true);
    try {
      const result = await (actor as any).getMyAttendance(
        session.userInfo.username,
        session.password,
        today,
      );
      setMyRecord(
        Array.isArray(result)
          ? result.length > 0
            ? result[0]
            : null
          : (result ?? null),
      );
    } catch {
      // no record yet
    } finally {
      setMyLoading(false);
    }
  }, [actor, session, today]);

  const loadDailyRecords = useCallback(
    async (date: string) => {
      if (!actor) return;
      setAdminLoading(true);
      try {
        const list = await (actor as any).getAttendanceByDate(
          session.userInfo.username,
          session.password,
          date,
        );
        setDailyRecords(list);
      } catch {
        toast.error("Failed to load attendance records");
      } finally {
        setAdminLoading(false);
      }
    },
    [actor, session],
  );

  const loadMonthlyRecords = useCallback(async () => {
    if (!actor) return;
    setAdminLoading(true);
    try {
      const list = await (actor as any).getAllAttendance(
        session.userInfo.username,
        session.password,
      );
      setMonthlyRecords(list);
    } catch {
      toast.error("Failed to load monthly attendance");
    } finally {
      setAdminLoading(false);
    }
  }, [actor, session]);

  useEffect(() => {
    loadMyRecord();
  }, [loadMyRecord]);
  useEffect(() => {
    if (admin) {
      loadDailyRecords(today);
      loadMonthlyRecords();
    }
  }, [admin, loadDailyRecords, loadMonthlyRecords, today]);

  const handleCheckIn = async () => {
    if (!actor) return;
    setCheckingIn(true);
    try {
      const rec = await (actor as any).checkIn(
        session.userInfo.username,
        session.password,
        today,
      );
      setMyRecord(rec);
      toast.success("Checked in successfully!");
      if (admin) loadDailyRecords(filterDate);
    } catch (e: any) {
      toast.error(e?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!actor) return;
    setCheckingOut(true);
    try {
      const rec = await (actor as any).checkOut(
        session.userInfo.username,
        session.password,
        today,
      );
      setMyRecord(rec);
      toast.success("Checked out successfully!");
      if (admin) loadDailyRecords(filterDate);
    } catch (e: any) {
      toast.error(e?.message || "Check-out failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleMarkAbsent = async (
    employeeId: string,
    employeeName: string,
    date: string,
  ) => {
    if (!actor) return;
    setMarkingAbsent(employeeId);
    try {
      await (actor as any).markAbsent(
        session.userInfo.username,
        session.password,
        employeeId,
        employeeName,
        date,
      );
      toast.success(`${employeeName} marked as absent`);
      loadDailyRecords(date);
    } catch (e: any) {
      toast.error(e?.message || "Failed to mark absent");
    } finally {
      setMarkingAbsent(null);
    }
  };

  const checkedIn = myRecord && "checkedIn" in myRecord.status;
  const alreadyPresent = myRecord && "present" in myRecord.status;
  const canCheckIn = !myRecord || "absent" in myRecord.status;
  const canCheckOut = checkedIn;

  // Monthly report: group by employee for current month
  const currentMonth = today.substring(0, 7);
  const monthFiltered = monthlyRecords.filter((r) =>
    r.date.startsWith(currentMonth),
  );
  const employeeMonthMap: Record<
    string,
    { name: string; present: number; absent: number; checkedIn: number }
  > = {};
  for (const r of monthFiltered) {
    if (!employeeMonthMap[r.employeeId]) {
      employeeMonthMap[r.employeeId] = {
        name: r.employeeName,
        present: 0,
        absent: 0,
        checkedIn: 0,
      };
    }
    if ("present" in r.status) employeeMonthMap[r.employeeId].present++;
    else if ("absent" in r.status) employeeMonthMap[r.employeeId].absent++;
    else employeeMonthMap[r.employeeId].checkedIn++;
  }
  const monthlyRows = Object.entries(employeeMonthMap);

  return (
    <div className="space-y-6" data-ocid="attendance.page">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">
          Track your check-in and check-out
        </p>
      </div>

      {/* Today's Status Card */}
      <Card data-ocid="attendance.today.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Today —{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myLoading ? (
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-ocid="attendance.today.loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {myRecord ? (
                    <AttendanceStatusBadge status={myRecord.status} />
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Not Recorded
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check In</p>
                  <p className="font-semibold">
                    {myRecord ? fmtTime(myRecord.checkIn) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Check Out
                  </p>
                  <p className="font-semibold">
                    {myRecord ? fmtTime(myRecord.checkOut) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  data-ocid="attendance.checkin.button"
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || checkingIn || !!alreadyPresent}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {checkingIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Check In
                </Button>
                <Button
                  data-ocid="attendance.checkout.button"
                  onClick={handleCheckOut}
                  disabled={!canCheckOut || checkingOut}
                  variant="outline"
                >
                  {checkingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Check Out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {admin && (
        <div className="space-y-4" data-ocid="attendance.admin.panel">
          <div className="flex gap-2 border-b border-border">
            <button
              type="button"
              data-ocid="attendance.daily.tab"
              onClick={() => setAdminTab("daily")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${adminTab === "daily" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Daily View
            </button>
            <button
              type="button"
              data-ocid="attendance.monthly.tab"
              onClick={() => setAdminTab("monthly")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${adminTab === "monthly" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Monthly Report
            </button>
          </div>

          {adminTab === "daily" && (
            <Card data-ocid="attendance.daily.card">
              <CardHeader>
                <CardTitle>Attendance by Date</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Input
                    data-ocid="attendance.date.input"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-44"
                  />
                  <Button
                    data-ocid="attendance.filter.button"
                    onClick={() => loadDailyRecords(filterDate)}
                    variant="outline"
                    size="sm"
                  >
                    Load
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {adminLoading ? (
                  <div
                    className="flex items-center gap-2 text-muted-foreground py-4"
                    data-ocid="attendance.daily.loading_state"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : dailyRecords.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="attendance.daily.empty_state"
                  >
                    No records for this date.
                  </div>
                ) : (
                  <Table data-ocid="attendance.daily.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyRecords.map((r, idx) => (
                        <TableRow
                          key={String(r.id)}
                          data-ocid={`attendance.daily.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {r.employeeName}
                          </TableCell>
                          <TableCell>{fmtTime(r.checkIn)}</TableCell>
                          <TableCell>{fmtTime(r.checkOut)}</TableCell>
                          <TableCell>
                            <AttendanceStatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>
                            {"absent" in r.status && (
                              <Button
                                data-ocid={`attendance.mark_absent.button.${idx + 1}`}
                                size="sm"
                                variant="outline"
                                disabled={markingAbsent === r.employeeId}
                                onClick={() =>
                                  handleMarkAbsent(
                                    r.employeeId,
                                    r.employeeName,
                                    filterDate,
                                  )
                                }
                              >
                                {markingAbsent === r.employeeId ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Mark Absent
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {adminTab === "monthly" && (
            <Card data-ocid="attendance.monthly.card">
              <CardHeader>
                <CardTitle>
                  Monthly Report —{" "}
                  {new Date().toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {adminLoading ? (
                  <div
                    className="flex items-center gap-2 text-muted-foreground py-4"
                    data-ocid="attendance.monthly.loading_state"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : monthlyRows.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="attendance.monthly.empty_state"
                  >
                    No attendance records for this month.
                  </div>
                ) : (
                  <Table data-ocid="attendance.monthly.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Checked In</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Total Days</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyRows.map(([empId, data], idx) => (
                        <TableRow
                          key={empId}
                          data-ocid={`attendance.monthly.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {data.name}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {data.present}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              {data.checkedIn}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {data.absent}
                            </span>
                          </TableCell>
                          <TableCell>
                            {data.present + data.checkedIn + data.absent}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reports Placeholder Page ──────────────────────────────────────────────────
function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Business analytics and insights</p>
      </div>
      <Card
        data-ocid="reports.coming_soon.card"
        className="flex flex-col items-center justify-center py-16"
      >
        <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Detailed reports on employees, attendance, and CRM leads will be
          available soon.
        </p>
      </Card>
    </div>
  );
}

// ── Password strength helpers ────────────────────────────────────────────────
function validatePassword(pw: string): {
  hasLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  return {
    hasLength: pw.length >= 8,
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[!@#$%^&*()\-_=+[\]{};:\'",.<>?/\\|`~]/.test(pw),
  };
}
function isPasswordStrong(pw: string): boolean {
  const v = validatePassword(pw);
  return v.hasLength && v.hasNumber && v.hasSpecial;
}

function PasswordStrengthChecklist({ password }: { password: string }) {
  const v = validatePassword(password);
  const rules = [
    { label: "At least 8 characters", met: v.hasLength },
    { label: "Contains a number (0-9)", met: v.hasNumber },
    { label: "Contains a special character (!@#$%...)", met: v.hasSpecial },
  ];
  return (
    <ul className="space-y-1 mt-2">
      {rules.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-2 text-xs ${r.met ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
        >
          {r.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          {r.label}
        </li>
      ))}
    </ul>
  );
}

function LoginPage({ onLogin }: { onLogin: (session: Session) => void }) {
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor
      .initializeDefaults()
      .catch((e) => console.error("initializeDefaults error:", e));
  }, [actor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setError("");
    setSubmitting(true);
    try {
      console.log("[login] attempting:", { username });
      const result = await actor.authenticate(username, password);
      console.log("[login] result:", result);
      if (result) {
        onLogin({ userInfo: result, password });
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("[login] error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = isFetching || submitting || !actor;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Business Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-ocid="login.input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-ocid="login.password_input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p
                  data-ocid="login.error_state"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                data-ocid="login.submit_button"
                type="submit"
                className="w-full"
                disabled={isDisabled}
              >
                {submitting || isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isFetching
                  ? "Connecting..."
                  : submitting
                    ? "Signing in..."
                    : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Force Change Password Page ───────────────────────────────────────────────
function ForceChangePasswordPage({
  session,
  onSuccess,
}: {
  session: Session;
  onSuccess: (newPassword: string) => void;
}) {
  const { actor } = useActor();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // v used via PasswordStrengthChecklist
  const allRulesMet = isPasswordStrong(newPw);
  const passwordsMatch = newPw.length > 0 && newPw === confirmPw;
  const canSubmit = allRulesMet && passwordsMatch && currentPw.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !canSubmit) return;
    setError("");
    setSaving(true);
    try {
      await actor.changePassword(session.userInfo.username, currentPw, newPw);
      onSuccess(newPw);
    } catch (e: any) {
      setError(e?.message || "Current password is incorrect");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Set Your Password
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            You must set a new password before continuing.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  data-ocid="force_change.current_password.input"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  data-ocid="force_change.new_password.input"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                  required
                />
                {newPw.length > 0 && (
                  <PasswordStrengthChecklist password={newPw} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  data-ocid="force_change.confirm_password.input"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  required
                />
                {confirmPw.length > 0 && (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                  >
                    {passwordsMatch ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>
              {error && (
                <p
                  data-ocid="force_change.error_state"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                data-ocid="force_change.submit_button"
                type="submit"
                className="w-full"
                disabled={!canSubmit || saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Set Password & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sidebar / Nav ────────────────────────────────────────────────────────────
function NavLinks({
  page,
  session,
  onNavigate,
  onLogout,
  onClose,
}: {
  page: Page;
  session: Session;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  const canManageUsers =
    session.userInfo.role === UserRole.superAdmin ||
    session.userInfo.role === UserRole.admin;

  const navItem = (p: Page, label: string, Icon: React.ElementType) => (
    <button
      key={p}
      data-ocid={`nav.${p}.link`}
      type="button"
      onClick={() => {
        onNavigate(p);
        onClose?.();
      }}
      className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        page === p
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-4">
        <h2 className="text-lg font-bold text-sidebar-foreground mb-1">
          Business Dashboard
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {session.userInfo.name}
            </span>
            <RoleBadge role={session.userInfo.role} />
          </div>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItem("dashboard", "Dashboard", LayoutDashboard)}
        {canManageUsers && navItem("users", "User Management", Users)}
        {navItem("employees", "Employees", Briefcase)}
        {navItem("attendance", "Attendance", CalendarCheck)}
        {navItem("crm", "CRM", MessageSquare)}
        {navItem("reports", "Reports", BarChart2)}
        {navItem("settings", "Settings", Settings)}
      </nav>
      <Separator className="bg-sidebar-border" />
      <div className="px-3 py-4">
        <button
          data-ocid="nav.logout.button"
          type="button"
          onClick={() => {
            onLogout();
            onClose?.();
          }}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ session }: { session: Session }) {
  const { actor, isFetching } = useActor();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    setStatsLoading(true);
    Promise.all([
      (actor as any).listEmployees(session.userInfo.username, session.password),
      (actor as any).listInquiries(session.userInfo.username, session.password),
    ])
      .then(([emps, inquiries]: [any[], any[]]) => {
        setEmployeeCount(emps.length);
        setLeadCount(inquiries.length);
      })
      .catch(() => {
        setEmployeeCount(0);
        setLeadCount(0);
      })
      .finally(() => setStatsLoading(false));
  }, [actor, isFetching, session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.userInfo.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card data-ocid="dashboard.employees.card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                data-ocid="dashboard.employees.loading_state"
              />
            ) : (
              <p className="text-3xl font-bold">{employeeCount ?? "—"}</p>
            )}
          </CardContent>
        </Card>
        <Card data-ocid="dashboard.leads.card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                data-ocid="dashboard.leads.loading_state"
              />
            ) : (
              <p className="text-3xl font-bold">{leadCount ?? "—"}</p>
            )}
          </CardContent>
        </Card>
        <Card data-ocid="dashboard.attendance.card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Attendance
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card data-ocid="dashboard.role.card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleBadge role={session.userInfo.role} />
          </CardContent>
        </Card>
        <Card data-ocid="dashboard.username.card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Username
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold font-mono">
              {session.userInfo.username}
            </p>
          </CardContent>
        </Card>
        <Card data-ocid="dashboard.phone.card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {session.userInfo.phone || "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── User Management Page ─────────────────────────────────────────────────────
type UserFormState = {
  name: string;
  username: string;
  password: string;
  phone: string;
  role: UserRole;
};

function defaultUserForm(): UserFormState {
  return {
    name: "",
    username: "",
    password: "",
    phone: "",
    role: UserRole.employee,
  };
}

function UserManagementPage({ session }: { session: Session }) {
  const { actor } = useActor();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [form, setForm] = useState<UserFormState>(defaultUserForm());
  const [editTarget, setEditTarget] = useState<UserInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserInfo | null>(null);
  const [resetTarget, setResetTarget] = useState<UserInfo | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const list = await actor.listUsers(
        session.userInfo.username,
        session.password,
      );
      setUsers(list);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [actor, session]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAdd = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.createUser(
        session.userInfo.username,
        session.password,
        form.username,
        form.password,
        form.name,
        form.phone,
        form.role,
      );
      toast.success("User created successfully");
      setAddOpen(false);
      setForm(defaultUserForm());
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!actor || !editTarget) return;
    setSaving(true);
    try {
      await actor.updateUser(
        session.userInfo.username,
        session.password,
        editTarget.username,
        form.name,
        form.phone,
        form.role,
      );
      toast.success("User updated successfully");
      setEditOpen(false);
      setEditTarget(null);
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !deleteTarget) return;
    setSaving(true);
    try {
      await actor.deleteUser(
        session.userInfo.username,
        session.password,
        deleteTarget.username,
      );
      toast.success("User deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!actor || !resetTarget) return;
    if (resetPassword !== resetConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await actor.resetPassword(
        session.userInfo.username,
        session.password,
        resetTarget.username,
        resetPassword,
      );
      toast.success("Password reset successfully");
      setResetOpen(false);
      setResetTarget(null);
      setResetPassword("");
      setResetConfirm("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button
          data-ocid="users.add.primary_button"
          onClick={() => {
            setForm(defaultUserForm());
            setAddOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <div
          data-ocid="users.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div
          data-ocid="users.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No users found.
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table data-ocid="users.table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, i) => (
                <TableRow key={u.username} data-ocid={`users.item.${i + 1}`}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {u.username}
                  </TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`users.edit_button.${i + 1}`}
                        onClick={() => {
                          setEditTarget(u);
                          setForm({
                            name: u.name,
                            username: u.username,
                            password: "",
                            phone: u.phone,
                            role: u.role,
                          });
                          setEditOpen(true);
                        }}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`users.reset_password.${i + 1}`}
                        onClick={() => {
                          setResetTarget(u);
                          setResetPassword("");
                          setResetConfirm("");
                          setResetOpen(true);
                        }}
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`users.delete_button.${i + 1}`}
                        onClick={() => {
                          setDeleteTarget(u);
                          setDeleteOpen(true);
                        }}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="users.add.dialog">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <UserFormFields form={form} setForm={setForm} showPassword />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="users.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="users.add.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="users.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <UserFormFields form={form} setForm={setForm} readonlyUsername />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="users.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={saving}
              data-ocid="users.edit.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="users.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.username})?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="users.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="users.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent data-ocid="users.reset.dialog">
          <DialogHeader>
            <DialogTitle>Reset Password for {resetTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                data-ocid="users.reset.input"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                data-ocid="users.reset.confirm_input"
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
              data-ocid="users.reset.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={saving}
              data-ocid="users.reset.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserFormFields({
  form,
  setForm,
  showPassword,
  readonlyUsername,
}: {
  form: UserFormState;
  setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  showPassword?: boolean;
  readonlyUsername?: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          data-ocid="users.form.name_input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Full name"
        />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input
          data-ocid="users.form.username_input"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="Username"
          readOnly={readonlyUsername}
          className={readonlyUsername ? "bg-muted" : ""}
        />
      </div>
      {showPassword && (
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            data-ocid="users.form.password_input"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            placeholder="Password"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          data-ocid="users.form.phone_input"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Phone number"
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={form.role}
          onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}
        >
          <SelectTrigger data-ocid="users.form.role_select">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

// ── Employee Management Page ─────────────────────────────────────────────────
type EmployeeFormState = {
  name: string;
  phone: string;
  role: string;
  salary: string;
};

function defaultEmployeeForm(): EmployeeFormState {
  return { name: "", phone: "", role: "", salary: "" };
}

function EmployeeManagementPage({ session }: { session: Session }) {
  const { actor } = useActor();
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState<EmployeeFormState>(defaultEmployeeForm());
  const [editTarget, setEditTarget] = useState<EmployeeInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeInfo | null>(null);
  const [saving, setSaving] = useState(false);

  const canMutate =
    session.userInfo.role === UserRole.superAdmin ||
    session.userInfo.role === UserRole.admin ||
    session.userInfo.role === UserRole.dataOperator;

  const loadEmployees = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const list = await (actor as any).listEmployees(
        session.userInfo.username,
        session.password,
      );
      setEmployees(list);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [actor, session]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleAdd = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      await (actor as any).addEmployee(
        session.userInfo.username,
        session.password,
        form.name,
        form.phone,
        form.role,
        BigInt(form.salary || "0"),
      );
      toast.success("Employee added successfully");
      setAddOpen(false);
      setForm(defaultEmployeeForm());
      await loadEmployees();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add employee");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!actor || !editTarget) return;
    setSaving(true);
    try {
      await (actor as any).updateEmployee(
        session.userInfo.username,
        session.password,
        editTarget.id,
        form.name,
        form.phone,
        form.role,
        BigInt(form.salary || "0"),
      );
      toast.success("Employee updated successfully");
      setEditOpen(false);
      setEditTarget(null);
      await loadEmployees();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !deleteTarget) return;
    setSaving(true);
    try {
      await (actor as any).deleteEmployee(
        session.userInfo.username,
        session.password,
        deleteTarget.id,
      );
      toast.success("Employee deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadEmployees();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            View and manage company employees
          </p>
        </div>
        {canMutate && (
          <Button
            data-ocid="employees.add.primary_button"
            onClick={() => {
              setForm(defaultEmployeeForm());
              setAddOpen(true);
            }}
          >
            Add Employee
          </Button>
        )}
      </div>

      {loading ? (
        <div
          data-ocid="employees.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : employees.length === 0 ? (
        <div
          data-ocid="employees.empty_state"
          className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg"
        >
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No employees yet</p>
          {canMutate && (
            <p className="text-sm mt-1">Click "Add Employee" to get started.</p>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table data-ocid="employees.table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Salary</TableHead>
                {canMutate && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, i) => (
                <TableRow
                  key={String(emp.id)}
                  data-ocid={`employees.item.${i + 1}`}
                >
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.phone || "—"}</TableCell>
                  <TableCell>
                    {emp.role ? (
                      <Badge variant="secondary">{emp.role}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {Number(emp.salary).toLocaleString()}
                  </TableCell>
                  {canMutate && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`employees.edit_button.${i + 1}`}
                          onClick={() => {
                            setEditTarget(emp);
                            setForm({
                              name: emp.name,
                              phone: emp.phone,
                              role: emp.role,
                              salary: String(Number(emp.salary)),
                            });
                            setEditOpen(true);
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`employees.delete_button.${i + 1}`}
                          onClick={() => {
                            setDeleteTarget(emp);
                            setDeleteOpen(true);
                          }}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="employees.add.dialog">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <EmployeeFormFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="employees.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="employees.add.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="employees.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <EmployeeFormFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="employees.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={saving}
              data-ocid="employees.edit.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="employees.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="employees.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmployeeFormFields({
  form,
  setForm,
}: {
  form: EmployeeFormState;
  setForm: React.Dispatch<React.SetStateAction<EmployeeFormState>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          data-ocid="employees.form.name_input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Full name"
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          data-ocid="employees.form.phone_input"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Phone number"
        />
      </div>
      <div className="space-y-2">
        <Label>Job Title / Role</Label>
        <Input
          data-ocid="employees.form.role_input"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="e.g. Software Engineer"
        />
      </div>
      <div className="space-y-2">
        <Label>Salary</Label>
        <Input
          data-ocid="employees.form.salary_input"
          type="number"
          min="0"
          value={form.salary}
          onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
          placeholder="Monthly salary"
        />
      </div>
    </>
  );
}

// ── CRM Page ─────────────────────────────────────────────────────────────────
type InquiryFormState = {
  name: string;
  phone: string;
  requirement: string;
};

function defaultInquiryForm(): InquiryFormState {
  return { name: "", phone: "", requirement: "" };
}

function CRMPage({ session }: { session: Session }) {
  const { actor } = useActor();
  const [inquiries, setInquiries] = useState<InquiryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<InquiryFormState>(defaultInquiryForm());
  const [deleteTarget, setDeleteTarget] = useState<InquiryInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const loadInquiries = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const list = await (actor as any).listInquiries(
        session.userInfo.username,
        session.password,
      );
      setInquiries(list);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [actor, session]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleAdd = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      await (actor as any).addInquiry(
        session.userInfo.username,
        session.password,
        form.name,
        form.phone,
        form.requirement,
      );
      toast.success("Inquiry added successfully");
      setAddOpen(false);
      setForm(defaultInquiryForm());
      await loadInquiries();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add inquiry");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (inq: InquiryInfo, key: string) => {
    if (!actor) return;
    setUpdatingId(inq.id);
    try {
      await (actor as any).updateInquiryStatus(
        session.userInfo.username,
        session.password,
        inq.id,
        statusFromKey(key),
      );
      toast.success("Status updated");
      await loadInquiries();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!actor || !deleteTarget) return;
    setSaving(true);
    try {
      await (actor as any).deleteInquiry(
        session.userInfo.username,
        session.password,
        deleteTarget.id,
      );
      toast.success("Inquiry deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadInquiries();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete inquiry");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and follow-ups
          </p>
        </div>
        <Button
          data-ocid="crm.add.primary_button"
          onClick={() => {
            setForm(defaultInquiryForm());
            setAddOpen(true);
          }}
        >
          Add Inquiry
        </Button>
      </div>

      {loading ? (
        <div
          data-ocid="crm.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : inquiries.length === 0 ? (
        <div
          data-ocid="crm.empty_state"
          className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg"
        >
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No inquiries yet</p>
          <p className="text-sm mt-1">Click "Add Inquiry" to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table data-ocid="crm.table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inq, i) => (
                <TableRow key={String(inq.id)} data-ocid={`crm.item.${i + 1}`}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{inq.name}</TableCell>
                  <TableCell>{inq.phone || "—"}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="block truncate" title={inq.requirement}>
                      {inq.requirement || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {updatingId === inq.id && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                      <Select
                        value={statusKey(inq.status)}
                        onValueChange={(v) => handleStatusChange(inq, v)}
                        disabled={updatingId === inq.id}
                      >
                        <SelectTrigger
                          data-ocid={`crm.status.select.${i + 1}`}
                          className="h-8 w-[130px] text-xs"
                        >
                          <SelectValue>
                            <InquiryStatusBadge status={inq.status} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_">
                            <InquiryStatusBadge status={{ new_: null }} />
                          </SelectItem>
                          <SelectItem value="followUp">
                            <InquiryStatusBadge status={{ followUp: null }} />
                          </SelectItem>
                          <SelectItem value="closed">
                            <InquiryStatusBadge status={{ closed: null }} />
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(inq.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`crm.delete_button.${i + 1}`}
                      onClick={() => {
                        setDeleteTarget(inq);
                        setDeleteOpen(true);
                      }}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Inquiry Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="crm.add.dialog">
          <DialogHeader>
            <DialogTitle>Add New Inquiry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                data-ocid="crm.form.name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                data-ocid="crm.form.phone_input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirement</Label>
              <Textarea
                data-ocid="crm.form.textarea"
                value={form.requirement}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requirement: e.target.value }))
                }
                placeholder="Describe the customer's requirement..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="crm.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="crm.add.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="crm.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the inquiry from{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="crm.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="crm.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ session }: { session: Session }) {
  const { actor } = useActor();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await actor.changePassword(session.userInfo.username, currentPw, newPw);
      toast.success("Password changed successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <Card data-ocid="settings.account.card">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{session.userInfo.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono">{session.userInfo.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span>{session.userInfo.phone || "—"}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Role</span>
            <RoleBadge role={session.userInfo.role} />
          </div>
        </CardContent>
      </Card>

      <Card data-ocid="settings.password.card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                data-ocid="settings.current_password.input"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                data-ocid="settings.new_password.input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
                required
              />
              {newPw.length > 0 && (
                <PasswordStrengthChecklist password={newPw} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                data-ocid="settings.confirm_password.input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPw.length > 0 && (
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${newPw === confirmPw ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                >
                  {newPw === confirmPw ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {newPw === confirmPw
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>
            <Button
              data-ocid="settings.change_password.submit_button"
              type="submit"
              disabled={
                saving || !isPasswordStrong(newPw) || newPw !== confirmPw
              }
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setSession(null);
    setPage("dashboard");
  };

  if (!session) {
    return (
      <>
        <LoginPage
          onLogin={(s) => {
            setSession(s);
            setPage("dashboard");
          }}
        />
        <Toaster />
      </>
    );
  }

  if (session.userInfo.mustChangePassword) {
    return (
      <>
        <ForceChangePasswordPage
          session={session}
          onSuccess={(newPassword) => {
            setSession({
              userInfo: { ...session.userInfo, mustChangePassword: false },
              password: newPassword,
            });
          }}
        />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage session={session} />;
      case "users":
        return <UserManagementPage session={session} />;
      case "employees":
        return <EmployeeManagementPage session={session} />;
      case "crm":
        return <CRMPage session={session} />;
      case "attendance":
        return <AttendancePage session={session} />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage session={session} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <NavLinks
          page={page}
          session={session}
          onNavigate={setPage}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-ocid="nav.mobile.button">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-sidebar">
              <NavLinks
                page={page}
                session={session}
                onNavigate={setPage}
                onLogout={handleLogout}
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-foreground">
            Business Dashboard
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>

        <footer className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}
