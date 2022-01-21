import { Navigate } from "react-router";

const withAuth = (Component) => {
  const AuthRoute = () => {
    const isAuth = !!JSON.parse(localStorage.getItem("user")).accessToken;
    return isAuth ? <Component /> : <Navigate to="/" />;
  };
  return AuthRoute;
};

export default withAuth;
