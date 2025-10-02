export interface Song {
  musicId: string;
  title: string;
  genres: string[];
  artistIds: string[];
  albumId?: string;
  fileUrl?: string;
  coverUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  rate?:"love" | "like" | "dislike" | null;
  hasTranscript?: boolean;
  transcriptUrl?: string; // S3 URL of JSON/txt transcript
}
