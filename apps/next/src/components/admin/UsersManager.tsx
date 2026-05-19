import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserCheck, UserX, Shield, ShoppingBag, Palette, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppRole = 'admin' | 'artisan' | 'buyer';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_verified: boolean;
  date_joined: string;
  location: string | null;
  phone: string | null;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const UsersManager = () => {
  const { role, session } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    open: boolean;
    userId: string;
    currentRole: AppRole;
    newRole: AppRole;
    userName: string;
  } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!session?.accessToken) {
        throw new Error('Admin authentication required.');
      }

      const response = await fetch(`${apiBase}/api/v1/auth/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch users');
      }

      const data: UserWithRole[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [role, session]);

  const handleCreateAdmin = async () => {
    if (!createForm.email || !createForm.password || !createForm.full_name) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreateLoading(true);
    try {
      if (!session?.accessToken) {
        throw new Error('Admin authentication required.');
      }

      const response = await fetch(`${apiBase}/api/v1/auth/admin/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create admin account');
      }

      toast.success(`Admin account created for ${createForm.email}`);
      setCreateForm({ email: '', password: '', full_name: '' });
      setCreateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRoleChange = (userId: string, currentRole: AppRole, newRole: AppRole, userName: string) => {
    if (currentRole === newRole) return;
    setRoleChangeDialog({ open: true, userId, currentRole, newRole, userName });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeDialog) return;

    toast.error('Role updates are not implemented in this backend route yet.');
    setRoleChangeDialog(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            <Shield className="h-3 w-3 mr-1" />Admin
          </Badge>
        );
      case 'artisan':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
            <Palette className="h-3 w-3 mr-1" />Artisan
          </Badge>
        );
      case 'buyer':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
            <ShoppingBag className="h-3 w-3 mr-1" />Buyer
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const roleStats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    artisans: users.filter((u) => u.role === 'artisan').length,
    buyers: users.filter((u) => u.role === 'buyer').length,
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-[320px] rounded-3xl border border-muted-foreground/10 bg-muted-foreground/5 p-8 text-center text-sm text-muted-foreground">
        Admin access required to view user data.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{roleStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-2xl text-red-600">{roleStats.admins}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Artisans</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{roleStats.artisans}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Buyers</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{roleStats.buyers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Secure admin-only list of registered users from the backend.</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Admin
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <UserCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <UserX className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={roleChangeDialog?.open} onOpenChange={(open) => !open && setRoleChangeDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {roleChangeDialog?.userName}'s role from{' '}
              <strong>{roleChangeDialog?.currentRole}</strong> to{' '}
              <strong>{roleChangeDialog?.newRole}</strong>?
              {roleChangeDialog?.newRole === 'admin' && (
                <span className="block mt-2 text-red-500">
                  ⚠️ Admins have full access to manage all users, products, and orders.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin user with full access to manage the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Admin Full Name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                disabled={createLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="admin@example.com"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                disabled={createLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                placeholder="Secure password (min 8 chars, mixed case, numbers, symbols)"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                disabled={createLoading}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              ⚠️ This account will have full admin privileges. Share credentials securely.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={createLoading} className="gap-2">
              {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

