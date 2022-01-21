import React, { useEffect, useState } from "react";
import { createBrowserHistory } from "history";
import { links } from "./links.js";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const history = createBrowserHistory();

const NavBar = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
      setLoggedIn(true);
    }
  }, []);

  let buttonLinks = [];
  let tabLinks = [];

  // show login/signup buttons if logged out; otherwise enable log out if logged in
  loggedIn ? (buttonLinks = links.loggedIn) : (buttonLinks = links.loggedOut);

  // show home and user's post links if logged in; otherwise only show home link
  loggedIn ? (tabLinks = links.default) : (tabLinks = links.default2);

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            alt=""
            src="https://supracoders.us/static/media/supra.662fbaef.png"
            height="30"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="container-fluid">
            {tabLinks.map((link) => {
              return (
                <Nav.Link
                  key={link.href}
                  className={link.class}
                  onClick={() => {
                    if (link.href === "blog") {
                      history.push(`/${link.href}/${currentUser["username"]}`);
                      window.location.reload();
                    } else {
                      history.push("/" + link.href);
                      window.location.reload();
                    }
                  }}
                >
                  {link.name}
                </Nav.Link>
              );
            })}
          </Nav>
          <Nav className="container-fluid justify-content-end">
            {buttonLinks.map((link) => {
              return (
                <Button className="m-1" variant="dark"
                  key={link.href}
                  onClick={() => {
                    if (link.href === "logout") {
                      localStorage.removeItem("user");
                      setCurrentUser(undefined);
                      setLoggedIn(false);
                      history.push("/");
                      window.location.reload();
                    } else {
                      history.push("/" + link.href);
                      window.location.reload();
                    }
                  }}
                >
                  {link.name}
                </Button>
              );
            })}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
