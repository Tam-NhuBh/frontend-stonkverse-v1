"use client";

import LoadingSpinner from "@/components/loading-spinner";
import { useGetOrderssAnalyticsInstructorQuery } from "@/store/analytics/analytics-api";
import { FC, JSX, useEffect, useState } from "react";
import AnalyticsAreaChart from "../../analytics-area-chart";

interface Props {
  isDashboard?: boolean;
}

const OrdersAnalyticsInstructor: FC<Props> = ({ isDashboard }): JSX.Element => {
  const { data, isLoading } = useGetOrderssAnalyticsInstructorQuery({});

  const [renderedData, setRenderedData] = useState([]);

  useEffect(() => {
    if (data) {
      const formattedData = data.orders.map((item: any) => ({
        name: item.month,
        Count: Number(item.count),
      }));

      setRenderedData(formattedData);
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AnalyticsAreaChart
          data={renderedData}
          title="ORDERS ANALYTICS"
          isDashboard={isDashboard}
        />
      )}
    </>
  );
};

export default OrdersAnalyticsInstructor;
