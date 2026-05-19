'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { CraftTradition, ArtisanOnboardingData } from '@/types';

interface CraftTraditionStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CraftTraditionStep({
  data,
  updateData,
  onNext,
  onPrev,
  isSubmitting
}: CraftTraditionStepProps) {
  const { data: session } = useSession();
  const [traditions, setTraditions] = useState<CraftTradition[]>([]);
  const [selectedTradition, setSelectedTradition] = useState<number | null>(data.craft_tradition_id || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraditions = async () => {
      try {
        const data = await apiFetch('/api/v1/artisans/traditions/list') as CraftTradition[];
        setTraditions(data);
      } catch (error) {
        console.error('Failed to fetch craft traditions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTraditions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTradition) {
      updateData({ craft_tradition_id: selectedTradition });
      onNext();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading craft traditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Choose Your Craft Tradition</h3>
      <p className="text-muted-foreground mb-6">
        Select the craft tradition that best represents your work. This helps us connect you with the right community and showcase your cultural heritage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traditions.map((tradition) => (
            <div
              key={tradition.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedTradition === tradition.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedTradition(tradition.id)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="craft_tradition"
                  value={tradition.id}
                  checked={selectedTradition === tradition.id}
                  onChange={() => setSelectedTradition(tradition.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{tradition.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tradition.ethnic_group} • {tradition.region}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tradition.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {traditions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No craft traditions available at the moment.</p>
          </div>
        )}

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
            disabled={isSubmitting || !selectedTradition}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}