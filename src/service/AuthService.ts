import ArtistExplorerClient from "./ArtistExplorerClient";

function login() {
  ArtistExplorerClient.get("/login", {withCredentials: true})
}

function getAccessToken(code: string, state: string) {
  ArtistExplorerClient.get("/callback", {
    params: {
      code,
      state
    },
    withCredentials: true
  })
}

const AuthService = {
  login,
  getAccessToken
}

export default AuthService
