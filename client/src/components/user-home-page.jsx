import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row } from "react-bootstrap";
import withAuth from "./auth-route";

const UserHomePage = () => {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
      setLoggedIn(true);
    }
  }, []);

  const getPosts = async () => {
    try {
      await fetch("http://localhost:3001/my-posts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).accessToken
          }`,
        },
      })
        .then((resp) => resp.json())
        .then((data) => setPosts(data));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <Container>
        <Row>
          <h1>This is {currentUser ? currentUser.username : username}'s blog.</h1>
        </Row>
        {posts.map((post) => {
          return (
            <Row>
              <div>{post}</div>
            </Row>
          );
        })}
      </Container>
      {loggedIn && <div> Something about creating a post here. </div>}
    </>
  );
};

export default withAuth(UserHomePage);
