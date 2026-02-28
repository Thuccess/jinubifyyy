export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'user' | 'admin';
  balance: number;
  company?: string;
  industry?: string;
  preferredChannels?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  photoURL?: string;
  company?: string;
  industry?: string;
  preferredChannels?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
  };
}

export interface UserProfileResponse {
  user: UserProfile;
}
