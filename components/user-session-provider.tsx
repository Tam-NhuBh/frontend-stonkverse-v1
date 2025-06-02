"use client";

import { FC, JSX, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface Props {
  children: ReactNode;
}

const UserSessionProvider: FC<Props> = ({ children }): JSX.Element => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default UserSessionProvider;
