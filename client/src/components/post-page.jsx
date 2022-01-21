import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

const PostPage = () => {
  return (
    <>
      <h1>This page will display a post.</h1>
      <Form>
        <Form.Group>
          <FloatingLabel controlId="titleTextarea">
            <Form.Control as="textarea" placeholder="Title"></Form.Control>
          </FloatingLabel>
        </Form.Group>
        <Form.Group>
          <Form.Label></Form.Label>
          <Form.Control as="textarea" placeholder="Content"></Form.Control>
        </Form.Group>
      </Form>
    </>
  );
};

export default PostPage;
