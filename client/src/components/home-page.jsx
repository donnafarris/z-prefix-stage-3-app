import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { BsBoxArrowUpRight } from "react-icons/bs";

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const response = await fetch("http://localhost:3001/posts");
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

  return (
    <Container fluid>
      <Row style={{ backgroundColor: "gainsboro" }}>
        <Col md="auto">
          <h4 className="display-6">Home</h4>
        </Col>
      </Row>
      <Row xs={1} md={2} className="g-4 mt-2 px-4">
        {posts.length === 0 && (<Col md="auto">There aren't any posts here yet. Please create one.</Col>)}
        {posts.map((post) => (
          <Col key={`postid${post.post_id}${post.username}`}>
            <Card className="m-2">
              <Card.Header>
                <Card.Title>{post.title}</Card.Title>
              </Card.Header>
              <Card.Text className="p-3">
                {post.content.substr(0, 102) + "..."}
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
                    <Button
                      variant="outline-dark"
                      style={{ border: "none" }}
                      href={`/posts/${post.post_id}`}
                    >
                      <BsBoxArrowUpRight />
                    </Button>
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
