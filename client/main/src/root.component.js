import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import LoginForm from "./views/login-page";
import SignupForm from "./views/signup-page";
import Home from "./views/home-page";

export default function Root(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<LoginForm />} />
        <Route exact path="/signup" element={<SignupForm />} />
        <Route exact path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
