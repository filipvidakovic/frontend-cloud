export interface AlbumCardProps {
  albumId: string;
  genres: string[];
  titleList: string[];
  coverUrl: string;
  musicIds: string[];
}
export interface AlbumListProps {
  albums: AlbumCardProps[];
  onDeleted?: (albumId: string) => void; 
}
