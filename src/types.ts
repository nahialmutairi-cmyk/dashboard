export interface PlatformLink {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  enabled: boolean;
  value: string;
}

export interface CustomLink {
  id: string;
  title: string;
  url: string;
}

export interface Client {
  id: string;
  slug: string;
  name: string;
  category: string;
  bio: string;
  avatar: string;
  banner: string;
  visits: number;
  clicks: number;
  status: 'active' | 'inactive';
  platforms: PlatformLink[];
  customLinks: CustomLink[];
  isPublicIndexed: boolean;
  country_code?: string;
  phone_number?: string;
}
