// 都道府県一覧
export interface Prefecture {
  prefCode: number;
  prefName: string;
}

export interface PrefListResponse {
  message: null | string;
  result: Prefecture[];
}

// 人口構成
export interface PopulationPoint {
  year: number;
  value: number;
}

export interface PopulationSeries {
  label: string;
  data: PopulationPoint[];
}

export interface PopulationComposition {
  boundaryYear: number;
  data: PopulationSeries[];
}
