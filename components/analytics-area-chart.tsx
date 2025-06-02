import { FC, useState, useMemo, JSX } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  isDashboard?: boolean;
  data: any;
  title: string;
}

const AnalyticsAreaChart: FC<Props> = ({
  isDashboard,
  data,
  title,
}): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<number>(0);

  // Filter data
  const displayData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    if (selectedRange === 0) {
      return data;
    }

    const filtered = data.slice(-selectedRange);
    return filtered;
  }, [data, selectedRange]);

  const handleRangeChange = (value: number) => {
    setSelectedRange(value);
  };

  return (
    <div
      className={`${isDashboard
        ? "shadow-md border dark:border-none rounded-sm dark:bg-[#111C43] pb-5"
        : "mt-[50px]"
        }`}
    >
      <div className={`${isDashboard ? "px-6 py-4" : "px-6"}`}>
        <div className="flex items-center justify-between">
          <h1
            className={`font-bold ${
              isDashboard ? "text-lg font-semibold" : "text-2xl"
            }`}
          >
            {title}
          </h1>
          
          <select
            value={selectedRange}
            onChange={(e) => handleRangeChange(Number(e.target.value))}
            className={`px-4 py-2 border rounded-sm text-sm ${
              isDashboard
                ? "dark:bg-[#1a2555] dark:border-gray-600 dark:text-white"
                : "bg-white border-gray-300"
            }`}
          >
            <option value={0}>All months</option>
            <option value={1}>Last 1 month</option>
            <option value={2}>Last 2 months</option>
            <option value={3}>Last 3 months</option>
            <option value={4}>Last 4 months</option>
            <option value={5}>Last 5 months</option>
            <option value={6}>Last 6 months</option>
            <option value={7}>Last 7 months</option>
            <option value={8}>Last 8 months</option>
            <option value={9}>Last 9 months</option>
            <option value={10}>Last 10 months</option>
            <option value={11}>Last 11 months</option>
          </select>
        </div>
      </div>

      <div
        className={`w-full ${isDashboard ? "aspect-[3]" : "h-screen"
          } flex items-center justify-center`}
      >
        <ResponsiveContainer
          width={isDashboard ? "100%" : "90%"}
          height={!isDashboard ? "50%" : "100%"}
        >
          <AreaChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="Count"
              stroke="#4d62d9"
              fill="#4d62d9"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsAreaChart;