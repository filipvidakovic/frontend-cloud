export interface AlbumCardProps {
  albumId: string;
  genre: string;
  titleList: string[];
  coverUrl: string;
  musicIds: string[];  
}
export interface AlbumListProps {
  albums: AlbumCardProps[];
  genre: string;     
}
