export const CTStatus = {
   Scheduled : "Scheduled",
   InProgress : "InProgress",
   Completed: "Completed"
} as const;

export type CTStatus = typeof CTStatus[keyof typeof CTStatus];