import React, { useState } from "react";
import { createBrowserHistory } from "history";
import { Alert, Button, Container, Row, Col, Form } from "react-bootstrap";

const history = createBrowserHistory();

export default function NewPostForm() {
  const [titleF, setTitleF] = useState("");
  const [contentF, setContentF] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState(undefined);

  const onChangeTitleF = (e) => {
    const titleF = e.target.value;
    setTitleF(titleF);
  };

  const onChangecontentF = (e) => {
    const contentF = e.target.value;
    setContentF(contentF);
  };

  const findFormErrors = () => {
    let newErrors = {};
    // title errors
    if (!titleF || titleF === "") newErrors.titleF = "Posts must have a title.";
    if (titleF.length > 200) newErrors.titleF = "The title cannot exceed 200 characters";
    // content errors
    if (!contentF || contentF === "")
      newErrors.contentF = "Posts must have content.";

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
      try {
        const body = { title: titleF, content: contentF };
        const response = await fetch("https://z-prefix-stage-3.herokuapp.com/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).accessToken
            }`,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          setValid(false);
          setServerError(response.statusText);
        }
        if (response.ok) {
          history.push(
            `/blog/${JSON.parse(localStorage.getItem("user")).username}`
          );
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
        <Col md="auto">
          <h4 className="display-6">New Post</h4>
        </Col>
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
      <Row>
        <Col xs={10}>
          <Form
            noValidate
            validated={valid}
            onSubmit={handleSubmit}
            className="g-4 mt-2 px-4"
          >
            <Form.Group className="mb-3" controlId="titleText">
              <Form.Label label="Title"></Form.Label>
              <Form.Control
                required
                size="lg"
                type="text"
                placeholder="Title"
                name="titleTextarea"
                value={titleF}
                onChange={onChangeTitleF}
                isInvalid={!!errors.titleF}
              />
              <Form.Control.Feedback type="invalid">
                {errors.titleF}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="contentTextarea">
              <Form.Label label="Content"></Form.Label>
              <Form.Control
                required
                className="form-field"
                as="textarea"
                placeholder="Content"
                name="contentTextarea"
                value={contentF}
                onChange={onChangecontentF}
                isInvalid={!!errors.contentF}
                style={{ height: "100px" }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.contentF}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="dark" disabled={loading}>
              {loading ? "Loading" : "Submit"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
