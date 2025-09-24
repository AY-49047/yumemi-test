import React from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import type { PopulationType } from "../../types";

interface PopulationTypeSelectorProps {
  selectedType: PopulationType;
  onTypeChange: (type: PopulationType) => void;
}

const populationTypes: PopulationType[] = [
  "総人口",
  "年少人口",
  "生産年齢人口",
  "老年人口",
];

export const PopulationTypeSelector: React.FC<PopulationTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as PopulationType)}
          sx={{ gap: 2 }}
        >
          {populationTypes.map((type) => (
            <FormControlLabel
              key={type}
              value={type}
              control={<Radio size="small" />}
              label={type}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.875rem",
                },
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
