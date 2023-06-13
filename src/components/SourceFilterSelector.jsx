import React, { useContext, useEffect } from "react"
import { Row, Space, Radio } from "antd"
import CustomCard from "./CustomCard"
import { UserContext } from "../App"

const ArtistFilterSelector = () => {
	const {
		setIsNextAllowed,
		setSelectedSourceData,
		setSelectedArtistFilter,
		selectedArtistFilter,
	} = useContext(UserContext)

	const handleChange = (e) => {
		setSelectedArtistFilter(e.target.value)
		setSelectedSourceData({})
	}

	useEffect(() => {
		if (selectedArtistFilter) {
			setIsNextAllowed(true)
		} else {
			setIsNextAllowed(false)
		}
	}, [setIsNextAllowed, selectedArtistFilter])

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ paddingTop: "35vh" }}>
				<Radio.Group
					buttonStyle="solid"
					size="large"
					onChange={handleChange}
				>
					<Space direction="vertical">
						<Radio.Button value="topArtists">
							Select top artists
						</Radio.Button>
						<Radio.Button value="playlists">
							Select playlists
						</Radio.Button>
						<Radio.Button value="genres">
							Select genres
						</Radio.Button>
					</Space>
				</Radio.Group>
				{/* <Space direction="vertical">
					<TopArtistSelector />
					<PlaylistSelector />
					<GenreSelector />
				</Space> */}
			</Row>
		</CustomCard>
	)
}

export default ArtistFilterSelector
