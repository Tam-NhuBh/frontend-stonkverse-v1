import { FC, JSX, useState } from "react";
import Dashboard from './dashboard';

interface Props {
  isDashboard?: boolean;
}

const DashboardComp: FC<Props> = ({ isDashboard }): JSX.Element => {
  return <div>{isDashboard && <Dashboard />}</div>;
};

export default DashboardComp;
