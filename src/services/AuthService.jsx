import { generateRandomString } from "../utils/utils"

const authenticateUser = () => {
	const client_id = "3b71f701222a46a680a798205c915759"
	const redirect_uri = "https://alexndesousa.github.io/glastobuddy"
	const scope =
		"user-top-read user-read-private user-read-email playlist-modify-public playlist-read-private playlist-modify-private"
	const state = generateRandomString(16)
	const url =
		"https://accounts.spotify.com/authorize?response_type=token" +
		"&client_id=" +
		encodeURIComponent(client_id) +
		"&scope=" +
		encodeURIComponent(scope) +
		"&redirect_uri=" +
		encodeURIComponent(redirect_uri) +
		"&state=" +
		encodeURIComponent(state)
	window.location = url
}

const decodeURLParameters = () => {
	const queryString = window.location.hash.substring(1)
	let query = {}
	let pairs = queryString.split("&")
	for (let i = 0; i < pairs.length; i++) {
		let pair = pairs[i].split("=")
		query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
	}
	return query
}

const getAuthorizationHeader = () => {
	const authInfo = decodeURLParameters()
	return {
		Authorization: " " + authInfo.token_type + " " + authInfo.access_token,
	}
}

export { authenticateUser, getAuthorizationHeader }
