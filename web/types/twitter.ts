export interface TweetMedia {
  type: "photo" | "video" | "animated_gif";
  url: string;
  preview_url: string | null;
  alt_text: string | null;
}

export interface TweetEngagement {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number;
}

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_verified: boolean;
  created_at: string | null;
  engagement: TweetEngagement;
  media: TweetMedia[];
  quoted_tweet: Tweet | null;
  reply_to_id: string | null;
  reply_to_handle: string | null;
  conversation_id: string | null;
  language: string | null;
  source: string | null;
  is_retweet: boolean;
  retweeted_by: string | null;
  url: string | null;
  tweet_url: string;
}

export interface TimelineResponse {
  tweets: Tweet[];
  cursor_top: string | null;
  cursor_bottom: string | null;
  has_more: boolean;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  created_at: string | null;
  profile_image_url: string;
  profile_banner_url: string;
  pinned_tweet_id: string | null;
}

export interface DMConversation {
  id: string;
  type: string;
  participants: Array<{ name?: string; handle?: string; screen_name?: string }>;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

export interface TrendingTopic {
  name: string;
  tweet_count?: number | null;
  category?: string | null;
  url?: string | null;
}

export interface TwitterList {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
  owner_id: string;
  owner_handle: string;
}

export interface ScheduledTweet {
  id: string;
  text: string;
  scheduled_at: string;
  state: string;
}

export interface McpError {
  error: string;
  type?: string;
  status_code?: number;
  retry?: boolean;
}
