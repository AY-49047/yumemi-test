import { useEffect, useState, useRef } from "react";
import "./App.css";
import type {
  Prefecture,
  PopulationComposition,
  PrefListResponse,
} from "../types";
import { Checkbox, FormControlLabel } from "@mui/material";
import * as echarts from "echarts";

export default function PrefectureCheckboxes() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [checkedCodes, setCheckedCodes] = useState<number[]>([]);
  const [populations, setPopulations] = useState<
    Record<number, PopulationComposition>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  const url = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  // 都道府県一覧
  useEffect(() => {
    async function loadPrefectures() {
      try {
        setError(null);
        const res = await fetch(`${url}/api/v1/prefectures`, {
          headers: { "X-API-KEY": apiKey },
        });
        const json: PrefListResponse = await res.json();
        setPrefectures(json.result || []);
      } catch {
        setError("都道府県一覧の取得に失敗しました");
      }
    }
    loadPrefectures();
  }, [url, apiKey]);

  // チェックの切り替え
  function toggle(code: number) {
    setCheckedCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  }

  // チェックされたら、その都道府県の人口構成を読み込む
  useEffect(() => {
    async function loadPopulations() {
      const targets = checkedCodes.filter(
        (code) => populations[code] === undefined
      );
      if (targets.length === 0) return;

      setLoading(true);
      setError(null);

      const next: Record<number, PopulationComposition> = { ...populations };
      try {
        for (const code of targets) {
          const res = await fetch(
            // `${url}/api/v1/population/composition/perYear?cityCode=-&prefCode=${code}`,
            `${url}/api/v1/population/composition/perYear?prefCode=${code}`,
            { headers: { "X-API-KEY": apiKey } }
          );
          const json = await res.json();
          next[code] = json.result;
        }
        setPopulations(next);
        console.log("人口構成データ:", next);
      } catch (e) {
        setError("人口構成の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadPopulations();
  }, [checkedCodes, url, apiKey]);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      chart.setOption({
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: "line",
          },
        ],
      });
      // クリーンアップ
      return () => {
        chart.dispose();
      };
    }
  }, []);

  function getLatestTotal(pop: PopulationComposition): string {
    // データがまだない場合
    if (!pop) {
      return "取得待ち…";
    }

    // 「総人口」のシリーズを探す
    let series = pop.data.find((s) => s.label === "総人口");
    if (!series) {
      series = pop.data[0];
    }

    // シリーズ自体がないorデータが空
    if (!series || series.data.length === 0) {
      return "データなし";
    }

    // 最後の要素（最新年）を取り出す
    const lastData = series.data[series.data.length - 1];

    // 表示用の文字列にして返す
    return lastData.value.toLocaleString() + "人（" + lastData.year + "年）";
  }

  return (
    <div>
      <h3>都道府県一覧</h3>
      <div>
        {prefectures.map((p) => (
          <FormControlLabel
            key={p.prefCode}
            control={
              <Checkbox
                checked={checkedCodes.includes(p.prefCode)}
                onChange={() => toggle(p.prefCode)}
              />
            }
            label={p.prefName}
          />
        ))}
      </div>

      <div>
        選択されたコード:{" "}
        {checkedCodes.length > 0 ? checkedCodes.join(", ") : "なし"}
      </div>

      {error && (
        <div style={{ color: "crimson", marginTop: 8 }}>エラー: {error}</div>
      )}
      {loading && <div style={{ marginTop: 8 }}>取得中…</div>}

      <div>
        <h4>人口構成（最新年の総人口）</h4>
        {checkedCodes.length === 0 ? (
          <div>都道府県にチェックを入れると人口構成を取得します。</div>
        ) : (
          <ul>
            {checkedCodes.map((code) => (
              <li key={code}>
                prefCode: {code} — {getLatestTotal(populations[code])}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h1>Hello React</h1>
        {/* ECharts 用のコンテナ */}
        <div ref={chartRef} style={{ width: "600px", height: "400px" }} />
      </div>
    </div>
  );
}
