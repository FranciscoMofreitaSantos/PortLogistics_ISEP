export const Category = {
  SafetyAndSecurity: {
    label: "Safety and Security",
    sub: ["Onboard Security Check", "Customs Inspection"]
  },
  Maintenance: {
    label: "Maintenance",
    sub: ["Hull Repair", "Equipment Calibration"]
  },
  CleaningAndHousekeeping: {
    label: "Cleaning and HouseKeeping",
    sub: ["Deck Cleaning", "Waste Removal"]
  }
} as const;

export type CategoryKey = keyof typeof Category;        
export type Category = (typeof Category)[CategoryKey];    
export type Subcategory =
  (typeof Category)[CategoryKey]["sub"][number];           