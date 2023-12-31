export const chunkArray = (array, size) => {
	let newArray = []
	for (let i = 0; i < array.length; i += size) {
		newArray.push(array.slice(i, i + size))
	}
	return newArray
}

export const generateRandomString = (length) => {
	let text = ""
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	while (text.length <= length) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}

	return text
}

export const round = (number, decimalPlaces) => {
	return +(Math.round(number + "e+" + decimalPlaces) + "e-" + decimalPlaces)
}
