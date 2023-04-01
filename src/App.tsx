import './App.css'
import 'antd/dist/antd.css';
import {AutoComplete, Button, Card, Input, Layout} from "antd";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom"
import React, {useCallback, useEffect, useRef, useState} from "react";
import AuthService from "./service/AuthService";
import SpotifySearchService from "./service/SpotifySearchService";
import ArtistDto from "./service/ArtistDto";
import G6, {Graph, GraphData, IG6GraphEvent} from '@antv/g6';
import SpotifyArtistService from "./service/SpotifyArtistService";

const {Header, Content} = Layout


function App() {

  return (
    <Layout>
      <Header></Header>
      <Content style={{width: "100%", height: "calc(100vh - 64px)"}}>
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
      if (!tokens.access_token) {
        return
      }
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


let graph: Graph | null = null

function ArtistExplorer() {

  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const [graphData, setGraphData] = useState<GraphData>({nodes: [], edges: []})

  const [selectedArtist, setSelectedArtist] = useState<ArtistDto>()
  const [options, setOptions] = useState<ArtistDto[]>()

  const handleSelect = (value: string) => {
    const artist = options?.find(a => a.name = value)
    setSelectedArtist({...artist} as ArtistDto)
  }

  useEffect(() => {
    console.log(options)
  }, [options])

  const handleSearch = async (value: string) => {

    if (value.length < 1) {
      return
    }

    const artists = await SpotifySearchService.search(
      value,
      "artist"
    )

    setOptions(artists)
  }

  const artistSelectedStyle: React.CSSProperties = {position: "absolute", top: 24, left: 24, width: 300, zIndex: 100}
  const noArtistSelectedStyle: React.CSSProperties = {width: 300, zIndex: 100}

  const fetchRelatedArtists = useCallback(async (e: IG6GraphEvent) => {

    const {item} = e

    if (!item) {
      return
    }

    const nodeId = item.getID()

    const relatedArtists = await SpotifyArtistService.getRelatedArtists(nodeId)

    relatedArtists.forEach(ra => {
      if (!graphData.nodes?.find(n => n.id === ra.id)) {
        graphData.nodes = graphData.nodes?.concat({
          id: ra.id,
          label: ra.name
        })
      }
    })

    relatedArtists?.forEach(ra => {
      if (!graphData.edges?.find(e => (e.source === nodeId && e.target === ra.id) || e.source === ra.id &&
        e.target === nodeId)) {
        graphData.edges = graphData.edges?.concat({
          source: nodeId,
          target: ra.id
        })
      }
    })

    setGraphData({...graphData})

  }, [graphData])

  const handleNodeMouseEnter = useCallback((e: IG6GraphEvent) => {

    const node = e.item

    if (!node) {
      return
    }

    graph?.getEdges().forEach(e => {

      if (e.getSource().getID() === node.getID() || e.getTarget().getID() === node.getID()) {

        e.update({
          style: {
            lineWidth: 4,
            stroke: "black"
          },
          ...e.getModel()
        })
      }
    })

    setGraphData({edges: [...graphData.edges || []], ...graphData})
  }, [graphData])

  const handleNodeMouseLeave = useCallback((e: IG6GraphEvent) => {

    graphData.edges?.forEach(e => {
      if (e.style) {
        e.style.lineWidth = 2
        e.style.stroke = "#00FF00"
      }
    })
    setGraphData({edges: [...graphData.edges || []], ...graphData})
  }, [graphData])


  useEffect(() => {
    if (!graph && graphContainerRef.current) {
      graph = new G6.Graph({
        container: graphContainerRef.current,
        width: graphContainerRef.current?.clientWidth,
        height: graphContainerRef.current?.clientHeight,
        modes: {
          default: ['drag-canvas'],
        },
        layout: {
          type: 'force',
          nodeStrength: 10,
          edgeStrength: 0.1,
          collideStrength: 0.8,
          preventOverlap: true,
          nodeSpacing: 10,
          alpha: 0.3,
          alphaDecay: 0.028,
          alphaMin: 0.01,
          forceSimulation: null,
        },
        defaultNode: {
          type: 'node',
          labelCfg: {
            style: {
              fill: '#FFFFFF',
              fontSize: 10,
            },
          },
          style: {
            fill: "#000000",
            stroke: '#72CC4A',
          },
          size: 40
        },
        defaultEdge: {
          type: 'line',
          style: {
            stroke: "#707070"
          }
        },
      });
      graph && graph.data(graphData)
      graph && graph.render();
    }
  }, []);


  useEffect(() => {

    if (!selectedArtist) {
      return
    }

    graph?.addItem("node",
      {
        id: selectedArtist.id,
        label: selectedArtist.name,
        x: 200,
        y: 200
      })

    selectedArtist.genres.forEach(g => {

      graph?.createHull({
        id: g,
        members: [selectedArtist.id],
        type: "bubble",
        padding: 10,
        style: {
          fill: "#FF0000"
        }
      })
    })

  }, [selectedArtist])

  useEffect(() => {

    console.log(graphData)

    if (!graphData || !graph) {
      return
    }

    graph.changeData(graphData)
    graph.on("node:click", fetchRelatedArtists)
    graph.on("node:mouseenter", handleNodeMouseEnter)
    graph.on("node:mouseleave", handleNodeMouseLeave)
    return () => {
      if (!graph) {
        return
      }
      graph.off("node:click", fetchRelatedArtists)
      graph.off("node:mouseenter", handleNodeMouseEnter)
      graph.off("node:mouseleave", handleNodeMouseLeave)
    }
  }, [graphData])

  return (
    <>
      <div style={{position: "relative", height: "100%", width: "100%"}}>
        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "100%"}}>
          <div style={{position: "relative", top: 0, left: 0, height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <AutoComplete
              style={selectedArtist ? artistSelectedStyle : noArtistSelectedStyle}
              options={options?.map(a => { return {value: a.name, key: a.id}})}
              onSelect={handleSelect}
              onSearch={handleSearch}
            >
            </AutoComplete>
          </div>
        </div>
        <div ref={graphContainerRef} style={{position: "absolute", top: 0, left: 0,height: "100%", width: "100%"}}></div>
      </div>
    </>
  )
}

export default App
