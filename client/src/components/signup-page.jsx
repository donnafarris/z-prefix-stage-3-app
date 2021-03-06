import React, { useState } from "react";
import { createBrowserHistory } from "history";
import { Alert, Button, Container, Row, Col, Form } from "react-bootstrap";

const history = createBrowserHistory();

export default function SignupForm() {
  const [user_name, setUser_name] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_Password] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState(undefined);

  const onChangeUser_name = (e) => {
    const user_name = e.target.value;
    setUser_name(user_name);
  };

  const onChangeFirstname = (e) => {
    const firstname = e.target.value;
    setFirstname(firstname);
  };

  const onChangeLastname = (e) => {
    const lastname = e.target.value;
    setLastname(lastname);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const onChangeConfirm_Password = (e) => {
    const confirm_password = e.target.value;
    setConfirm_Password(confirm_password);
  };

  const findFormErrors = () => {
    const newErrors = {};
    // firstname errors
    if (!firstname || firstname === "")
      newErrors.firstname = "Please enter your first name.";
    // lastname errors
    if (!lastname || lastname === "")
      newErrors.lastname = "Please enter your last name.";
    // user_name errors
    if (!user_name || user_name === "")
      newErrors.user_name = "Please enter a username.";
    else if (user_name.length > 20)
      newErrors.user_name =
        "Usernames must be less than 20 characters in length.";
    else if (user_name.length < 3)
      newErrors.user_name =
        "Usernames must be more than 3 characters in length.";
    // password errors
    if (!password || password === "")
      newErrors.password = "Please enter a password.";
    else if (password.length > 40)
      newErrors.password =
        "Passwords must be less than 40 characters in length.";
    else if (password.length < 6)
      newErrors.password =
        "Passwords must be more than 6 characters in length.";
    // confirm_password errors
    else if (password !== confirm_password)
      newErrors.confirm_password = "Password fields must match.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const newErrors = findFormErrors();
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      e.stopPropagation();
    } else {
      setValid(true);
      try {
        let body = {
          first_name: firstname,
          last_name: lastname,
          username: user_name,
          password: password,
        };
        const signupResponse = await fetch(
          "https://z-prefix-stage-3-api.herokuapp.com/api/signup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!signupResponse.ok) setServerError(signupResponse.statusText);
        const loginResponse = await fetch(
          "https://z-prefix-stage-3-api.herokuapp.com/api/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user_name,
              password: password,
            }),
          }
        );
        const { username, user_id, accessToken } = signupResponse.ok
          ? await loginResponse.json()
          : { username: null, user_id: null, accessToken: null };
        if (signupResponse.ok && !loginResponse.ok)
          setServerError(loginResponse.statusText);
        if (accessToken) {
          localStorage.setItem(
            "user",
            JSON.stringify({ username, user_id, accessToken })
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
    <Container fluid>
      <Row style={{ backgroundColor: "gainsboro" }}>
        <Col md="auto">
          <h4 className="display-6">Sign Up</h4>
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
      <Form
        noValidate
        validated={valid}
        onSubmit={handleSubmit}
        className="g-4 mt-2 px-4"
      >
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="firstName">First Name</Form.Label>
              <Form.Control
                required
                id="first-name"
                type="text"
                placeholder="First Name"
                name="firstName"
                value={firstname}
                onChange={onChangeFirstname}
                isInvalid={!!errors.firstname}
              />
              <Form.Control.Feedback type="invalid">
                {errors.firstname}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="lastName">Last Name</Form.Label>
              <Form.Control
                required
                id="last-name"
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={lastname}
                onChange={onChangeLastname}
                isInvalid={!!errors.lastname}
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastname}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userName">Username</Form.Label>
              <Form.Control
                required
                minLength={3}
                maxLength={20}
                id="user-name"
                type="text"
                placeholder="Username"
                name="userName"
                value={user_name}
                onChange={onChangeUser_name}
                isInvalid={!!errors.user_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.user_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="passWord">Password</Form.Label>
              <Form.Control
                required
                minLength={6}
                maxLength={40}
                id="pass-word"
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
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="confirmPassWord">
                Confirm Password
              </Form.Label>
              <Form.Control
                required
                id="confirm-pass-word"
                type="password"
                placeholder="Confirm Password"
                name="confirmPassWord"
                autoComplete="on"
                value={confirm_password}
                onChange={onChangeConfirm_Password}
                isInvalid={!!errors.confirm_password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirm_password}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? "Loading" : "Sign Up"}
        </Button>
      </Form>
    </Container>
  );
}
