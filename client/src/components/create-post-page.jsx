import React, { useState } from "react";
import { createBrowserHistory } from "history";
import { Alert, Button, Container, FloatingLabel, Form } from "react-bootstrap";

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
    const newErrors = {};
    // title errors
    if (!titleF || titleF === "") newErrors.titleF = "Posts must have a title.";
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
        const response = await fetch("http://localhost:3001/posts", {
          method: "POST",
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
      <Form noValidate validated={valid} onSubmit={handleSubmit} className="row gy-5 align-self-center">
        <Form.Group>
          <FloatingLabel controlId="titleTextarea" label="Title">
            <Form.Control
              required
              className="form-field"
              as="textarea"
              placeholder="Title"
              name="titleTextarea"
              value={titleF}
              onChange={onChangeTitleF}
              isInvalid={!!errors.titleF}
            />
          </FloatingLabel>
          <Form.Control.Feedback type="invalid">
            {errors.titleF}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <FloatingLabel controlId="contentTextarea" label="Content">
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
          </FloatingLabel>
          <Form.Control.Feedback type="invalid">
            {errors.contentF}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading" : "Submit"}
        </Button>
      </Form>
    </Container>
  );
}
