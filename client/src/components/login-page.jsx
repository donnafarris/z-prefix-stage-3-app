import React, { useState } from "react";
import { createBrowserHistory } from "history";
import { Alert, Button, Form } from "react-bootstrap";

const history = createBrowserHistory();

export default function LoginForm() {
  const [user_name, setUser_name] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState(undefined);

  const onChangeuser_name = (e) => {
    const user_name = e.target.value;
    setUser_name(user_name);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const findFormErrors = () => {
    const newErrors = {};
    // user_name errors
    if (!user_name || user_name.length < 3 || user_name.length > 20)
      newErrors.user_name = "Please enter a valid username.";
    // password errors
    if (!password || password.length < 6 || password.length > 40)
      newErrors.password = "Please enter a valid password.";

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
        const body = { username: user_name, password: password };
        const response = await fetch("http://localhost:3001/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const { username, accessToken } = await response.json();
        if (!response.ok) setServerError(response.statusText);
        if (accessToken) {
          localStorage.setItem(
            "user",
            JSON.stringify({ username, accessToken })
          );
          history.push(`/blog/${user_name}`);
          window.location.reload();
        }
      } catch (err) {
        console.error(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <>
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
      <Form noValidate validated={valid} onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label htmlFor="user_name">Username</Form.Label>
          <Form.Control
            required
            id="user-name"
            className="form-field"
            type="text"
            placeholder="Username"
            name="user_name"
            value={user_name}
            onChange={onChangeuser_name}
            isInvalid={!!errors.user_name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.user_name}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="passWord">Password</Form.Label>
          <Form.Control
            required
            id="pass-word"
            className="form-field"
            type="password"
            placeholder="Password"
            name="passWord"
            autoComplete="on"
            value={password}
            onChange={onChangePassword}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? "Loading" : "Log In"}
        </Button>
      </Form>
    </>
  );
}
