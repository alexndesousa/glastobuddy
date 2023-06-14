import React, { useContext } from "react"
import { UserContext } from "../App"
import { Button, Row, Col, Image } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import buddy from "../images/buddy.png"

const NavigationArrows = () => {
	const { currentPage, setCurrentPage, isNextAllowed } =
		useContext(UserContext)

	const prev = () => {
		setCurrentPage(currentPage - 1)
	}

	const next = () => {
		setCurrentPage(currentPage + 1)
	}

	return (
		<Row>
			<Col span={4} offset={4}>
				<Button
					style={{ background: "#E5D3B3" }}
					icon={<LeftOutlined />}
					size={"large"}
					disabled={currentPage === 0}
					onClick={prev}
				/>
			</Col>
			<Col span={4} offset={2}>
				<Image src={buddy} preview={false} height={40} />
			</Col>
			<Col span={4} offset={2}>
				<Button
					style={{ background: "#E5D3B3" }}
					icon={<RightOutlined />}
					size={"large"}
					disabled={!isNextAllowed}
					onClick={next}
				/>
			</Col>
		</Row>
	)
}

export default NavigationArrows
