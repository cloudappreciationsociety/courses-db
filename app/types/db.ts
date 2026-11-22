// Enums used in the database
export type Day = "M" | "T" | "W" | "Th" | "F";

export type UserRole = "student" | "admin" | "instructor";

export type SectionStatus = "open" | "closed" | "waitlist" | "canceled";

export type Semester = "fall" | "spring" | "summer";

export type CareerLevel = "undergrad" | "grad";

export type SectionComponent = "lecture" | "recitation" | "laboratory";

export type SectionInstructionMode = "in_person" | "online" | "hybrid";

export type SectionEnrollmentStatus = "enrolled" | "dropped" | "waitlisted" | "completed";

export type RegistrationRequestType = "enroll" | "swap" | "drop";

export type RegistrationRequestStatus = "pending" | "approved" | "denied" | "waitlisted";

