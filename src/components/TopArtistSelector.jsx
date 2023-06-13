import {
	Image,
	Row,
	Table,
	Input,
	Select,
	Space,
	Tooltip,
	Checkbox,
} from "antd"
import React, { useEffect, useState, useContext } from "react"
import { getUsersTopArtists } from "../services/DiscoveryService"
import placeholder from "../images/placeholder.jpg"
import { UserContext } from "../App"
import CustomCard from "./CustomCard"

const TopArtistSelector = () => {
	const [usersTopArtists, setUsersTopArtists] = useState([])
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [tableData, setTableData] = useState([])
	const {
		authHeader,
		selectedSourceData,
		setSelectedSourceData,
		setIsNextAllowed,
	} = useContext(UserContext)

	useEffect(() => {
		if (tableData.length > 0) {
			setIsTableLoading(false)
		}
	}, [tableData])

	useEffect(() => {
		if (selectedRowKeys.length > 0) {
			setSelectedSourceData({ artists: selectedRowKeys })
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

	useEffect(() => {
		if (usersTopArtists !== []) {
			setTableData(
				usersTopArtists.map(({ images, name, genres, href }) => {
					return {
						key: href, // request url to get track list
						artistImageUrl: images[0]?.url,
						name: name,
						genres: genres.join(", "),
					}
				})
			)
		}
	}, [usersTopArtists])

	useEffect(() => {
		if (tableData.length === 0) {
			search("medium_term")
		}
	})

	useEffect(() => {
		if (Object.keys(selectedSourceData).length > 0) {
			setIsNextAllowed(true)
		} else {
			setIsNextAllowed(false)
		}
	}, [selectedSourceData, setIsNextAllowed])

	const search = (timeRange) => {
		getUsersTopArtists(authHeader, timeRange).then((artists) => {
			setUsersTopArtists(artists)
		})
	}

	const filterArtists = (search) => {
		const filtered = usersTopArtists
			.filter(({ name: artistName }) => {
				const searchValue = search.currentTarget.value
					.toString()
					.toLowerCase()
				return artistName.toString().toLowerCase().includes(searchValue)
			})
			.map(({ images, name, genres, href }) => {
				return {
					key: href, // request url to get track list
					artistImageUrl: images[0]?.url,
					name: name,
					genres: genres.join(", "),
				}
			})
		setTableData(filtered)
	}

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "85vh" }}>
				<Space.Compact block>
					<Input
						type="primary"
						onChange={filterArtists}
						placeholder="Search artists"
					/>
					<Tooltip
						title={
							"short_term - past 3 months medium_term - past 6 months long_term - all time"
						}
					>
						<Select
							defaultValue="medium_term"
							onChange={(value) => search(value)}
							options={[
								{ value: "short_term", label: "short_term" },
								{ value: "medium_term", label: "medium_term" },
								{ value: "long_term", label: "long_term" },
							]}
						/>
					</Tooltip>
				</Space.Compact>
				<Table
					loading={isTableLoading}
					dataSource={tableData}
					scroll={{ y: 500 }}
					columns={[
						{
							title: "Art",
							dataIndex: "artistImageUrl",
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
					]}
					rowSelection={rowSelection}
				/>
			</Row>
		</CustomCard>
	)
}

export default TopArtistSelector
