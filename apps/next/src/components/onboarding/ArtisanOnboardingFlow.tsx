'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  Check,
  ClipboardList,
  ImagePlus,
  Loader2,
  Mic,
  PackageCheck,
  Phone,
  ReceiptText,
  ScrollText,
  Sparkles,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, type CraftTradition } from '@/lib/api';
import { cn } from '@/lib/utils';

type BusinessRegistrationStatus = 'not_registered' | 'pending' | 'registered';
type BusinessType = 'solo' | 'family' | 'cooperative' | 'studio';

interface OnboardingData {
  full_name: string;
  email: string;
  phone: string;
  preferred_channel: string;
  business_name: string;
  business_type: BusinessType;
  registration_status: BusinessRegistrationStatus;
  registration_number: string;
  tax_id: string;
  business_description: string;
  craft_tradition_id?: number;
  craft_traditions: string[];
  craft_tradition_input: string;
  community: string;
  district: string;
  years_experience: number;
  bio: string;
  bio_luganda: string;
  bio_swahili: string;
  product_name: string;
  product_story: string;
  material: string;
  technique: string;
  price_ugx: string;
  stock: string;
  is_customisable: boolean;
  momo_number: string;
  airtel_number: string;
  fulfillment_method: string;
  production_days: string;
  return_policy: string;
  profile_photo?: File;
  cover_photo?: File;
  voice_recording?: File;
}

const defaultData: OnboardingData = {
  full_name: '',
  email: '',
  phone: '',
  preferred_channel: 'WhatsApp',
  business_name: '',
  business_type: 'solo',
  registration_status: 'not_registered',
  registration_number: '',
  tax_id: '',
  business_description: '',
  craft_tradition_id: undefined,
  craft_traditions: [],
  craft_tradition_input: '',
  community: '',
  district: '',
  years_experience: 0,
  bio: '',
  bio_luganda: '',
  bio_swahili: '',
  product_name: '',
  product_story: '',
  material: '',
  technique: '',
  price_ugx: '',
  stock: '1',
  is_customisable: true,
  momo_number: '',
  airtel_number: '',
  fulfillment_method: 'Pickup partner',
  production_days: '7',
  return_policy: 'Repair or exchange within 7 days',
};

const steps = [
  {
    key: 'hello',
    label: 'Hello',
    title: 'First, who is joining the marketplace?',
    prompt: 'We start with the person behind the work. No joining fee, no performance theatre.',
    icon: UserRound,
  },
  {
    key: 'business',
    label: 'Business',
    title: 'Now shape the workshop profile.',
    prompt: 'For registered businesses, cooperatives, and solo makers, this captures verification-ready details.',
    icon: Building2,
  },
  {
    key: 'craft',
    label: 'Craft',
    title: 'Let the craft speak before the catalogue does.',
    prompt: 'Empindu is story-first, with provenance, community, and language woven into discovery.',
    icon: ScrollText,
  },
  {
    key: 'shop',
    label: 'Shop',
    title: 'Prepare the first product for ecommerce.',
    prompt: 'A small listing draft helps the artisan leave onboarding with a route to sales, not just a profile.',
    icon: Store,
  },
  {
    key: 'orders',
    label: 'Orders',
    title: 'Set the selling rhythm.',
    prompt: 'Payments, production windows, fulfillment, and return handling become part of the operating flow.',
    icon: PackageCheck,
  },
  {
    key: 'launch',
    label: 'Launch',
    title: 'Review the handoff.',
    prompt: 'The profile can be submitted now, while richer business and product details stay ready for the dashboard.',
    icon: BadgeCheck,
  },
] as const;

const channels = ['WhatsApp', 'Telegram', 'Phone call', 'Email'];
export const CRAFT_TRADITION_OPTIONS = ['Basketry', 'Bark cloth', 'Wood work', 'Tapestry', 'Embroidery'];
const businessTypes: Array<{ value: BusinessType; label: string }> = [
  { value: 'solo', label: 'Solo maker' },
  { value: 'family', label: 'Family workshop' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'studio', label: 'Registered studio' },
];
const registrationStatuses: Array<{ value: BusinessRegistrationStatus; label: string }> = [
  { value: 'not_registered', label: 'Not registered yet' },
  { value: 'pending', label: 'Registration pending' },
  { value: 'registered', label: 'Registered business' },
];
const fulfillmentMethods = ['Pickup partner', 'Courier collection', 'Market drop-off', 'Studio pickup'];

export function ArtisanOnboardingFlow() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [traditions, setTraditions] = useState<CraftTradition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedDraft = window.localStorage.getItem('empindu-artisan-onboarding-draft');
    if (!storedDraft) return;

    try {
      const parsed = JSON.parse(storedDraft) as Partial<OnboardingData>;
      setData((prev) => ({
        ...prev,
        ...parsed,
        profile_photo: undefined,
        cover_photo: undefined,
        voice_recording: undefined,
      }));
      setMessage('Your onboarding draft is ready. Review it, then submit the profile.');
    } catch {
      window.localStorage.removeItem('empindu-artisan-onboarding-draft');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiFetch<CraftTradition[]>('/artisans/traditions/list')
      .then((items) => {
        if (isMounted) {
          setTraditions(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMessage('Craft traditions will load when the backend is available.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setData((prev) => ({ ...prev, email: prev.email || session.user?.email || '' }));
    }
    if (session?.user?.name) {
      setData((prev) => ({ ...prev, full_name: prev.full_name || session.user?.name || '' }));
    }
  }, [session?.user?.email, session?.user?.name]);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const current = steps[currentStep];
  const CurrentIcon = current.icon;

  const selectedTradition = useMemo(
    () => traditions.find((tradition) => tradition.id === data.craft_tradition_id),
    [data.craft_tradition_id, traditions],
  );

  const update = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const canContinue = useMemo(() => {
    if (currentStep === 0) return Boolean(data.full_name.trim() && data.email.trim() && data.phone.trim());
    if (currentStep === 1) return Boolean(data.business_name.trim() && data.business_description.trim());
    if (currentStep === 2) {
      return Boolean(data.craft_traditions.length > 0 && data.community.trim() && data.district.trim() && data.bio.trim());
    }
    if (currentStep === 3) {
      return Boolean(data.product_name.trim() && data.product_story.trim() && data.price_ugx.trim() && data.stock.trim());
    }
    if (currentStep === 4) return Boolean(data.momo_number.trim() || data.airtel_number.trim());
    return true;
  }, [currentStep, data]);

  const goNext = () => {
    if (!canContinue) {
      setError('A few essentials are still empty on this step.');
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setError('');
  };

  const persistDraft = () => {
    const savedDraft = {
      ...data,
      profile_photo: data.profile_photo?.name,
      cover_photo: data.cover_photo?.name,
      voice_recording: data.voice_recording?.name,
      saved_at: new Date().toISOString(),
      commerce_readiness: {
        product_draft: data.product_name,
        fulfillment_method: data.fulfillment_method,
        return_policy: data.return_policy,
      },
    };

    window.localStorage.setItem('empindu-artisan-onboarding-draft', JSON.stringify(savedDraft));
  };

  const signInToPublish = () => {
    if (!canContinue) {
      setError('Review the required fields before publishing.');
      return;
    }

    persistDraft();
    router.push('/auth?intent=artisan-publish&callbackUrl=/onboarding');
  };

  const submitOnboarding = async () => {
    if (!canContinue) {
      setError('Review the required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      persistDraft();

      if (session?.accessToken) {
        await apiFetch(
          '/artisans/onboard',
          {
            method: 'POST',
            body: JSON.stringify({
              craft_tradition_id: data.craft_tradition_id,
              craft_traditions: data.craft_traditions,
              bio: data.bio,
              bio_luganda: data.bio_luganda || undefined,
              bio_swahili: data.bio_swahili || undefined,
              community: data.community,
              district: data.district,
              phone: data.phone,
              momo_number: data.momo_number || undefined,
              airtel_number: data.airtel_number || undefined,
              years_experience: data.years_experience || 0,
              onboarded_via: 'web',
            }),
          },
          session.accessToken,
        );

        setMessage('Profile submitted. Your business and product draft are saved on this device for the next dashboard step.');
        setTimeout(() => router.push('/artisans'), 900);
      } else {
        signInToPublish();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Onboarding could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-card text-card-foreground shadow-clay">
      <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,hsl(var(--mudcloth-black))_0_18px,hsl(var(--kente-gold))_18px_30px,hsl(var(--copper))_30px_42px,hsl(var(--clay-light))_42px_54px)]" />

      <div className="grid min-h-[720px] lg:grid-cols-[0.9fr_1.35fr]">
        <aside className="relative border-b border-foreground/10 bg-mud px-5 py-7 text-primary lg:border-b-0 lg:border-r lg:px-7">
          <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(45deg,transparent_46%,hsl(var(--kente-gold))_47%,hsl(var(--kente-gold))_53%,transparent_54%)] [background-size:28px_28px]" />
          <div className="relative flex h-full flex-col gap-7">
            <div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Artisan onboarding</p>
              <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-primary sm:text-4xl">
                Build the profile, shop, and order flow in one guided conversation.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-primary/70">
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-primary/15 [&>div]:bg-gold" />
            </div>

            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isDone = index < currentStep;

                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition',
                        isActive
                          ? 'border-gold bg-primary text-foreground shadow-gold'
                          : 'border-primary/10 bg-primary/5 text-primary/75 hover:bg-primary/10',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                          isActive || isDone ? 'border-foreground/10 bg-gold text-foreground' : 'border-primary/15',
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{step.label}</span>
                        <span className="block text-xs opacity-70">{index === currentStep ? 'In conversation' : 'Tap to review'}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-auto rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-primary/80">
              <p className="font-semibold text-primary">Guidance from the docs</p>
              <p className="mt-2">
                Capture identity, craft tradition, business readiness, product story, payments, and fulfillment before admin review.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex flex-col px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          <div className="mb-5 flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Empindu asks</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{current.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{current.prompt}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.985 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1"
            >
              {currentStep === 0 ? <HelloStep data={data} update={update} /> : null}
              {currentStep === 1 ? <BusinessStep data={data} update={update} /> : null}
              {currentStep === 2 ? (
                <CraftStep data={data} update={update} traditions={traditions} selectedTradition={selectedTradition} />
              ) : null}
              {currentStep === 3 ? <ShopStep data={data} update={update} /> : null}
              {currentStep === 4 ? <OrdersStep data={data} update={update} /> : null}
              {currentStep === 5 ? <LaunchStep data={data} hasSession={Boolean(session)} /> : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 border-t border-foreground/10 pt-5">
            {error ? <p className="mb-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            {message ? <p className="mb-3 rounded-xl bg-gold/15 px-4 py-3 text-sm text-foreground">{message}</p> : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={goBack} disabled={currentStep === 0 || isSubmitting}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" variant="accent" onClick={goNext} disabled={!canContinue || isSubmitting} className="min-h-12">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="earth"
                  onClick={session ? submitOnboarding : signInToPublish}
                  disabled={isSubmitting}
                  className="min-h-12"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                  {session ? 'Submit profile' : 'Sign in to publish'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HelloStep({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <ConversationalNote icon={Phone} label="Registration">
        Give buyers and support staff one clear way to recognize and reach the artisan.
      </ConversationalNote>
      <Field label="Full name" required>
        <Input value={data.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="e.g. Nakato Sarah" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" required>
          <Input type="email" value={data.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" />
        </Field>
        <Field label="Phone" required>
          <Input value={data.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+256 7..." />
        </Field>
      </div>
      <ChoiceGrid
        label="Preferred conversation channel"
        options={channels}
        value={data.preferred_channel}
        onChange={(value) => update('preferred_channel', value)}
      />
    </div>
  );
}

function BusinessStep({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <ConversationalNote icon={Building2} label="Business readiness">
        If the artisan already sells as a business, capture enough detail for verification without making the form heavy.
      </ConversationalNote>
      <Field label="Business or workshop name" required>
        <Input value={data.business_name} onChange={(event) => update('business_name', event.target.value)} placeholder="e.g. Kasubi Palm Studio" />
      </Field>
      <ChoiceGrid
        label="Business shape"
        options={businessTypes}
        value={data.business_type}
        onChange={(value) => update('business_type', value as BusinessType)}
      />
      <ChoiceGrid
        label="Registration status"
        options={registrationStatuses}
        value={data.registration_status}
        onChange={(value) => update('registration_status', value as BusinessRegistrationStatus)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Registration number">
          <Input
            value={data.registration_number}
            onChange={(event) => update('registration_number', event.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Tax ID">
          <Input value={data.tax_id} onChange={(event) => update('tax_id', event.target.value)} placeholder="Optional" />
        </Field>
      </div>
      <Field label="What does this business make and protect?" required>
        <Textarea
          value={data.business_description}
          onChange={(event) => update('business_description', event.target.value)}
          placeholder="A short note on the workshop, its people, and the cultural knowledge behind the work."
          className="min-h-28"
        />
      </Field>
    </div>
  );
}

function CraftStep({
  data,
  update,
  traditions,
  selectedTradition,
}: {
  data: OnboardingData;
  traditions: CraftTradition[];
  selectedTradition?: CraftTradition;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  const craftOptions = Array.from(new Set([...CRAFT_TRADITION_OPTIONS, ...traditions.map((tradition) => tradition.name)]));

  const findBackendTraditionId = (crafts: string[]) => {
    const match = crafts
      .map((craft) => traditions.find((tradition) => tradition.name.toLowerCase() === craft.toLowerCase()))
      .find(Boolean);

    return match?.id;
  };

  const toggleCraft = (craft: string) => {
    const nextCrafts = data.craft_traditions.includes(craft)
      ? data.craft_traditions.filter((item) => item !== craft)
      : [...data.craft_traditions, craft];

    update('craft_traditions', nextCrafts);
    update('craft_tradition_id', findBackendTraditionId(nextCrafts));
  };

  const addTypedCraft = () => {
    const craft = data.craft_tradition_input.trim();
    if (!craft) return;

    const existingCraft = craftOptions.find((option) => option.toLowerCase() === craft.toLowerCase());
    const normalizedCraft = existingCraft || craft;
    const nextCrafts = data.craft_traditions.some((item) => item.toLowerCase() === normalizedCraft.toLowerCase())
      ? data.craft_traditions
      : [...data.craft_traditions, normalizedCraft];

    update('craft_traditions', nextCrafts);
    update('craft_tradition_input', '');
    update('craft_tradition_id', findBackendTraditionId(nextCrafts));
  };

  return (
    <div className="grid gap-4">
      <ConversationalNote icon={Mic} label="Story and provenance">
        The public profile should feel human, searchable, and respectful of cultural attribution.
      </ConversationalNote>
      <div className="grid gap-3">
        <p className="text-sm font-semibold">
          Craft traditions <span className="text-destructive">*</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {craftOptions.map((craft) => {
            const selected = data.craft_traditions.includes(craft);

            return (
              <button
                key={craft}
                type="button"
                onClick={() => toggleCraft(craft)}
                className={cn(
                  'flex min-h-12 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition',
                  selected ? 'border-accent bg-accent text-accent-foreground shadow-medium' : 'border-foreground/10 bg-muted/40 hover:bg-muted',
                )}
              >
                <span>{craft}</span>
                {selected ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={data.craft_tradition_input}
            onChange={(event) => update('craft_tradition_input', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTypedCraft();
              }
            }}
            placeholder="Type another craft tradition"
            className="min-h-12"
          />
          <Button type="button" variant="outline" onClick={addTypedCraft} className="min-h-12 shrink-0">
            Add craft
          </Button>
        </div>
        {data.craft_traditions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.craft_traditions.map((craft) => (
              <button
                key={craft}
                type="button"
                onClick={() => toggleCraft(craft)}
                className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
              >
                {craft}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Select one or more traditions, or add a new one by typing it above.</p>
        )}
      </div>
      {selectedTradition ? (
        <div className="rounded-2xl border border-foreground/10 bg-muted/60 p-4 text-sm">
          <p className="font-semibold">{selectedTradition.ethnic_group}</p>
          <p className="mt-1 text-muted-foreground">{selectedTradition.description}</p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Community" required>
          <Input value={data.community} onChange={(event) => update('community', event.target.value)} placeholder="Kasubi" />
        </Field>
        <Field label="District" required>
          <Input value={data.district} onChange={(event) => update('district', event.target.value)} placeholder="Kampala" />
        </Field>
        <Field label="Years practicing">
          <Input
            type="number"
            min={0}
            value={data.years_experience}
            onChange={(event) => update('years_experience', Number(event.target.value) || 0)}
          />
        </Field>
      </div>
      <Field label="Artisan story" required>
        <Textarea
          value={data.bio}
          onChange={(event) => update('bio', event.target.value)}
          placeholder="Tell buyers about the journey, materials, community, and meaning behind the craft."
          className="min-h-32"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Luganda story">
          <Textarea value={data.bio_luganda} onChange={(event) => update('bio_luganda', event.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Swahili story">
          <Textarea value={data.bio_swahili} onChange={(event) => update('bio_swahili', event.target.value)} placeholder="Optional" />
        </Field>
      </div>
      <MediaInputs data={data} update={update} />
    </div>
  );
}

function ShopStep({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <ConversationalNote icon={Boxes} label="Ecommerce setup">
        One product draft is enough to teach pricing, stock, customization, and the story-first listing model.
      </ConversationalNote>
      <Field label="First product name" required>
        <Input value={data.product_name} onChange={(event) => update('product_name', event.target.value)} placeholder="e.g. Handwoven raffia basket" />
      </Field>
      <Field label="Product story" required>
        <Textarea
          value={data.product_story}
          onChange={(event) => update('product_story', event.target.value)}
          placeholder="What is it, how is it made, and where does its cultural knowledge come from?"
          className="min-h-28"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Material">
          <Input value={data.material} onChange={(event) => update('material', event.target.value)} placeholder="Palm leaf, barkcloth..." />
        </Field>
        <Field label="Technique">
          <Input value={data.technique} onChange={(event) => update('technique', event.target.value)} placeholder="Weaving, carving..." />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price UGX" required>
          <Input value={data.price_ugx} onChange={(event) => update('price_ugx', event.target.value)} placeholder="85000" inputMode="numeric" />
        </Field>
        <Field label="Stock" required>
          <Input value={data.stock} onChange={(event) => update('stock', event.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Production days">
          <Input value={data.production_days} onChange={(event) => update('production_days', event.target.value)} inputMode="numeric" />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => update('is_customisable', !data.is_customisable)}
        className="flex min-h-14 items-center justify-between rounded-2xl border border-foreground/10 bg-muted/50 px-4 text-left text-sm transition hover:bg-muted"
      >
        <span>
          <span className="block font-semibold">Accept custom requests</span>
          <span className="text-muted-foreground">Useful for size, message, color, and corporate gifting variations.</span>
        </span>
        <span className={cn('h-6 w-11 rounded-full p-1 transition', data.is_customisable ? 'bg-accent' : 'bg-muted-foreground/25')}>
          <span className={cn('block h-4 w-4 rounded-full bg-card transition', data.is_customisable ? 'translate-x-5' : 'translate-x-0')} />
        </span>
      </button>
    </div>
  );
}

function OrdersStep({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <ConversationalNote icon={ReceiptText} label="Order management">
        The dashboard will track pending payment, confirmed, dispatched, in transit, delivered, disputes, and refunds.
      </ConversationalNote>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="MTN MoMo number">
          <Input value={data.momo_number} onChange={(event) => update('momo_number', event.target.value)} placeholder="+256 7..." />
        </Field>
        <Field label="Airtel Money number">
          <Input value={data.airtel_number} onChange={(event) => update('airtel_number', event.target.value)} placeholder="+256 7..." />
        </Field>
      </div>
      <ChoiceGrid
        label="Preferred fulfillment"
        options={fulfillmentMethods}
        value={data.fulfillment_method}
        onChange={(value) => update('fulfillment_method', value)}
      />
      <Field label="Return and repair promise">
        <Textarea
          value={data.return_policy}
          onChange={(event) => update('return_policy', event.target.value)}
          placeholder="What can buyers expect if something arrives damaged or needs adjustment?"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Capability icon={Banknote} title="Payments" text="MoMo, Airtel, card, and cash workflows can reconcile against orders." />
        <Capability icon={Truck} title="Fulfillment" text="Production and dispatch milestones stay visible to buyers and admins." />
        <Capability icon={ClipboardList} title="Returns" text="Refund and repair cases can be reviewed from the order lifecycle." />
      </div>
    </div>
  );
}

function LaunchStep({
  data,
  hasSession,
}: {
  data: OnboardingData;
  hasSession: boolean;
}) {
  const summary = [
    ['Artisan', data.full_name || 'Not set'],
    ['Business', `${data.business_name || 'Not set'} (${data.registration_status.replace('_', ' ')})`],
    ['Craft', data.craft_traditions.join(', ') || 'Not set'],
    ['Location', [data.community, data.district].filter(Boolean).join(', ') || 'Not set'],
    ['First listing', data.product_name || 'Not set'],
    ['Order setup', `${data.fulfillment_method}, ${data.production_days} days`],
  ];

  return (
    <div className="grid gap-5">
      <div className="rounded-3xl border border-foreground/10 bg-muted/50 p-5">
        <p className="text-sm font-semibold text-muted-foreground">Launch packet</p>
        <div className="mt-4 grid gap-3">
          {summary.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="max-w-[58%] text-right font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5">
        <p className="font-semibold">{hasSession ? 'Ready to submit' : 'Draft mode'}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {hasSession
            ? 'Submitting creates the artisan profile now. Business verification, product publishing, and order controls are preserved as the next dashboard work.'
            : 'Because there is no active session, this saves the onboarding draft locally until the artisan signs in.'}
        </p>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function ChoiceGrid({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<string | { value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const selected = optionValue === value;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={cn(
                'min-h-12 rounded-2xl border px-4 text-left text-sm font-semibold transition',
                selected ? 'border-accent bg-accent text-accent-foreground shadow-medium' : 'border-foreground/10 bg-muted/40 hover:bg-muted',
              )}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConversationalNote({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-3xl border border-foreground/10 bg-primary/40 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function MediaInputs({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <FilePick
        icon={ImagePlus}
        label="Profile photo"
        fileName={data.profile_photo?.name}
        onChange={(file) => update('profile_photo', file)}
      />
      <FilePick icon={ImagePlus} label="Cover photo" fileName={data.cover_photo?.name} onChange={(file) => update('cover_photo', file)} />
      <FilePick icon={Mic} label="Voice bio" fileName={data.voice_recording?.name} onChange={(file) => update('voice_recording', file)} />
    </div>
  );
}

function FilePick({
  icon: Icon,
  label,
  fileName,
  onChange,
}: {
  icon: typeof ImagePlus;
  label: string;
  fileName?: string;
  onChange: (file?: File) => void;
}) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col justify-between rounded-2xl border border-dashed border-foreground/20 bg-muted/30 p-4 text-sm transition hover:bg-muted">
      <span className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="line-clamp-2 text-xs text-muted-foreground">{fileName || 'Tap to add optional file'}</span>
      <input
        type="file"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0])}
        accept={label === 'Voice bio' ? 'audio/*' : 'image/*'}
      />
    </label>
  );
}

function Capability({ icon: Icon, title, text }: { icon: typeof Banknote; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-muted/40 p-4">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
