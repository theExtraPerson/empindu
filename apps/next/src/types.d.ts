declare module 'framer-motion';
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '/*' {
  const src: string;
  export default src;
}

export interface CraftTradition {
  id: number;
  name: string;
  ethnic_group: string;
  region: string;
  description: string;
  gi_status: string;
}

export interface ArtisanOnboardingData {
  craft_tradition_id?: number;
  bio: string;
  bio_luganda?: string;
  bio_swahili?: string;
  community: string;
  district: string;
  phone: string;
  momo_number?: string;
  airtel_number?: string;
  years_experience: number;
  profile_photo?: File;
  cover_photo?: File;
  voice_recording?: File;
}
