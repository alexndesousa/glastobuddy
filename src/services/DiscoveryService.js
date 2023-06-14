import { chunkArray } from "../utils/utils"

const baseUrl = "https://api.spotify.com/v1"

export const getUsersPlaylists = async (header, setPlaylistsTableProgress) => {
	let res = await fetch(baseUrl + "/me/playlists?limit=50", {
		headers: header,
	})
	let resJson = await res.json()
	const total = resJson?.total
	const percentageIncrease = Math.floor(80 / (total / 50))
	let allPlaylists = resJson.items
	while (resJson.next) {
		console.log(allPlaylists)
		res = await fetch(resJson.next, { headers: header })
		resJson = await res.json()
		allPlaylists = allPlaylists.concat(resJson.items)
		setPlaylistsTableProgress((current) => current + percentageIncrease)
		await new Promise((resolve) => setTimeout(resolve, 400))
	}
	return allPlaylists
}

export const getUsersTopArtists = async (
	header,
	timeRange,
	setTopArtistsTableProgress
) => {
	let res = await fetch(
		baseUrl + `/me/top/artists?time_range=${timeRange}&limit=50`,
		{
			headers: header,
		}
	)
	let resJson = await res.json()
	const total = resJson?.total
	const percentageIncrease = Math.floor(80 / (total / 50))
	let allArtists = resJson.items
	while (resJson.next) {
		res = await fetch(resJson.next, { headers: header })
		resJson = await res.json()
		allArtists = allArtists.concat(resJson.items)
		setTopArtistsTableProgress((current) => current + percentageIncrease)
		await new Promise((resolve) => setTimeout(resolve, 400))
	}
	return allArtists
}

//playlists already stored in setUsersPlaylists
// setSelectedSourceData({ playlists: selectedRowKeys }) <- selectedRowKeys is the href

export const getArtistsFromPlaylist = async (
	header,
	playlist,
	setIntersectionTableProgress,
	overallPercentage
) => {
	let res = await fetch(`${playlist}?limit=50`, { headers: header }) // items stores data. //next is next link
	let resJson = await res.json()
	const total = resJson?.total
	const percentageIncrease = Math.floor(overallPercentage / (total / 50))
	let allArtists = await resJson?.items?.map(({ track: { artists } }) =>
		artists.map(({ href }) => href)
	)
	while (resJson?.next) {
		res = await fetch(resJson.next, { headers: header })
		resJson = await res.json()
		allArtists = await allArtists.concat(
			resJson?.items?.map(({ track: { artists } }) =>
				artists.map(({ href }) => href)
			)
		)
		setIntersectionTableProgress((current) => current + percentageIncrease)
		await new Promise((resolve) => setTimeout(resolve, 400))
	}
	return await allArtists.flat()
}

export const getAllArtistsFromPlaylists = async (
	header,
	playlists,
	setIntersectionTableProgress
) => {
	const overallPercentage = Math.floor(80 / playlists.length)
	let allArtists = []
	for await (const playlist of playlists) {
		const artists = await getArtistsFromPlaylist(
			header,
			playlist,
			setIntersectionTableProgress,
			overallPercentage
		)
		allArtists = allArtists.concat(artists)
	}
	return allArtists
}

export const createPlaylist = async (header, userId) => {
	const parameterisedUrl = `${baseUrl}/users/${userId}/playlists`

	const body = {
		name: "glastobuddy",
		description: "lets get groovy",
	}

	const options = {
		method: "POST",
		body: JSON.stringify(body),
		headers: header,
	}

	const createdPlaylist = await fetch(parameterisedUrl, options)
	const createdPlaylistJson = await createdPlaylist.json()
	return createdPlaylistJson.id
}

export const addSongsToPlaylist = async (header, playlistId, songs) => {
	const parameterisedUrl = `${baseUrl}/playlists/${playlistId}/tracks`

	const chunked = chunkArray(songs, 100)

	for (const chunk of chunked) {
		const body = {
			uris: chunk,
		}

		const options = {
			method: "POST",
			body: JSON.stringify(body),
			headers: header,
		}

		await fetch(parameterisedUrl, options)
		await new Promise((resolve) => setTimeout(resolve, 700))
	}
}
