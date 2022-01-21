import React from "react";
import { createBrowserHistory } from "history";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const history = createBrowserHistory();

const Footer = () => {
  const isAuth = !!JSON.parse(localStorage.getItem("user")).accessToken;

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
