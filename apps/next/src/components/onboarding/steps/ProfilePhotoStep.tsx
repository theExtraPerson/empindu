'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ArtisanOnboardingData } from '@/types';

interface ProfilePhotoStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProfilePhotoStep({
  data,
  updateData,
  onNext,
  onPrev,
  isSubmitting
}: ProfilePhotoStepProps) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(data.profile_photo || null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(data.cover_photo || null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      profile_photo: profilePhoto || undefined,
      cover_photo: coverPhoto || undefined,
    });
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Profile Photos</h3>
      <p className="text-muted-foreground mb-6">
        Upload photos that showcase your work and personality. These help customers connect with you and your craft.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Profile Photo *
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profilePreview ? (
                <Image
                  src={profilePreview}
                  alt="Profile preview"
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-muted border-4 border-background shadow-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="absolute bottom-0 right-0 min-h-[44px] min-w-[44px] bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Upload a clear photo of yourself. This helps customers recognize you and builds trust.
              </p>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="min-h-[44px] text-primary hover:underline text-sm font-medium"
              >
                Choose profile photo
              </button>
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Cover Photo (Optional)
          </label>
          <div className="space-y-4">
            {coverPreview ? (
              <div className="relative">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-4 right-4 min-h-[44px] min-w-[44px] bg-background/80 backdrop-blur-sm text-foreground rounded-full p-2 shadow-lg hover:bg-background"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="text-center">
                  <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Click to add a cover photo</p>
                  <p className="text-xs text-muted-foreground mt-1">Showcase your workshop or craft</p>
                </div>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="min-h-[44px] px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !profilePhoto}
            className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
