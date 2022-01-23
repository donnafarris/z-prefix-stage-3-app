import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { BsBoxArrowUpRight } from "react-icons/bs";

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const response = await fetch(
        "https://z-prefix-stage-3-api.herokuapp.com/api/posts"
      );
      const jsonData = await response.json();
      setPosts(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

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
          <h4 className="display-6">Home</h4>
        </Col>
      </Row>
      <Row xs={1} md={2} className="g-4 mt-2 px-4">
        {posts.length === 0 && (
          <Col md="auto">
            There aren't any posts here yet. Please create one.
          </Col>
        )}
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
                  ? post.content.substr(0, 101) + "..."
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

export default HomePage;
