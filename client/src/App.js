import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Components
import NavBar from "./components/nav-bar";
import HomePage from "./components/home-page";
import SignupForm from "./components/signup-page";
import PostPage from "./components/post-page";
import UserHomePage from "./components/user-home-page";
import LoginForm from "./components/login-page";
import Footer from "./components/footer";
import NewPostForm from "./components/create-post-page";

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/blog/:username" element={<UserHomePage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/new-post" element={<NewPostForm />} />
      </Routes>
      <Footer />
    </Router>
  );
}
