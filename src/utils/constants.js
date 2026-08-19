/** Priority level definitions — keys match the store's priority_level field */
export const PRIORITY_LEVELS = {
  normal: { label: "Normal", color: "default", textColor: "text-teal" },
  high: { label: "High", color: "orange", textColor: "text-orange" },
  very_high: { label: "Very High", color: "red", textColor: "text-red" },
};

/** Ordered list for v-select / v-chip-group options */
export const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal", color: "teal" },
  { value: "high", label: "High", color: "orange" },
  { value: "very_high", label: "Very High", color: "red" },
];
