import { Image, Row, Table, Input, Checkbox, Progress } from "antd"
import React, { useEffect, useState, useContext, useRef } from "react"
import { getUsersPlaylists } from "../services/DiscoveryService"
import placeholder from "../images/placeholder.jpg"
import { UserContext } from "../App"
import CustomCard from "./CustomCard"

const PlaylistSelector = () => {
	const [usersPlaylists, setUsersPlaylists] = useState([])
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [tableData, setTableData] = useState([])
	const [playlistsTableProgress, setPlaylistsTableProgress] = useState(0)
	const hasFetchedPlaylistsData = useRef(false)
	const {
		authHeader,
		selectedSourceData,
		setSelectedSourceData,
		setIsNextAllowed,
		userId,
	} = useContext(UserContext)

	useEffect(() => {
		if (usersPlaylists !== []) {
			setTableData(
				usersPlaylists.map(
					({ images, name, tracks: { href, total } }) => {
						return {
							key: href, // request url to get track list
							coverArtUrl: images[0]?.url,
							name: name,
							numberOfTracks: total,
						}
					}
				)
			)
		}
	}, [usersPlaylists])

	useEffect(() => {
		if (tableData.length === 0 && !hasFetchedPlaylistsData.current) {
			hasFetchedPlaylistsData.current = true
			search()
		}
	})

	const search = async () => {
		const playlists = await getUsersPlaylists(
			authHeader,
			userId,
			setPlaylistsTableProgress
		)
		setUsersPlaylists(playlists)
	}

	useEffect(() => {
		if (tableData.length > 0) {
			setIsTableLoading(false)
		}
	}, [tableData])

	useEffect(() => {
		if (Object.keys(selectedSourceData).length > 0) {
			setIsNextAllowed(true)
		} else {
			setIsNextAllowed(false)
		}
	}, [selectedSourceData, setIsNextAllowed])

	useEffect(() => {
		if (selectedRowKeys.length > 0) {
			setSelectedSourceData({ playlists: selectedRowKeys })
		}
	}, [selectedRowKeys, setSelectedSourceData])

	// vvvvvvvvvvvvvvv no clue what this shit does vvvvvvvvvvvvvvv
	const handleSelect = (record, selected) => {
		if (selected) {
			setSelectedRowKeys((keys) => [...keys, record.key])
		} else {
			setSelectedRowKeys((keys) => {
				const index = keys.indexOf(record.key)
				return [...keys.slice(0, index), ...keys.slice(index + 1)]
			})
		}
	}

	const toggleSelectAll = () => {
		setSelectedRowKeys((keys) =>
			keys.length === tableData.length ? [] : tableData.map((r) => r.key)
		)
	}

	const headerCheckbox = (
		<Checkbox
			checked={selectedRowKeys.length}
			indeterminate={
				selectedRowKeys.length > 0 &&
				selectedRowKeys.length < tableData.length
			}
			onChange={toggleSelectAll}
		/>
	)

	const rowSelection = {
		selectedRowKeys,
		type: "checkbox",
		fixed: true,
		onSelect: handleSelect,
		columnTitle: headerCheckbox,
	}
	// ^^^^^^^^^^^^^^^ no clue what this shit does ^^^^^^^^^^^^^^^
	const tableLoading = {
		spinning: isTableLoading,
		indicator: (
			<Progress
				type="circle"
				size="small"
				percent={playlistsTableProgress}
			/>
		),
	}

	const filterPlaylists = (search) => {
		const filtered = usersPlaylists
			.filter(({ name: playlistName }) => {
				const searchValue = search.currentTarget.value
					.toString()
					.toLowerCase()
				return playlistName
					.toString()
					.toLowerCase()
					.includes(searchValue)
			})
			.map(({ images, name, tracks: { href, total } }) => {
				return {
					key: href, // request url to get track list
					coverArtUrl: images[0]?.url,
					name: name,
					numberOfTracks: total,
				}
			})
		setTableData(filtered)
	}

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "85vh" }}>
				<Input
					type="primary"
					onChange={filterPlaylists}
					placeholder="Search playlists"
				/>
				<Table
					loading={tableLoading}
					dataSource={tableData}
					scroll={{ y: 500 }}
					columns={[
						{
							title: "Cover art",
							dataIndex: "coverArtUrl",
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
							title: "Number of tracks",
							dataIndex: "numberOfTracks",
							key: "numberOfTracks",
						},
					]}
					rowSelection={rowSelection}
				/>
			</Row>
		</CustomCard>
	)
}

export default PlaylistSelector
