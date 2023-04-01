import ImageDto from "./ImageDto";

export default interface ArtistDto {
  id: string
  name: string
  images: ImageDto[]
  genres: string[]
}
