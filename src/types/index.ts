export interface Prefecture {
  prefCode: number;
  prefName: string;
}

export interface PrefecturesResponse {
  message: string | null;
  result: Prefecture[];
}

export interface PopulationData {
  year: number;
  value: number;
}

export interface PopulationCategory {
  label: string;
  data: PopulationData[];
}

export interface PopulationResponse {
  message: string | null;
  result: {
    boundaryYear: number;
    data: PopulationCategory[];
  };
}

export type PopulationType =
  | "総人口"
  | "年少人口"
  | "生産年齢人口"
  | "老年人口";
