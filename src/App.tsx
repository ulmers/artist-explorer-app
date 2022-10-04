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
            <Route path="/" element={
                <Card title="Login">
                  <Button href={`${import.meta.env.VITE_API_BASE_URL}/login`} type="link">Spotify</Button>
                </Card>
              }
            />
            <Route path="/callback" element={<AccessTokenRetriever/>}/>
            <Route path="collect-token" element={<AccessTokenCollector/>}/>
            <Route path="/artist-explorer" element={<ArtistExplorer/>}></Route>
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

  const fetchAccessToken = useCallback( () => {

    if (code && state) {
      AuthService.getAccessToken(code, state)
    }
  }, [])

  useEffect(() => {
    fetchAccessToken()
  }, [])
  return (
    <>Loading</>
  )
}

function AccessTokenCollector() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  useEffect(() => {
    localStorage.setItem("access_token", params.get("access_token") || '')
    localStorage.setItem("refresh_token", params.get("refresh_token") || '')
    window.history.pushState({}, '', '/artist-explorer')
  }, [])
  return (
    <>Collecting</>
  )
}

function ArtistExplorer() {
  return (
    <></>
  )
}

export default App
