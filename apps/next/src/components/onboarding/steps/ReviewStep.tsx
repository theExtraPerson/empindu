'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArtisanOnboardingData } from '@/types';

interface ReviewStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({
  data,
  onPrev,
  onSubmit,
  isSubmitting
}: ReviewStepProps) {
  const [craftTradition, setCraftTradition] = useState<any>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    // Load craft tradition details
    if (data.craft_tradition_id) {
      // In a real app, you'd fetch this from the API
      // For now, we'll just show the ID
      setCraftTradition({ name: `Craft Tradition #${data.craft_tradition_id}` });
    }

    // Create preview URLs for uploaded files
    if (data.profile_photo) {
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target?.result as string);
      reader.readAsDataURL(data.profile_photo);
    }

    if (data.cover_photo) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(data.cover_photo);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Review Your Information</h3>
      <p className="text-muted-foreground mb-6">
        Please review all the information below. You can go back to make changes if needed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h4 className="font-medium mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio (English)</label>
              <p className="text-sm mt-1">{data.bio || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio (Luganda)</label>
              <p className="text-sm mt-1">{data.bio_luganda || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio (Swahili)</label>
              <p className="text-sm mt-1">{data.bio_swahili || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-sm mt-1">{data.community}, {data.district}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
              <p className="text-sm mt-1">{data.years_experience || 0} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Craft Tradition</label>
              <p className="text-sm mt-1">{craftTradition?.name || 'Not selected'}</p>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h4 className="font-medium mb-4">Profile Photos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Profile Photo</label>
              {profilePreview ? (
                <Image
                  src={profilePreview}
                  alt="Profile preview"
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-background"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No photo</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Cover Photo</label>
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={200}
                  height={120}
                  className="w-full h-30 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-30 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No cover photo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Recording */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h4 className="font-medium mb-4">Voice Biography</h4>
          {data.voice_recording ? (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Voice recording uploaded</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-muted-foreground">No voice recording</span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h4 className="font-medium mb-4">Contact & Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">WhatsApp Number</label>
              <p className="text-sm mt-1">{data.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MTN MoMo Number</label>
              <p className="text-sm mt-1">{data.momo_number || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Airtel Money Number</label>
              <p className="text-sm mt-1">{data.airtel_number || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Terms and Agreement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h5 className="font-medium text-yellow-900 mb-2">📋 Before You Submit</h5>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• All information provided is accurate and truthful</li>
            <li>• You agree to Empindu's terms of service and community guidelines</li>
            <li>• Your profile will be reviewed before going live</li>
            <li>• You can update your information anytime from your dashboard</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Onboarding'}
          </button>
        </div>
      </form>
    </div>
  );
}