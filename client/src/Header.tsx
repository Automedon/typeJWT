import React from "react";
import { Link } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "./generated/graphql";
import { setAccessToken } from "./accessToken";

interface Props {}

export const Header: React.FC<Props> = () => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();
  let body: any = null;
  if (loading) {
    body = null;
  } else if (data && data.me) {
    body = <div>You are logged in as: {data.me.email}</div>;
  } else {
    body = <div>Not logged</div>;
  }
  return (
    <div>
      <header>
        <div>
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>
            <Link to="/register">Register</Link>
          </div>
          <div>
            <Link to="/login">Login</Link>
          </div>
          <div>
            <Link to="/bye">Bye</Link>
          </div>
          {!loading && data && data.me ? (
            <button
              onClick={async () => {
                await logout();
                setAccessToken("");
                await client!.resetStore();
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
        {body}
      </header>
    </div>
  );
};
