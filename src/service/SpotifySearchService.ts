import SpotifyClient from "./SpotifyClient";
import ArtistDto from "./ArtistDto";

async function search(value: string, type: string) {
  const resp = await SpotifyClient.get<{ artists: { items: ArtistDto[] } }>(
    "v1/search",
    {
      params: {
        type: type,
        q: value
      },
      headers: {
        "Authorization": 'Bearer ' + localStorage.getItem("access_token") || ""
      }
    }
  )

  return resp.data.artists.items
}

const SpotifyService = {
  search
}

export default SpotifyService
