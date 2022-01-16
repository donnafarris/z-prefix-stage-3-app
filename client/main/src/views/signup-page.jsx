import React, { useState, useRef } from "react";
import { createBrowserHistory } from "history";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

const history = createBrowserHistory();

export default function SignupForm(props) {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangeFirstname = (e) => {
    const first_name = e.target.value;
    setFirstname(first_name);
  };
  const onChangeLastname = (e) => {
    const last_name = e.target.value;
    setLastname(last_name);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    setMessage("");
    setSuccessful(false);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.signup(username, password, first_name, last_name).then(
        (response) => {
          setMessage(response.data.message);
          setSuccessful(true);
          setTimeout(() => {
            history.push("/login");
          }, 2000);
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setMessage(resMessage);
          setSuccessful(false);
        }
      );
    }
  };
  return (
    <div id="signupPage">
      <h4>Sign up for an account:</h4>
      <Form onSubmit={handleRegister} ref={form}>
        {!successful && (
          <div>
            <div>
              <label htmlFor="username">Username*</label>
              <Input
                type="text"
                name="username"
                value={username}
                onChange={onChangeUsername}
                validations={[required, vusername]}
              />
            </div>
            <br />
            <div>
              <label htmlFor="input__name">First Name*</label>
              <Input
                type="text"
                name="first_name"
                placeholder="Wade"
                value={first_name}
                onChange={onChangeFirstname}
                validations={[required]}
              />
            </div>
            <br />
            <div>
              <label htmlFor="input__last_name">Last Name*</label>
              <Input
                type="text"
                name="last_name"
                placeholder="Wilson"
                value={last_name}
                onChange={onChangeLastname}
                validations={[required]}
              />
            </div>
            <br />
            <div>
              <label htmlFor="password">Password*</label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={onChangePassword}
                validations={[required, vpassword]}
              />
            </div>
            <br />
            <div>
              <button>Sign Up</button>
            </div>
          </div>
        )}

        {message && (
          <div>
            <div
              className={
                successful ? "alert alert-success" : "alert alert-danger"
              }
              role="alert"
            >
              {message}
            </div>
          </div>
        )}
        <CheckButton style={{ display: "none" }} ref={checkBtn} />
      </Form>

      <h6>
        Already have an account? Log in{" "}
        <a className="loginLink" onClick={() => history.push("/login")}>
          here
        </a>
        .
      </h6>
    </div>
  );
}
