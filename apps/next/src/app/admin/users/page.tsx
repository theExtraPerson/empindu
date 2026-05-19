'use client';

import { useAuth } from '@/hooks/useAuth';
import { UsersManager } from '@/components/admin/UsersManager';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const { user, role, signOut } = useAuth();

  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <div className="max-w-xl rounded-3xl border border-muted-foreground/10 bg-muted-foreground/5 p-10 text-center">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            You must be signed in as an admin to view this page.
          </p>
          {user ? (
            <div className="mt-6">
              <Button variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-muted-foreground/10 bg-muted-foreground/5 p-8">
          <h1 className="text-3xl font-semibold">Admin user list</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is only visible to admin users. It pulls the user directory from the backend and database.
          </p>
        </div>
        <UsersManager />
      </div>
    </div>
  );
}
