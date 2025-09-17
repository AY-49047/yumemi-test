import { useEffect } from "react";
import "./App.css";
// import {} from "../types";

export default function App() {
  useEffect(() => {
    async function main() {
      const url = import.meta.env.API_BASE_URL;
      const apiKey = import.meta.env.API_KEY;

      try {
        const res = await fetch(url, {
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
