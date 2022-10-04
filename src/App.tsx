import './App.css'
import 'antd/dist/antd.css';
import {Button, Card, Layout} from "antd";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom"
import {useCallback, useEffect} from "react";
import AuthService from "./service/AuthService";

const {Header, Content} = Layout


function App() {

  return (
    <Layout>
      <Header></Header>
      <Content>
        <Router>
          <Routes>
            <Route path="" element={
                <Card title="Login">
                  <Button href={`${import.meta.env.VITE_API_BASE_URL}/login`} type="link">Spotify</Button>
                </Card>
              }
            />
            <Route path="callback/*" element={<AccessTokenRetriever/>}/>
            <Route path="artist-explorer" element={<ArtistExplorer/>}></Route>
          </Routes>
        </Router>
      </Content>
    </Layout>
  )
}

function AccessTokenRetriever(){

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const code = params.get("code")
  const state = params.get("state")

  const fetchAccessToken = useCallback( async () => {

    if (code && state) {
      const tokens = await AuthService.getAccessToken(
        code,
        state
      )
      localStorage.setItem(
        "access_token",
        tokens.access_token
      )
      localStorage.setItem(
        "refresh_token",
        tokens.refresh_token
      )
      window.history.pushState(
        {},
        '',
        '/artist-explorer'
      )
    }
  }, [])

  useEffect(() => {
    fetchAccessToken()
  }, [])
  return (
    <>Loading</>
  )
}

function ArtistExplorer() {
  return (
    <></>
  )
}

export default App
