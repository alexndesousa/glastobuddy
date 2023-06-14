import React, { useContext } from "react"
import { UserContext } from "../App"
import { authenticateUser } from "../services/AuthService"
import { Button, Row, Tooltip, Image } from "antd"
import CustomCard from "./CustomCard"
import buddy from "../images/buddy.png"

const Authenticate = () => {
	const { showAuth } = useContext(UserContext)

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "60vh" }}>
				<Image src={buddy} preview={false} />
			</Row>
			<Tooltip title={!showAuth && "You've already authenticated :)"}>
				<Button
					type="primary"
					onClick={authenticateUser}
					disabled={!showAuth}
				>
					Authenticate
				</Button>
			</Tooltip>
		</CustomCard>
	)
}

export default Authenticate
