import React, { useState, useEffect } from "react";
import { createBrowserHistory } from "history";
import { Container, Alert, Form } from "react-bootstrap";
import withAuth from "./auth-route";
import { useParams } from "react-router-dom";

const history = createBrowserHistory();

const PostPage = () => {
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [post, setPost] = useState({});
  const [newTitle, setNewTitle] = useState(post.title);
  const [newContent, setNewContent] = useState(post.content);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState(undefined);
  const [readonly, setReadonly] = useState(true);
  const [textRows, setTextRows] = useState(undefined);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
      setLoggedIn(true);
    }
  }, []);

  const getPost = async () => {
    try {
      await fetch(`http://localhost:3001/posts/${id}`)
        .then((resp) => resp.json())
        .then((data) => {
          const textRowCount = data["content"].split(".").length;
          const rows = textRowCount + 10;
          setTextRows(rows);
          setPost(data);
        });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getPost();
  }, []);

  const onChangeTitle = (e) => {
    const title = e.target.value;
    setNewTitle(title);
  };

  const onChangeContent = (e) => {
    const content = e.target.value;
    setNewContent(content);
  };

  const findFormErrors = () => {
    const newErrors = {};
    // title errors
    if (!newTitle || newTitle === "" || !post.title || post.title === "")
      newErrors.newTitle = "Posts must have a title.";
    // content errors
    if (
      !newContent ||
      newContent === "" ||
      !post.content ||
      post.content === ""
    )
      newErrors.newContent = "Posts must have content.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const newErrors = findFormErrors();
    if (form.checkValidity() === false || Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      e.stopPropagation();
    } else {
      setValid(true);
    }
    setLoading(false);
  };

  return (
    <Container>
      {serverError && (
        <Alert
          variant="danger"
          onClose={() => setServerError(undefined)}
          dismissible
        >
          <Alert.Heading>An error has occurred.</Alert.Heading>
          <p>{serverError}</p>
        </Alert>
      )}
      <Form
        noValidate
        validated={valid}
        onSubmit={handleSubmit}
        className="row gy-5 align-self-center"
      >
        <Form.Group>
          <Form.Control
            size="sm"
            type="text"
            plaintext={readonly}
            readOnly={readonly}
            placeholder={post.title}
            value={newTitle}
            onChange={onChangeTitle}
          ></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Control
            as="textarea"
            style={{resize: "none", lineHeight: "2" }}
            rows={textRows}
            plaintext={readonly}
            readOnly={readonly}
            placeholder={post.content}
            value={newContent}
            onChange={onChangeContent}
          ></Form.Control>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default withAuth(PostPage);
