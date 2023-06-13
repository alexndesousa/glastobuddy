import React, { useContext, useState, useEffect } from "react"
import { Row, Table, Input, Checkbox } from "antd"
import { UserContext } from "../App"
import CustomCard from "./CustomCard"

const GenreSelector = () => {
	const [allGenres, setAllGenres] = useState([])
	const [tableData, setTableData] = useState([])
	const [isTableLoading, setIsTableLoading] = useState(true)
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const { selectedSourceData, setSelectedSourceData, setIsNextAllowed } =
		useContext(UserContext)

	useEffect(() => {
		if (tableData.length === 0) {
			fetchGenres()
		}
	})

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
			setSelectedSourceData({ genres: selectedRowKeys })
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

	const fetchGenres = async () => {
		const allGenres = await fetch("http://3.86.96.211:8080/getGenres")
		const allGenresJson = await allGenres.json()
		const mapped = allGenresJson.body.map((genre) => {
			return { key: genre, name: genre }
		})
		setAllGenres(mapped)
		setTableData(mapped)
	}

	const filterGenres = (search) => {
		const filtered = allGenres.filter(({ name: genre }) => {
			const searchValue = search.currentTarget.value
				.toString()
				.toLowerCase()
			return genre.toString().toLowerCase().includes(searchValue)
		})
		setTableData(filtered)
	}

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "85vh" }}>
				<Input
					type="primary"
					onChange={filterGenres}
					placeholder="Search genres"
				/>
				<Table
					loading={isTableLoading}
					dataSource={tableData}
					scroll={{ y: 500 }}
					columns={[
						{
							title: "Genre",
							dataIndex: "name",
							key: "name",
						},
					]}
					rowSelection={rowSelection}
				/>
			</Row>
		</CustomCard>
	)
}

export default GenreSelector
