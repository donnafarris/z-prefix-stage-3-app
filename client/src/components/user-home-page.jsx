import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import withAuth from "./auth-route";
import { BsBoxArrowUpRight } from "react-icons/bs";

const UserHomePage = () => {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [blogger, setBlogger] = useState({});
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
    }
    const getBlogger = async () => {
      try {
        const response = await fetch("http://localhost:3001/users");
        const jsonData = await response.json();
        const data = jsonData.filter((user) => {
          return user.username === username;
        });
        // console.log("Fetch users data: " + JSON.stringify(data[0]))
        setBlogger(data[0]);
      } catch (err) {
        console.error(err.message);
      }
    };
    getBlogger();
  }, [username, setBlogger, setCurrentUser]);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await fetch("http://localhost:3001/posts");
        const jsonData = await response.json();
        const data = jsonData.filter((post) => {
          return post.username === blogger.username;
        });
        // console.log("Fetch posts data: " + data);
        setPosts(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    getPosts();
  }, [blogger]);

  const dateFunc = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
    }).format(new Date(dateString));
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      See Full Post
    </Tooltip>
  );

  return (
    <Container fluid>
      <Row style={{ backgroundColor: "gainsboro" }}>
        <Col md="auto">
          <h4 className="display-6">{username}'s Blog</h4>
        </Col>
      </Row>
      <Row xs={1} md={2} className="g-4 mt-2 px-4">
        {posts.map((post) => (
          <Col key={`postid${post.post_id}${post.username}`}>
            <Card style={{ minWidth: "min-content" }} className="m-2">
              <Card.Header>
                <Card.Title>
                  {post.title.length > 100
                    ? post.title.substr(0, 101) + "..."
                    : post.title}
                </Card.Title>
              </Card.Header>
              <Card.Text className="p-3">
                {post.content.length > 100
                  ? post.content.substr(0, 102) + "..."
                  : post.content}
              </Card.Text>
              <Card.Footer>
                <Row className="d-flex">
                  <Col md="auto">
                    <div>
                      Author:{" "}
                      <a href={`/blog/${post.username}`}>{post.username}</a>
                    </div>
                  </Col>
                  <Col>{"Created:  " + dateFunc(post.creation_date)}</Col>
                  <Col md="auto">
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip}
                    >
                      <Button
                        size="sm"
                        variant="outline-dark"
                        href={`/posts/${post.post_id}`}
                      >
                        <BsBoxArrowUpRight />
                      </Button>
                    </OverlayTrigger>
                  </Col>
                </Row>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default withAuth(UserHomePage);
