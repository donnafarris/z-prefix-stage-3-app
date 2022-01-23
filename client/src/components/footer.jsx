import React, { useEffect, useState } from "react";
import { createBrowserHistory } from "history";
import {
  Container,
  Nav,
  Navbar,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

const history = createBrowserHistory();

const Footer = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const isAuth = currentUser ? !!currentUser.accessToken : false;

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      New Post
    </Tooltip>
  );

  return (
    <Navbar bg="transparent" fixed="bottom">
      <Container fluid className="justify-content-end">
        {isAuth && (
          <Nav>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <Button
                className="m-1"
                variant="dark"
                key={"new-post"}
                onClick={() => {
                  history.push("/new-post");
                  window.location.reload();
                }}
              >
                +
              </Button>
            </OverlayTrigger>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
};

export default Footer;
