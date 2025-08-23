export interface AlbumCardProps {
  albumId: string;
  genre: string;
  titleList: string[];
}
export interface AlbumListProps {
  albums: AlbumCardProps[];
}
