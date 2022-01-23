import React, { useState, useEffect } from "react";
import { createBrowserHistory } from "history";
import {
  Container,
  Row,
  Col,
  Alert,
  Form,
  DropdownButton,
  Dropdown,
  Button,
  Modal,
  Card,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";

const history = createBrowserHistory();

const PostPage = () => {
  const { id } = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [post, setPost] = useState({});
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState(undefined);
  const [readonly, setReadonly] = useState(true);
  const [textRows, setTextRows] = useState(undefined);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  const getPost = async () => {
    try {
      await fetch(`http://localhost:3001/posts/${id}`)
        .then((resp) => resp.json())
        .then((data) => {
          const textRowCount = data["content"].split(".").length;
          const rows = textRowCount + 2;
          setTextRows(rows);
          setPost(data);
          setNewTitle(data.title); //something about this is bringing up an error
          setNewContent(data.content); //see C:\Users\dfarr\OneDrive\Documents\localhost-1642810503335 21JAN2022 1515PM.txt
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

  const handleChangeReadonly = (e) => {
    setReadonly(!readonly);
  };

  const handleCancelEdit = (e) => {
    setReadonly(!readonly);
    setNewContent(post.content);
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

  const dateFunc = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
    }).format(new Date(dateString));
  };

  const handleConfirmDelete = (e) => {
    setLoading(true);
    setShowModal(true);
    setLoading(false);
  };

  const handleCloseModal = (e) => {
    setLoading(true);
    setShowModal(false);
    setLoading(false);
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowModal(false);
    try {
      const response = await fetch(`http://localhost:3001/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).accessToken
          }`,
        },
      });
      if (!response.ok) setServerError(response.statusText);
      if (response.ok) {
        history.push(
          `/blog/${JSON.parse(localStorage.getItem("user")).username}`
        );
        window.location.reload();
      }
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
    console.log("This does nothing right now but soon it will delete posts.");
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
      try {
        const body = { title: newTitle, content: newContent };
        const response = await fetch(`http://localhost:3001/posts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).accessToken
            }`,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) setServerError(response.statusText);
        if (response.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <Container fluid>
      <Row style={{ backgroundColor: "gainsboro" }}>
        <Col md="auto" style={{ height: "53px" }} />
      </Row>
      {serverError && (
        <Alert
          className="mt-2"
          variant="danger"
          onClose={() => setServerError(undefined)}
          dismissible
        >
          <Alert.Heading>An error has occurred.</Alert.Heading>
          <p>{serverError}</p>
        </Alert>
      )}
      <Modal
        show={showModal}
        backdrop="static"
        keyboard={false}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={loading} variant="dark" onClick={handleCloseModal}>
            {loading ? "Loading" : "Cancel"}
          </Button>
          <Button
            disabled={loading}
            variant="danger"
            onClick={handleDeletePost}
          >
            {loading ? "Loading" : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Container>
        <Card style={{ minWidth: "auto", maxWidth: "60rem" }} className="m-2">
          <Card.Header>
            <Row xs={2} className="d-flex">
              <Col xs="auto">
                <div>
                  Author: <a href={`/blog/${post.username}`}>{post.username}</a>
                </div>
              </Col>
              <Col xs="auto">
                {post.creation_date
                  ? "Created:  " + dateFunc(post.creation_date)
                  : "unknown"}
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Form
              noValidate
              validated={valid}
              onSubmit={handleSubmit}
              className="g-4"
            >
              <Row className="d-flex justify-content-between">
                <Col xs={10}>
                  {readonly ? (
                    <Form.Group
                      className="mb-3 ms-2 pe-none ps-1"
                      controlId="readonlyTitleText"
                      aria-disabled="true"
                    >
                      <Form.Control
                        as="textarea"
                        className="form-control-lg"
                        style={{ resize: "none", lineHeight: "2" }}
                        rows={2}
                        plaintext
                        readOnly
                        placeholder={post.title}
                        value={newTitle}
                        onChange={onChangeTitle}
                      ></Form.Control>
                    </Form.Group>
                  ) : (
                    <Form.Group className="mb-3" controlId="titleText">
                      <Form.Control
                        as="textarea"
                        className="form-control-lg"
                        style={{ resize: "none", lineHeight: "2" }}
                        rows={2}
                        placeholder={post.title}
                        value={newTitle}
                        onChange={onChangeTitle}
                        isInvalid={!!errors.newTitle}
                      ></Form.Control>
                    </Form.Group>
                  )}
                  {readonly ? (
                    <Form.Group
                      className="mb-3 ms-2 pe-none ps-1"
                      controlId="readonlyContentText"
                      aria-disabled="true"
                    >
                      <Form.Control
                        as="textarea"
                        style={{ resize: "none", lineHeight: "2" }}
                        rows={textRows}
                        plaintext
                        readOnly
                        placeholder={post.content}
                        value={newContent}
                        onChange={onChangeContent}
                      ></Form.Control>
                    </Form.Group>
                  ) : (
                    <Form.Group controlId="contentText">
                      <Form.Control
                        as="textarea"
                        style={{ resize: "none", lineHeight: "2" }}
                        rows={textRows}
                        placeholder={post.content}
                        value={newContent}
                        onChange={onChangeContent}
                        isInvalid={!!errors.newContent}
                      ></Form.Control>
                    </Form.Group>
                  )}
                </Col>
                {loggedIn && currentUser.username === post.username ? (
                  <Col
                    xs={1}
                    className="d-flex flex-column justify-content-between align-items-end"
                  >
                    <DropdownButton
                      size="sm"
                      id="dropdown-button"
                      title={<BsThreeDotsVertical />}
                      variant="outline-dark"
                    >
                      {readonly ? (
                        <Dropdown.Item onClick={handleChangeReadonly}>
                          Edit
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item onClick={handleCancelEdit}>
                          Cancel
                        </Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleConfirmDelete}>
                        Delete
                      </Dropdown.Item>
                    </DropdownButton>
                    {readonly ? (
                      " "
                    ) : (
                      <Button
                        size="sm"
                        type="submit"
                        variant="dark"
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    )}
                  </Col>
                ) : (
                  ""
                )}
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default PostPage;
