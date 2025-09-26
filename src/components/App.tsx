import { useEffect, useState, useRef } from "react";
import "./App.css";
import type {
  Prefecture,
  PrefecturesResponse,
  PopulationResponse,
  PopulationType,
} from "../types";
import { Checkbox, FormControlLabel, RadioGroup, Radio } from "@mui/material";
import * as echarts from "echarts";

export default function PrefectureCheckboxes() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [checkedCodes, setCheckedCodes] = useState<number[]>([]);
  const [populations, setPopulations] = useState<
    Record<number, PopulationResponse["result"]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  const url = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  const [popLabel, setPopLabel] = useState<PopulationType>("総人口");

  // 都道府県一覧
  useEffect(() => {
    async function loadPrefectures() {
      try {
        setError(null);
        const res = await fetch(`${url}/api/v1/prefectures`, {
          headers: { "X-API-KEY": apiKey },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PrefecturesResponse = await res.json();
        setPrefectures(json.result || []);
      } catch {
        setError("都道府県一覧の取得に失敗しました");
      }
    }
    loadPrefectures();
  }, [url, apiKey]);

  // チェックの切り替え
  function toggle(code: number) {
    setCheckedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  // チェックされたら人口構成を読み込む
  useEffect(() => {
    async function loadPopulations() {
      const targets = checkedCodes.filter(
        (code) => populations[code] === undefined
      );
      if (targets.length === 0) return;

      setLoading(true);
      setError(null);

      const next: Record<number, PopulationResponse["result"]> = {
        ...populations,
      };
      try {
        for (const code of targets) {
          const res = await fetch(
            `${url}/api/v1/population/composition/perYear?prefCode=${code}`,
            { headers: { "X-API-KEY": apiKey } }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: PopulationResponse = await res.json();
          next[code] = json.result;
        }
        setPopulations(next);
        console.log("人口構成データ:", next);
      } catch {
        setError("人口構成の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadPopulations();
  }, [checkedCodes, url, apiKey, populations]);

  function getLatestTotal(pop: PopulationResponse["result"]): string {
    if (!pop) return "取得待ち…";
    const series = pop.data.find((s) => s.label === "総人口") ?? pop.data[0];
    if (!series || series.data.length === 0) return "データなし";
    const lastData = series.data[series.data.length - 1];
    return `${lastData.value.toLocaleString()}人（${lastData.year}年）`;
  }

  // 複数選択対応（未選択時は何も描かない）
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const chart = echarts.getInstanceByDom(el) || echarts.init(el);

    // チェック済み & データ取得済みのみ対象
    const picked = checkedCodes
      .map((code) => populations[code])
      .filter(
        (comp): comp is PopulationResponse["result"] =>
          !!comp && Array.isArray(comp.data) && comp.data.length > 0
      );

    // 未選択 → グラフを空にする
    if (picked.length === 0) {
      chart.clear();
      chart.resize();
      return;
    }

    // 選択あり：選択中のラベルを優先（なければ総人口→先頭）
    const yearSet = new Set<number>();
    const seriesSources = picked.map((comp) => {
      const s =
        comp.data.find((d) => d.label === popLabel) ??
        comp.data.find((d) => d.label === "総人口") ??
        comp.data[0];
      s.data.forEach((pt) => yearSet.add(pt.year));
      return s;
    });
    const years = Array.from(yearSet).sort((a, b) => a - b);

    const series = seriesSources.map((s) => {
      const data = years.map((y) => {
        const pt = s.data.find((d) => d.year === y);
        return pt ? pt.value : null;
      });
      return {
        type: "line",
        data,
      };
    });

    chart.setOption(
      {
        xAxis: {
          data: years,
          type: "category",
          name: "年",
          axisLine: { show: true },
          axisTick: { show: true },
          minorTick: { show: true },
          minorSplitLine: { show: true },
          axisLabel: { show: true },
        },
        yAxis: {
          type: "value",
          name: "人口数",
          axisLine: { show: true },
          axisTick: { show: true },
          minorTick: { show: true },
          splitLine: { show: true },
          minorSplitLine: { show: true },
          axisLabel: { show: true },
        },
        series,
      },
      { replaceMerge: ["series"] }
    );

    chart.resize();
  }, [checkedCodes, populations, popLabel]);

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
        <h4>人口構成（最新年の{popLabel}）</h4>
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
        <h1>Select Graph Label</h1>
        <div style={{ margin: "8px 0 16px" }}>
          <RadioGroup
            row
            name="population-kind"
            value={popLabel}
            onChange={(e) => setPopLabel(e.target.value as PopulationType)}
          >
            <FormControlLabel
              value="総人口"
              control={<Radio />}
              label="総人口"
            />
            <FormControlLabel
              value="年少人口"
              control={<Radio />}
              label="年少人口"
            />
            <FormControlLabel
              value="生産年齢人口"
              control={<Radio />}
              label="生産年齢人口"
            />
            <FormControlLabel
              value="老年人口"
              control={<Radio />}
              label="老年人口"
            />
          </RadioGroup>
        </div>
        <div style={{ position: "relative", width: "600px", height: "400px" }}>
          <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
          {checkedCodes.length === 0 && (
            <div
              aria-live="polite"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              都道府県を選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
