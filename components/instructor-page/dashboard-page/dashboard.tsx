"use client";
import { FC, JSX } from "react";
import OrdersAnalyticsInstructor from "../orders-analytics-instructor-page/orders-analytics-instructor";
import OverviewInvoices from "./overview-invoice";

interface Props {
  open?: boolean;
  value?: number;
}

const Dashboard: FC<Props> = ({ open }): JSX.Element => {

  return (
    <div className="w-[90%] mx-auto mt-8 mb-12">
      <OrdersAnalyticsInstructor isDashboard />
      <div className="mt-3">
      <OverviewInvoices isDashboard />
      </div>
    </div>
  )
};

export default Dashboard;
