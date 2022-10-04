import ArtistExplorerClient from "./ArtistExplorerClient";

function login() {
  ArtistExplorerClient.get("/login")
}

function getAccessToken(code: string, state: string) {
  ArtistExplorerClient.get("/callback", {
    params: {
      code,
      state
    }
  })
}

const AuthService = {
  login,
  getAccessToken
}

export default AuthService
