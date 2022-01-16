import React from "react";

import UserService from "../services/user.service";

const posts = UserService.getPosts();

export default function Home(props) {
  return (
    <div id="homePage">
      <h1>All Posts</h1>
      {posts && <p>{posts[0]}</p>}
    </div>
  );
}
