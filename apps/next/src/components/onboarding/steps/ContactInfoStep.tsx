'use client';

import { useState } from 'react';
import { ArtisanOnboardingData } from '@/types';

interface ContactInfoStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ContactInfoStep({
  data,
  updateData,
  onNext,
  onPrev,
  isSubmitting
}: ContactInfoStepProps) {
  const [formData, setFormData] = useState<Partial<ArtisanOnboardingData>>({
    phone: data.phone || '',
    momo_number: data.momo_number || '',
    airtel_number: data.airtel_number || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const handleChange = (field: keyof ArtisanOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Contact & Payment Information</h3>
      <p className="text-muted-foreground mb-6">
        Provide your contact details and mobile money information for orders and payments.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            WhatsApp Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+256 700 000 000"
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            We'll use this for order notifications and customer communication
          </p>
        </div>

        {/* MTN MoMo Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            MTN Mobile Money Number
          </label>
          <input
            type="tel"
            value={formData.momo_number}
            onChange={(e) => handleChange('momo_number', e.target.value)}
            placeholder="+256 700 000 000"
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-muted-foreground mt-1">
            For receiving payments from customers
          </p>
        </div>

        {/* Airtel Money Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Airtel Money Number
          </label>
          <input
            type="tel"
            value={formData.airtel_number}
            onChange={(e) => handleChange('airtel_number', e.target.value)}
            placeholder="+256 700 000 000"
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Alternative payment method for customers
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-2">💰 Payment Information</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Payments are processed securely through mobile money</li>
            <li>• You'll receive 85% of the order value after delivery</li>
            <li>• Funds are transferred within 24 hours of confirmation</li>
            <li>• Keep your mobile money details up to date</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">🔒 Privacy & Security</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your contact information is only shared with confirmed buyers</li>
            <li>• We use end-to-end encryption for all communications</li>
            <li>• Payment details are processed securely and never stored</li>
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
            disabled={isSubmitting || !formData.phone?.trim()}
            className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
