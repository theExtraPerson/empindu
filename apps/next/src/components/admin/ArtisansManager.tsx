import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Search, CheckCircle, XCircle, MapPin, Award, User } from 'lucide-react';
import { ArtisanProfile } from '@/hooks/useAdminData';
import { toast } from 'sonner';

interface ArtisansManagerProps {
  artisans: ArtisanProfile[];
  onVerify: (userId: string, verified: boolean) => Promise<{ error: any }>;
}

export const ArtisansManager = ({ artisans, onVerify }: ArtisansManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; artisan: ArtisanProfile | null; action: 'verify' | 'unverify' }>({
    open: false,
    artisan: null,
    action: 'verify'
  });

  const filteredArtisans = artisans.filter(artisan =>
    artisan.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.craft_specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyClick = (artisan: ArtisanProfile, action: 'verify' | 'unverify') => {
    setConfirmDialog({ open: true, artisan, action });
  };

  const handleConfirmVerify = async () => {
    if (!confirmDialog.artisan) return;
    
    const { error } = await onVerify(
      confirmDialog.artisan.user_id,
      confirmDialog.action === 'verify'
    );
    
    if (error) {
      toast.error('Failed to update artisan status');
    } else {
      toast.success(`Artisan ${confirmDialog.action === 'verify' ? 'verified' : 'unverified'} successfully`);
    }
    setConfirmDialog({ open: false, artisan: null, action: 'verify' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artisans</h2>
          <p className="text-muted-foreground">Manage and verify artisan accounts</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artisans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredArtisans.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No artisans found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtisans.map((artisan) => (
                <TableRow key={artisan.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artisan.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {artisan.full_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{artisan.full_name || 'Unnamed Artisan'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {artisan.bio || 'No bio provided'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {artisan.craft_specialty ? (
                      <Badge variant="secondary">{artisan.craft_specialty}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {artisan.location ? (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {artisan.location}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {artisan.years_experience ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-3 w-3" />
                        {artisan.years_experience} years
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {artisan.is_verified ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {artisan.is_verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyClick(artisan, 'unverify')}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyClick(artisan, 'verify')}
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'verify' ? 'Verify Artisan' : 'Revoke Verification'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'verify'
                ? `Are you sure you want to verify ${confirmDialog.artisan?.full_name || 'this artisan'}? They will receive a verified badge on their profile.`
                : `Are you sure you want to revoke verification for ${confirmDialog.artisan?.full_name || 'this artisan'}? Their verified badge will be removed.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVerify}>
              {confirmDialog.action === 'verify' ? 'Verify' : 'Revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
