export interface AlbumCardProps {
  albumId: string;
  genre: string;
  titleList: string[];
  coverUrl: string;
}
export interface AlbumListProps {
  albums: AlbumCardProps[];
}
