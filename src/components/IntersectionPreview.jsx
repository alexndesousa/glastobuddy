import React, {
	useContext,
	useEffect,
	useState,
	useCallback,
	useRef,
} from "react"
import { UserContext } from "../App"
import { Row, Table, Image, Button, Progress } from "antd"
import CustomCard from "./CustomCard"
import placeholder from "../images/placeholder.jpg"
import {
	createPlaylist,
	addSongsToPlaylist,
	getAllArtistsFromPlaylists,
} from "../services/DiscoveryService"
import { chunkArray } from "../utils/utils"

const IntersectionPreview = () => {
	const [tableData, setTableData] = useState([])
	const [allSongIds, setAllSongIds] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [isCreateloading, setIsCreateLoading] = useState(false)
	const [playlistCreated, setPlaylistCreated] = useState(false)
	const [intersectionTableProgress, setIntersectionTableProgress] =
		useState(0)
	const hasFetchedData = useRef(false)
	const { authHeader, selectedSourceData, userId, setIsNextAllowed } =
		useContext(UserContext)

	const getArtistsFromArtists = useCallback(
		async (setIntersectionTableProgress) => {
			setIntersectionTableProgress(10)
			const body = JSON.stringify({
				artists: selectedSourceData.artists,
			})
			setIntersectionTableProgress(15)
			const allArtists = await fetch(
				"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromArtists",
				{
					method: "POST",
					body: body,
					headers: { "Content-Type": "application/json" },
				}
			)
			setIntersectionTableProgress(60)
			const allArtistsJson = await allArtists.json()
			setIntersectionTableProgress(70)
			const mappedTableData = await allArtistsJson.body.artists
				.map((artist) => {
					return {
						key: artist.name,
						...artist,
						genres: artist.genres.join(", "),
					}
				})
				.sort(({ followers: a }, { followers: b }) => b - a)
			setIntersectionTableProgress(85)
			setTableData(mappedTableData)
			setAllSongIds(allArtistsJson.body.songs)
		},
		[selectedSourceData]
	)

	const getArtistsFromPlaylists = useCallback(
		async (setIntersectionTableProgress) => {
			const artistIds = await getAllArtistsFromPlaylists(
				authHeader,
				selectedSourceData.playlists,
				setIntersectionTableProgress
			)
			const chunkedIds = chunkArray(artistIds, 800) // lets do lots of 800
			let allArtists = []
			let allSongs = []
			const percentageIncrease = 15 / chunkedIds.length
			for await (const chunk of chunkedIds) {
				const body = JSON.stringify({
					artists: chunk,
				})
				const artists = await fetch(
					"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromArtists",
					{
						method: "POST",
						body: body,
						headers: { "Content-Type": "application/json" },
					}
				)
				const artistsJson = await artists.json()
				allArtists = allArtists.concat(artistsJson.body.artists)
				allSongs = allSongs.concat(artistsJson.body.songs)
				setIntersectionTableProgress(
					(current) => current + percentageIncrease
				)
			}
			const mappedTableData = allArtists
				.map((artist) => {
					return {
						key: artist.name,
						...artist,
						genres: artist.genres.join(", "),
					}
				})
				.sort(({ followers: a }, { followers: b }) => b - a)
			setIntersectionTableProgress(98)
			setTableData(mappedTableData)
			setAllSongIds(allSongs)
		},
		[selectedSourceData, authHeader]
	)

	const getArtistsFromGenres = useCallback(
		async (setIntersectionTableProgress) => {
			setIntersectionTableProgress(10)
			const body = JSON.stringify({ genres: selectedSourceData.genres })
			setIntersectionTableProgress(20)
			const allArtists = await fetch(
				"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromGenre",
				{
					method: "POST",
					body: body,
					headers: { "Content-Type": "application/json" },
				}
			)
			setIntersectionTableProgress(25)
			setIntersectionTableProgress(75)
			const allArtistsJson = await allArtists.json()
			setIntersectionTableProgress(85)
			const mappedTableData = await allArtistsJson.body.artists
				.map((artist) => {
					return {
						key: artist.name,
						...artist,
						genres: artist.genres.join(", "),
					}
				})
				.sort(({ followers: a }, { followers: b }) => b - a)
			setIntersectionTableProgress(95)
			setTableData(mappedTableData)
			setAllSongIds(allArtistsJson.body.songs)
		},
		[selectedSourceData]
	)

	const createAndPopulatePlaylist = async () => {
		setIsCreateLoading(true)
		const playlistId = await createPlaylist(authHeader, userId)
		await addSongsToPlaylist(authHeader, playlistId, allSongIds)
		setIsCreateLoading(false)
		setPlaylistCreated(true)
	}

	useEffect(() => {
		if (!hasFetchedData.current) {
			if (selectedSourceData?.artists) {
				hasFetchedData.current = true
				getArtistsFromArtists(setIntersectionTableProgress)
			}
			if (selectedSourceData?.genres) {
				hasFetchedData.current = true
				getArtistsFromGenres(setIntersectionTableProgress)
			}
			if (selectedSourceData?.playlists) {
				hasFetchedData.current = true
				getArtistsFromPlaylists(setIntersectionTableProgress)
			}
		}
	}, [
		getArtistsFromGenres,
		getArtistsFromPlaylists,
		getArtistsFromArtists,
		selectedSourceData,
		hasFetchedData,
	])

	useEffect(() => {
		if (tableData.length > 0) {
			setIsTableLoading(false)
			setIntersectionTableProgress(100)
		}
	}, [tableData])

	useEffect(() => {
		setIsNextAllowed(false)
	})

	const tableLoading = {
		spinning: isTableLoading,
		indicator: (
			<Progress
				type="circle"
				size="small"
				percent={intersectionTableProgress}
			/>
		),
	}

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "80vh" }}>
				<Table
					loading={tableLoading}
					dataSource={tableData}
					scroll={{ y: 500 }}
					columns={[
						{
							title: "Art",
							dataIndex: "artwork",
							render: (imageUrl) => (
								<Image
									src={imageUrl ?? placeholder}
									width={50}
									preview={false}
									placeholder={
										<Image
											preview={false}
											width={50}
											src={placeholder}
										/>
									}
								/>
							),
						},
						{
							title: "Name",
							dataIndex: "name",
							key: "name",
						},
						{
							title: "Genres",
							dataIndex: "genres",
							key: "genres",
						},
						{
							title: "Followers",
							dataIndex: "followers",
							key: "followers",
						},
					]}
				/>
				<Button
					type="primary"
					onClick={createAndPopulatePlaylist}
					loading={isCreateloading}
					disabled={playlistCreated}
				>
					{!playlistCreated
						? "create playlist"
						: "playlist created :)"}
				</Button>
			</Row>
		</CustomCard>
	)
}

export default IntersectionPreview
