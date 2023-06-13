import React, { useContext, useState } from "react"
import { Button, Modal, Table, Input, Tooltip, Space } from "antd"
import { UserContext } from "../App"
import { CloudSyncOutlined } from "@ant-design/icons"

const GlastoArtists = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [allArtists, setAllArtists] = useState([])
	const [tableData, setTableData] = useState([])
	const { isAdmin } = useContext(UserContext)

	const showModal = () => {
		setIsModalOpen(true)
		fetchGlastoArtists()
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}

	const fetchGlastoArtists = async () => {
		const allArtists = await fetch("http://localhost:3001/getLineup")
		const allArtistsJson = await allArtists.json()
		const mapped = allArtistsJson.body.map((artist) => {
			return { key: artist, name: artist }
		})
		setAllArtists(mapped)
		setTableData(mapped)
	}

	const filterArtists = (search) => {
		const filtered = allArtists.filter(({ name: artistName }) => {
			const searchValue = search.currentTarget.value
				.toString()
				.toLowerCase()
			return artistName.toString().toLowerCase().includes(searchValue)
		})
		setTableData(filtered)
	}

	return (
		<>
			<Button type="primary" onClick={showModal}>
				Glastonbury Lineup
			</Button>
			<Modal
				title="Glastonbury Lineup"
				open={isModalOpen}
				onOk={closeModal}
				onCancel={closeModal}
				footer={null}
			>
				{/* <Row>
					<Col span={16}> */}
				<Space.Compact block>
					<Input
						type="primary"
						onChange={filterArtists}
						placeholder="Search artists"
					/>
					{/* </Col>
					<Col span={8}> */}
					<Tooltip
						title={
							!isAdmin &&
							"you dont have sufficient permissions. bitch."
						}
					>
						<Button
							icon={<CloudSyncOutlined />}
							// onClick={updateGlastoArtists}
							disabled={!isAdmin}
						/>
					</Tooltip>
				</Space.Compact>
				{/* </Col>
				</Row> */}

				<Table
					dataSource={tableData}
					columns={[
						{
							title: "Artist name",
							dataIndex: "name",
							key: "name",
						},
					]}
				/>
			</Modal>
		</>
	)
}

export default GlastoArtists
