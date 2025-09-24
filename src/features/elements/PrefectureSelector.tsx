import React from "react";
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import type { Prefecture } from "../../types";

interface PrefectureSelectorProps {
  prefectures: Prefecture[];
  selectedPrefectures: Set<number>;
  onPrefectureChange: (prefCode: number, checked: boolean) => void;
  loading?: boolean;
}

export const PrefectureSelector: React.FC<PrefectureSelectorProps> = ({
  prefectures,
  selectedPrefectures,
  onPrefectureChange,
  loading = false,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        都道府県
      </Typography>
      <FormControl
        component="fieldset"
        disabled={loading}
        sx={{ width: "100%" }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 1,
            mt: 2,
          }}
        >
          {prefectures.map((prefecture) => (
            <FormControlLabel
              key={prefecture.prefCode}
              control={
                <Checkbox
                  checked={selectedPrefectures.has(prefecture.prefCode)}
                  onChange={(e) =>
                    onPrefectureChange(prefecture.prefCode, e.target.checked)
                  }
                  name={prefecture.prefName}
                  size="small"
                />
              }
              label={prefecture.prefName}
              sx={{
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.875rem",
                },
              }}
            />
          ))}
        </Box>
      </FormControl>
    </Box>
  );
};
