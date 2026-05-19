'use client';

import { useState } from 'react';
import { ArtisanOnboardingData } from '@/types';

interface BasicInfoStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function BasicInfoStep({
  data,
  updateData,
  onNext,
  isFirst,
  isSubmitting
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState<Partial<ArtisanOnboardingData>>({
    bio: data.bio || '',
    bio_luganda: data.bio_luganda || '',
    bio_swahili: data.bio_swahili || '',
    community: data.community || '',
    district: data.district || '',
    years_experience: data.years_experience || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const handleChange = (field: keyof ArtisanOnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Tell us about yourself</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio in English */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Story (English) *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about your journey as a craftsperson, your inspiration, and what makes your work special..."
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Share your personal story and craft heritage
          </p>
        </div>

        {/* Bio in Luganda */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Story (Luganda)
          </label>
          <textarea
            value={formData.bio_luganda}
            onChange={(e) => handleChange('bio_luganda', e.target.value)}
            placeholder="Bwogere ku mukwano gwo nga omukozi w'empindu..."
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Optional: Share your story in your local language
          </p>
        </div>

        {/* Bio in Swahili */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Story (Swahili)
          </label>
          <textarea
            value={formData.bio_swahili}
            onChange={(e) => handleChange('bio_swahili', e.target.value)}
            placeholder="Simulia safari yako kama mfanyakazi wa sanaa..."
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Optional: Share your story in Swahili
          </p>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Community/Village *
            </label>
            <input
              type="text"
              value={formData.community}
              onChange={(e) => handleChange('community', e.target.value)}
              placeholder="e.g., Kasubi, Ntinda"
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              District *
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="e.g., Wakiso, Kampala"
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={formData.years_experience}
            onChange={(e) => handleChange('years_experience', parseInt(e.target.value) || 0)}
            min="0"
            max="80"
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-muted-foreground mt-1">
            How many years have you been practicing your craft?
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || !formData.bio?.trim() || !formData.community?.trim() || !formData.district?.trim()}
            className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
