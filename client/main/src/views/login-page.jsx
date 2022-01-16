import { createBrowserHistory } from "history";
import React, { useState, useRef } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

const history = createBrowserHistory();
const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

export default function LoginForm(props) {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.login(username, password).then(
        () => {
          history.push("/");
          window.location.reload();
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <div id="loginPage">
      <h4>Log in to view your posts:</h4>

      <Form ref={form} onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username </label>
          <Input
            type="username"
            name="username"
            value={username}
            onChange={onChangeUsername}
            validations={[required]}
          />
        </div>
        <div>
          <label htmlFor="password">Password </label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={onChangePassword}
            validations={[required]}
          />
        </div>
        <div>
          <button disabled={loading}>
            {loading && <span></span>}
            <span>Login</span>
          </button>
        </div>
        {message && (
          <div>
            <div role="alert">{message}</div>
          </div>
        )}
        <CheckButton style={{ display: "none" }} ref={checkBtn} />
      </Form>
      <h6>
        {" "}
        Need an account? Sign up{" "}
        <a className="signupLink" onClick={() => history.push("/signup")}>
          here
        </a>
        .
      </h6>
    </div>
  );
}
