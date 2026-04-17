export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'user' | 'admin';
  balance: number;
  status?: string;
  rejectionReason?: string;
  company?: string;
  industry?: string;
  publicTagline?: string;
  publicBio?: string;
  professionalTitle?: string;
  skillsExpertise?: string[];
  workExperience?: string[];
  educationCertifications?: string[];
  achievementsProjects?: string[];
  personalInterests?: string[];
  accountType?: 'personal' | 'business';
  profileSlug?: string | null;
  qrCodeUrl?: string;
  phone?: string;
  website?: string;
  location?: string;
  servicesOffered?: string[];
  socialLinks?: { platform: string; url: string }[];
  preferredChannels?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
    publicProfileAccentColor?: string;
    publicProfileTextColor?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  photoURL?: string;
  company?: string;
  industry?: string;
  publicTagline?: string;
  publicBio?: string;
  professionalTitle?: string;
  skillsExpertise?: string[];
  workExperience?: string[];
  educationCertifications?: string[];
  achievementsProjects?: string[];
  personalInterests?: string[];
  preferredChannels?: string[];
  profileSlug?: string | null;
  accountType?: 'personal' | 'business';
  phone?: string;
  website?: string;
  location?: string;
  servicesOffered?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
    publicProfileAccentColor?: string;
    publicProfileTextColor?: string;
  };
}

export interface UserProfileResponse {
  user: UserProfile;
}
