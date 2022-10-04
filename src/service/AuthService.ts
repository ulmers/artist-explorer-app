import ArtistExplorerClient from "./ArtistExplorerClient";

function login() {
  ArtistExplorerClient.get("/login", {withCredentials: true})
}

async function getAccessToken(code: string, state: string) {
  const resp = await ArtistExplorerClient.get<{ access_token: string, refresh_token: string }>(
    "/callback",
    {
      params: {
        code,
        state
      },
      withCredentials: true
    }
  )

  return resp.data
}

const AuthService = {
  login,
  getAccessToken
}

export default AuthService
