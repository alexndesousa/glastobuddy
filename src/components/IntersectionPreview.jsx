import React, { useContext, useEffect, useState, useCallback } from "react"
import { UserContext } from "../App"
import { Row, Table, Image, Button } from "antd"
import CustomCard from "./CustomCard"
import placeholder from "../images/placeholder.jpg"
import {
	createPlaylist,
	addSongsToPlaylist,
	getAllArtistsFromPlaylists,
} from "../services/DiscoveryService"

const IntersectionPreview = () => {
	const [tableData, setTableData] = useState([])
	const [allSongIds, setAllSongIds] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [isCreateloading, setIsCreateLoading] = useState(false)
	const [playlistCreated, setPlaylistCreated] = useState(false)
	const { authHeader, selectedSourceData, userId } = useContext(UserContext)

	const getArtistsFromArtists = useCallback(async () => {
		const body = JSON.stringify({
			artists: selectedSourceData.artists,
		})
		console.log(selectedSourceData.artists)
		const allArtists = await fetch(
			"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromArtists",
			{
				method: "POST",
				body: body,
				headers: { "Content-Type": "application/json" },
			}
		)
		const allArtistsJson = await allArtists.json()
		const mappedTableData = await allArtistsJson.body.artists
			.map((artist) => {
				return {
					key: artist.name,
					...artist,
					genres: artist.genres.join(", "),
				}
			})
			.sort(({ followers: a }, { followers: b }) => b - a)
		setTableData(mappedTableData)
		setAllSongIds(allArtistsJson.body.songs)
	}, [selectedSourceData])

	const getArtistsFromPlaylists = useCallback(async () => {
		const artistIds = await getAllArtistsFromPlaylists(
			authHeader,
			selectedSourceData.playlists
		)
		console.log("artistids")
		console.log(artistIds)
		const body = JSON.stringify({
			artists: artistIds,
		})
		const allArtists = await fetch(
			"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromArtists",
			{
				method: "POST",
				body: body,
				headers: { "Content-Type": "application/json" },
			}
		)
		const allArtistsJson = await allArtists.json()
		const mappedTableData = await allArtistsJson.body.artists
			.map((artist) => {
				return {
					key: artist.name,
					...artist,
					genres: artist.genres.join(", "),
				}
			})
			.sort(({ followers: a }, { followers: b }) => b - a)
		setTableData(mappedTableData)
		setAllSongIds(allArtistsJson.body.songs)
	}, [selectedSourceData, authHeader])

	const getArtistsFromGenres = useCallback(async () => {
		const body = JSON.stringify({ genres: selectedSourceData.genres })
		const allArtists = await fetch(
			"https://api.glastobuddy.com:8080/getAllSongsForArtistsFromGenre",
			{
				method: "POST",
				body: body,
				headers: { "Content-Type": "application/json" },
			}
		)
		const allArtistsJson = await allArtists.json()
		const mappedTableData = await allArtistsJson.body.artists
			.map((artist) => {
				return {
					key: artist.name,
					...artist,
					genres: artist.genres.join(", "),
				}
			})
			.sort(({ followers: a }, { followers: b }) => b - a)
		setTableData(mappedTableData)
		setAllSongIds(allArtistsJson.body.songs)
	}, [selectedSourceData])

	const createAndPopulatePlaylist = async () => {
		setIsCreateLoading(true)
		const playlistId = await createPlaylist(authHeader, userId)
		await addSongsToPlaylist(authHeader, playlistId, allSongIds)
		setIsCreateLoading(false)
		setPlaylistCreated(true)
	}

	useEffect(() => {
		if (selectedSourceData?.artists) {
			getArtistsFromArtists()
		}
		if (selectedSourceData?.genres) {
			getArtistsFromGenres()
		}
		if (selectedSourceData?.playlists) {
			getArtistsFromPlaylists()
		}
	}, [
		getArtistsFromGenres,
		getArtistsFromPlaylists,
		getArtistsFromArtists,
		selectedSourceData,
	])

	useEffect(() => {
		if (tableData.length > 0) {
			setIsTableLoading(false)
		}
	}, [tableData])

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "80vh" }}>
				<Table
					loading={isTableLoading}
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
