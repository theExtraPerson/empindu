'use client';

import { useState, useRef } from 'react';
import { ArtisanOnboardingData } from '@/types';

interface VoiceBioStepProps {
  data: Partial<ArtisanOnboardingData>;
  updateData: (data: Partial<ArtisanOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function VoiceBioStep({
  data,
  updateData,
  onNext,
  onPrev,
  isSubmitting
}: VoiceBioStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioBlob) {
      // Convert blob to file
      const file = new File([audioBlob], `voice-bio-${Date.now()}.wav`, { type: 'audio/wav' });
      updateData({ voice_recording: file });
    }
    onNext();
  };

  const skipStep = () => {
    updateData({ voice_recording: undefined });
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Voice Biography (Optional)</h3>
      <p className="text-muted-foreground mb-6">
        Record a personal message about your craft and journey. This adds authenticity and helps customers hear your story in your own voice.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Recording Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="lg">Luganda</option>
            <option value="sw">Swahili</option>
          </select>
        </div>

        {/* Recording Interface */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="text-center">
            {!audioUrl ? (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-background rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Record Your Story</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share why you create, what inspires you, or a special memory about your craft
                  </p>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Start Recording
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-500 font-medium">Recording...</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600"
                      >
                        Stop Recording
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recording Complete!</h4>
                  <audio controls className="w-full max-w-md mx-auto">
                    <source src={audioUrl} type="audio/wav" />
                    Your browser does not support audio playback.
                  </audio>

                  <div className="flex gap-2 justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Record Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Recording Tips</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Find a quiet place to record</li>
            <li>• Speak clearly and from the heart</li>
            <li>• Keep it under 2 minutes for best results</li>
            <li>• You can re-record as many times as needed</li>
          </ul>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={skipStep}
              className="min-h-[44px] px-6 py-3 text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : audioBlob ? 'Continue' : 'Skip & Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
