import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import LoginForm from "./views/login-page";

export default function Root(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<LoginForm/>} />
      </Routes>
    </BrowserRouter>
  );
}
