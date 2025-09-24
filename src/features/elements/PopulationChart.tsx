import React from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography } from "@mui/material";
import type { PopulationData } from "../../types";

interface ChartData {
  prefName: string;
  data: PopulationData[];
}

interface PopulationChartProps {
  chartData: ChartData[];
}

export const PopulationChart: React.FC<PopulationChartProps> = ({
  chartData,
}) => {
  const option = {
    title: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        let result = `${params[0].axisValue}年<br/>`;
        params.forEach((param: any) => {
          result += `${
            param.seriesName
          }: ${param.value.toLocaleString()}人<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: chartData.map((item) => item.prefName),
      top: 10,
      type: "scroll",
    },
    grid: {
      left: "10%",
      right: "5%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData[0]?.data.map((item) => item.year) || [],
      name: "年度",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      name: "人口数",
      nameLocation: "middle",
      nameGap: 60,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}万`;
          }
          return value.toLocaleString();
        },
        fontSize: 12,
      },
    },
    series: chartData.map((item, index) => ({
      name: item.prefName,
      type: "line",
      data: item.data.map((d) => d.value),
      smooth: false,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: {
        width: 2,
        type: index % 2 === 0 ? "solid" : "dashed",
      },
    })),
  };

  if (chartData.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ccc",
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          都道府県を選択してください
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 400,
        border: "1px solid #ccc",
        borderRadius: 1,
        p: 1,
      }}
    >
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </Box>
  );
};
