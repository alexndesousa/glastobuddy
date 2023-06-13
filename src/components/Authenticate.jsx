import React, { useContext } from "react"
import { UserContext } from "../App"
import { authenticateUser } from "../services/AuthService"
import { Button, Row, Col, Tooltip } from "antd"
import CustomCard from "./CustomCard"

const Authenticate = () => {
	const { showAuth } = useContext(UserContext)

	return (
		<CustomCard>
			<Row justify="center" align="middle" style={{ height: "90vh" }}>
				<Col>
					<Tooltip
						title={!showAuth && "You've already authenticated :)"}
					>
						<Button
							type="primary"
							onClick={authenticateUser}
							disabled={!showAuth}
						>
							Authenticate
						</Button>
					</Tooltip>
				</Col>
			</Row>
		</CustomCard>
	)
}

export default Authenticate
