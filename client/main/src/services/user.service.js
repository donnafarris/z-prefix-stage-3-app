import axios from "axios";

const API_URL = "http://localhost:3001/";

const getPosts = () => {
  return axios.get(API_URL + "posts");
};

export default {
  getPosts,
};
