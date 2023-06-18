import { useEffect, useState, createContext } from "react"
import "./App.css"
import { getAuthorizationHeader } from "./services/AuthService"
import Authenticate from "./components/Authenticate"
import ArtistFilterSelector from "./components/SourceFilterSelector"
import IntersectionPreview from "./components/IntersectionPreview"
import TopArtistSelector from "./components/TopArtistSelector"
import PlaylistSelector from "./components/PlaylistSelector"
import GenreSelector from "./components/GenreSelector"

export const UserContext = createContext()

const App = () => {
	const [authHeader, setAuthHeader] = useState({})
	const [isAdmin, setIsAdmin] = useState(false)
	const [userId, setUserId] = useState("")
	const [showAuth, setShowAuth] = useState(true)
	const [currentPage, setCurrentPage] = useState(0)
	const [selectedArtistFilter, setSelectedArtistFilter] = useState(null)
	const [isNextAllowed, setIsNextAllowed] = useState(false)
	const [selectedSourceData, setSelectedSourceData] = useState({})

	const renderSwitch = () => {
		switch (currentPage) {
			case 0:
				return <Authenticate />
			case 1:
				return <ArtistFilterSelector />
			case 2:
				if (selectedArtistFilter === "topArtists") {
					return <TopArtistSelector />
				}
				if (selectedArtistFilter === "playlists") {
					return <PlaylistSelector />
				}
				return <GenreSelector />
			case 3:
				return <IntersectionPreview />
			default:
				return <></>
		}
	}

	useEffect(() => {
		if (authHeader !== []) {
			fetch("https://api.spotify.com/v1/me", { headers: authHeader })
				.then((res) => res.json())
				.then((json) => {
					if (json.id === "alex31734") {
						setIsAdmin(true)
					}
					setUserId(json.id)
				})
		}
	}, [authHeader])

	useEffect(() => {
		if (window.location.href.includes("#access_token=")) {
			setAuthHeader(getAuthorizationHeader())
			setShowAuth(false)
			setIsNextAllowed(true)
		}
	}, [])

	return (
		<div className="App" style={{ background: "#B99976" }}>
			<UserContext.Provider
				value={{
					isAdmin,
					authHeader,
					showAuth,
					currentPage,
					setCurrentPage,
					setIsNextAllowed,
					isNextAllowed,
					selectedSourceData,
					setSelectedSourceData,
					userId,
					selectedArtistFilter,
					setSelectedArtistFilter,
				}}
			>
				{renderSwitch()}
			</UserContext.Provider>
		</div>
	)
}

export default App
