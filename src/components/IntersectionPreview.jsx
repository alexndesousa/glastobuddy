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
import { chunkArray, round } from "../utils/utils"

const IntersectionPreview = () => {
	const [tableData, setTableData] = useState([])
	const [allSongIds, setAllSongIds] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [isCreateloading, setIsCreateLoading] = useState(false)
	const [playlistCreated, setPlaylistCreated] = useState(false)
	const [intersectionTableProgress, setIntersectionTableProgress] =
		useState(0)
	const hasFetchedIntersectionData = useRef(false)
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
			//dedupe
			setIntersectionTableProgress(85)
			setTableData([...new Set(mappedTableData)])
			setAllSongIds([...new Set(allArtistsJson.body.songs)])
		},
		[selectedSourceData]
	)

	const getArtistsFromArtistsGenres = useCallback(async () => {
		setIntersectionTableProgress(10)
		const bodyA = JSON.stringify({
			artists: selectedSourceData.artists,
		})
		setIntersectionTableProgress(15)
		const allArtistsA = await fetch(
			"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromArtists",
			{
				method: "POST",
				body: bodyA,
				headers: { "Content-Type": "application/json" },
			}
		)
		setIntersectionTableProgress(60)
		const allArtistsJsonA = await allArtistsA.json()
		const allArtistsGenres = await allArtistsJsonA.body.artists
			.map(({ genres }) => genres)
			.flat()

		const bodyB = JSON.stringify({ genres: allArtistsGenres })
		const allArtistsB = await fetch(
			"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromGenre",
			{
				method: "POST",
				body: bodyB,
				headers: { "Content-Type": "application/json" },
			}
		)
		setIntersectionTableProgress(75)
		const allArtistsJsonB = await allArtistsB.json()
		setIntersectionTableProgress(85)
		const mappedTableData = await allArtistsJsonB.body.artists
			.map((artist) => {
				return {
					key: artist.name,
					...artist,
					genres: artist.genres.join(", "),
				}
			})
			.sort(({ followers: a }, { followers: b }) => b - a)
		setIntersectionTableProgress(95)
		setTableData([...new Set(mappedTableData)])
		setAllSongIds([...new Set(allArtistsJsonB.body.songs)])
	}, [selectedSourceData])

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
			const percentageIncrease = round(15 / chunkedIds.length, 2)
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
			setTableData([...new Set(mappedTableData)])
			setAllSongIds([...new Set(allSongs)])
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
			setTableData([...new Set(mappedTableData)])
			setAllSongIds([...new Set(allArtistsJson.body.songs)])
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
		if (!hasFetchedIntersectionData.current) {
			if (selectedSourceData?.artists) {
				hasFetchedIntersectionData.current = true
				if (selectedSourceData?.type === "artist_name") {
					getArtistsFromArtists(setIntersectionTableProgress)
				} else {
					getArtistsFromArtistsGenres(setIntersectionTableProgress)
				}
			}
			if (selectedSourceData?.genres) {
				hasFetchedIntersectionData.current = true
				getArtistsFromGenres(setIntersectionTableProgress)
			}
			if (selectedSourceData?.playlists) {
				hasFetchedIntersectionData.current = true
				getArtistsFromPlaylists(setIntersectionTableProgress)
			}
		}
	}, [
		getArtistsFromGenres,
		getArtistsFromPlaylists,
		getArtistsFromArtists,
		getArtistsFromArtistsGenres,
		selectedSourceData,
		hasFetchedIntersectionData,
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
