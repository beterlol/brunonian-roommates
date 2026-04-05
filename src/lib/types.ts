export type SchoolYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior'
export type HousingType = 'GPT' | 'General'

export interface Profile {
  id: string
  email: string
  name: string
  school_year: SchoolYear | null
  gender: string | null
  housing_type: HousingType | null
  bio: string | null
  photo_url: string | null
  sleep_schedule: string | null
  cleanliness: string | null
  noise_level: string | null
  guests: string | null
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  liker_id: string
  liked_id: string
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface FeedFilters {
  gender: string
  school_year: string
  housing_type: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: never
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at'>
        Update: never
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
