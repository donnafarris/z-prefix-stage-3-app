import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";

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

  return (
    <Container>
      <Row>
        <h1>This is the home page.</h1>
      </Row>
      {posts.map((post) => {
        return (
          <Row>
            <div>{post}</div>
          </Row>
        );
      })}
    </Container>
  );
};

export default HomePage;
