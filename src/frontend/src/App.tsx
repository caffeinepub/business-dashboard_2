import { type UserProfile, UserRole } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle,
  ClipboardList,
  Database,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// ─── Role Helpers ────────────────────────────────────────────────────────────
function getRoleLabel(role: UserRole): string {
  if (role === UserRole.admin) return "Admin";
  if (role === UserRole.user) return "Operator";
  return "Employee";
}

function getRoleBadgeClass(role: UserRole): string {
  if (role === UserRole.admin) return "bg-red-100 text-red-700 border-red-200";
  if (role === UserRole.user)
    return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-green-100 text-green-700 border-green-200";
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = "dashboard" | "users" | "settings";

// ─── Login Page ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (profile: UserProfile) => void }) {
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setError("");
    setLoading(true);
    try {
      const profile = await actor.authenticate(username, password);
      if (profile) {
        onLogin(profile);
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-card">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            BizDash
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Business Management Dashboard
          </p>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-ocid="login.input"
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || !actor}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            Demo Credentials
          </p>
          <div className="space-y-1">
            {[
              { label: "Admin", creds: "admin / admin123" },
              { label: "Operator", creds: "operator / op123" },
              { label: "Employee", creds: "employee / emp123" },
            ].map(({ label, creds }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="font-medium text-foreground w-16">
                  {label}:
                </span>
                <code className="font-mono">{creds}</code>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  profile,
  activePage,
  onNavigate,
  onLogout,
}: {
  profile: UserProfile;
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}) {
  const isAdmin = profile.role === UserRole.admin;

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    {
      page: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    ...(isAdmin
      ? [
          {
            page: "users" as Page,
            label: "Users",
            icon: <Users className="w-4 h-4" />,
          },
        ]
      : []),
    {
      page: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Building2 className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-foreground text-base tracking-tight">
          BizDash
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ page, label, icon }) => (
          <button
            type="button"
            key={page}
            data-ocid={`nav.${page}.link`}
            onClick={() => onNavigate(page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activePage === page
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-sidebar-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile.username}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {getRoleLabel(profile.role)}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="shadow-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent({
  profile,
  actor,
}: { profile: UserProfile; actor: any }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (profile.role === UserRole.admin && actor) {
      setLoadingUsers(true);
      actor
        .listAllUserProfiles()
        .then((u: UserProfile[]) => setUsers(u))
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [profile.role, actor]);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {profile.username}!
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Here's what's happening today.
          </p>
        </div>
        <Badge
          className={`ml-2 border font-semibold ${getRoleBadgeClass(profile.role)}`}
        >
          {getRoleLabel(profile.role)}
        </Badge>
      </div>

      {/* Admin stats */}
      {profile.role === UserRole.admin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={users.length || "—"}
              icon={<Users className="w-5 h-5 text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Active Sessions"
              value="12"
              icon={<Activity className="w-5 h-5 text-teal-600" />}
              color="bg-teal-50"
            />
            <StatCard
              title="System Status"
              value="Healthy"
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              color="bg-green-50"
            />
          </div>

          {/* User table */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Users</CardTitle>
              <CardDescription>
                Registered users across all roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div
                  data-ocid="users.loading_state"
                  className="flex items-center gap-2 text-muted-foreground py-4"
                >
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
                </div>
              ) : (
                <Table data-ocid="users.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Principal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          data-ocid="users.empty_state"
                          className="text-center text-muted-foreground py-8"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u, i) => (
                        <TableRow
                          key={u.principal.toString()}
                          data-ocid={`users.item.${i + 1}`}
                        >
                          <TableCell className="text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {u.username}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border text-xs ${getRoleBadgeClass(u.role)}`}
                            >
                              {getRoleLabel(u.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                            {u.principal.toString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Operator stats */}
      {profile.role === UserRole.user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Assigned Tasks"
            value="8"
            icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Reports Generated"
            value="24"
            icon={<BarChart3 className="w-5 h-5 text-teal-600" />}
            color="bg-teal-50"
          />
        </div>
      )}

      {/* Employee profile */}
      {profile.role === UserRole.guest && (
        <Card className="shadow-card border-border max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {profile.username}
                </p>
                <Badge
                  className={`border text-xs mt-0.5 ${getRoleBadgeClass(profile.role)}`}
                >
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Principal ID</p>
              <p className="text-xs font-mono text-foreground break-all mt-0.5">
                {profile.principal.toString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ─── Users Page ───────────────────────────────────────────────────────────────
function UsersPage({ actor }: { actor: any }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .listAllUserProfiles()
      .then((u: UserProfile[]) => setUsers(u))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground mt-0.5">
          View and manage all registered users.
        </p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" /> User Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              data-ocid="users_page.loading_state"
              className="flex items-center gap-2 text-muted-foreground py-6"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <Table data-ocid="users_page.table">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      data-ocid="users_page.empty_state"
                      className="text-center text-muted-foreground py-8"
                    >
                      No users registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u, i) => (
                    <TableRow
                      key={u.principal.toString()}
                      data-ocid={`users_page.item.${i + 1}`}
                    >
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {u.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border text-xs ${getRoleBadgeClass(u.role)}`}
                        >
                          {getRoleLabel(u.role)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ profile }: { profile: UserProfile }) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-0.5">
          Manage your account preferences.
        </p>
      </div>

      <Card className="shadow-card border-border max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Username</Label>
            <p className="text-sm font-medium">{profile.username}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Role</Label>
            <div>
              <Badge
                className={`border text-xs ${getRoleBadgeClass(profile.role)}`}
              >
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Principal ID
            </Label>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {profile.principal.toString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
function DashboardLayout({
  profile,
  actor,
  onLogout,
}: {
  profile: UserProfile;
  actor: any;
  onLogout: () => void;
}) {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    if (activePage === "users" && profile.role === UserRole.admin) {
      return <UsersPage actor={actor} />;
    }
    if (activePage === "settings") {
      return <SettingsPage profile={profile} />;
    }
    return <DashboardContent profile={profile} actor={actor} />;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        profile={profile}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground capitalize">
              {activePage}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile.username}
            </span>
            <Badge
              className={`border text-xs ${getRoleBadgeClass(profile.role)}`}
            >
              {getRoleLabel(profile.role)}
            </Badge>
            <Button
              data-ocid="header.logout.button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">{renderPage()}</main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { actor, isFetching } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize demo accounts once actor is ready
  useEffect(() => {
    if (actor && !initialized) {
      setInitialized(true);
      actor.initializeActorAdmin().catch(() => {
        /* already seeded */
      });
    }
  }, [actor, initialized]);

  const handleLogout = () => setProfile(null);

  if (isFetching && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          data-ocid="app.loading_state"
          className="flex flex-col items-center gap-3 text-muted-foreground"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading BizDash...</p>
        </div>
      </div>
    );
  }

  if (profile) {
    return (
      <DashboardLayout
        profile={profile}
        actor={actor}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginPage onLogin={setProfile} />;
}
