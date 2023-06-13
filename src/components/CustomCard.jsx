import React from "react"
import { Card, Row, Space } from "antd"
import NavigationArrows from "./NavigationArrows"

const CustomCard = ({ children }) => {
	return (
		<Space
			direction="vertical"
			size="middle"
			style={{ display: "flex", height: "98vh", paddingTop: "2vh" }}
		>
			<Row
				style={{
					justifyContent: "center",
					background: "transparent",
				}}
			>
				<Card
					bordered={false}
					style={{
						width: "70vw",
						height: "90vh",
						background: "#D2B48C",
					}}
				>
					{children}
				</Card>
			</Row>
			<NavigationArrows />
		</Space>
	)
}

export default CustomCard
