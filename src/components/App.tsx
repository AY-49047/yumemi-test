import { useEffect } from "react";
import "./App.css";
// import {} from "../types";

export default function App() {
  const url = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  useEffect(() => {
    async function main() {
      try {
        const res = await fetch(`${url}/api/v1/prefectures`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-API-KEY": apiKey,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("APIレスポンス:", data);
      } catch (err) {
        console.error("エラー:", err);
      }
    }
    main();
  }, []);

  return (
    <>
      <div>ゆめみフロントエンドコーディング試験</div>
    </>
  );
}
