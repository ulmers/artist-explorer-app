import SpotifyClient from "./SpotifyClient";
import ArtistDto from "./ArtistDto";

async function getRelatedArtists(id: string) {
  const resp = await SpotifyClient.get<{artists: ArtistDto[]}>(
    `v1/artists/${id}/related-artists`,
    {
      headers: {
        "Authorization": 'Bearer ' + localStorage.getItem("access_token") || ""
      }
    }
  )

  return resp.data.artists
}

const SpotifyArtistService = {
getRelatedArtists
}

export default SpotifyArtistService
