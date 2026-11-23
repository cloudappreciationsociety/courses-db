import { pgTable, check, text, integer, date, unique, foreignKey, numeric, boolean, time, timestamp, primaryKey, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const session = pgTable("session", {
	sessionId: text("session_id").primaryKey().notNull(),
	semester: text().notNull(),
	year: integer().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
}, (table) => [
	check("session_semester_check", sql`semester = ANY (ARRAY['fall'::text, 'spring'::text, 'summer'::text])`),
]);

export const school = pgTable("school", {
	schoolId: text("school_id").primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("school_name_key").on(table.name),
]);

export const subject = pgTable("subject", {
	subjectId: text("subject_id").primaryKey().notNull(),
	name: text().notNull(),
	schoolId: text("school_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.schoolId],
			foreignColumns: [school.schoolId],
			name: "subject_school_id_fkey"
		}),
]);

export const appUser = pgTable("app_user", {
	universityId: text("university_id").primaryKey().notNull(),
	netId: text("net_id").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	password: text().notNull(),
	role: text().notNull(),
}, (table) => [
	unique("app_user_net_id_key").on(table.netId),
	check("app_user_role_check", sql`role = ANY (ARRAY['student'::text, 'admin'::text, 'instructor'::text])`),
]);

export const campus = pgTable("campus", {
	campusId: text("campus_id").primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("campus_name_key").on(table.name),
]);

export const building = pgTable("building", {
	buildingId: text("building_id").primaryKey().notNull(),
	name: text().notNull(),
	campusId: text("campus_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campusId],
			foreignColumns: [campus.campusId],
			name: "building_campus_id_fkey"
		}),
	unique("building_name_key").on(table.name),
]);

export const gradeScale = pgTable("grade_scale", {
	grade: text().primaryKey().notNull(),
	gradePoints: numeric("grade_points", { precision: 4, scale:  3 }),
});

export const course = pgTable("course", {
	courseId: text("course_id").primaryKey().notNull(),
	title: text().notNull(),
	credits: numeric({ precision: 3, scale:  1 }).notNull(),
	description: text(),
	requiresDeptConsent: boolean("requires_dept_consent").default(false).notNull(),
	careerLevel: text("career_level").notNull(),
	subjectId: text("subject_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.subjectId],
			name: "course_subject_id_fkey"
		}).onUpdate("cascade"),
	check("course_credits_check", sql`credits > (0)::numeric`),
	check("course_career_level_check", sql`career_level = ANY (ARRAY['undergrad'::text, 'grad'::text])`),
]);

export const prerequisite = pgTable("prerequisite", {
	prereqId: integer("prereq_id").primaryKey().generatedAlwaysAsIdentity({ name: "prerequisite_prereq_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseId: text("course_id").notNull(),
	prereqType: text("prereq_type").notNull(),
	parentPrereqId: integer("parent_prereq_id"),
	targetCourseId: text("target_course_id"),
	minGrade: text("min_grade"),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.courseId],
			name: "prerequisite_course_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.targetCourseId],
			foreignColumns: [course.courseId],
			name: "prerequisite_target_course_id_fkey"
		}),
	foreignKey({
			columns: [table.minGrade],
			foreignColumns: [gradeScale.grade],
			name: "prerequisite_min_grade_fkey"
		}),
	foreignKey({
			columns: [table.courseId, table.parentPrereqId],
			foreignColumns: [table.prereqId, table.courseId],
			name: "prerequisite_parent_prereq_id_course_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("prerequisite_prereq_id_course_id_key").on(table.prereqId, table.courseId),
	check("prerequisite_prereq_type_check", sql`prereq_type = ANY (ARRAY['and'::text, 'or'::text, 'not'::text, 'course'::text])`),
	check("prerequisite_check", sql`(parent_prereq_id IS NULL) OR (parent_prereq_id <> prereq_id)`),
	check("prerequisite_check1", sql`((prereq_type = 'course'::text) AND (target_course_id IS NOT NULL) AND (target_course_id <> course_id)) OR ((prereq_type <> 'course'::text) AND (target_course_id IS NULL) AND (min_grade IS NULL))`),
]);

export const section = pgTable("section", {
	sectionId: integer("section_id").primaryKey().generatedAlwaysAsIdentity({ name: "section_section_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseId: text("course_id").notNull(),
	sectionCode: text("section_code").notNull(),
	sessionId: text("session_id").notNull(),
	component: text().default('lecture').notNull(),
	instructionMode: text("instruction_mode").default('in_person').notNull(),
	notes: text(),
	enrolledCount: integer("enrolled_count").default(0).notNull(),
	waitlistCount: integer("waitlist_count").default(0).notNull(),
	status: text().default('open').notNull(),
	capacity: integer().default(30).notNull(),
	buildingId: text("building_id"),
	roomNumber: text("room_number"),
	timeSlotId: text("time_slot_id").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.timeSlotId, table.startTime, table.endTime],
			foreignColumns: [timeSlot.timeSlotId, timeSlot.startTime, timeSlot.endTime],
			name: "section_time_slot_id_start_time_end_time_fkey"
		}),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.courseId],
			name: "section_course_id_fkey"
		}).onUpdate("cascade"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [session.sessionId],
			name: "section_session_id_fkey"
		}).onUpdate("cascade"),
	foreignKey({
			columns: [table.buildingId, table.roomNumber],
			foreignColumns: [classroom.buildingId, classroom.roomNumber],
			name: "section_building_id_room_number_fkey"
		}),
	unique("section_course_id_section_code_session_id_key").on(table.sessionId, table.sectionCode, table.courseId),
	check("section_component_check", sql`component = ANY (ARRAY['lecture'::text, 'recitation'::text, 'laboratory'::text])`),
	check("section_instruction_mode_check", sql`instruction_mode = ANY (ARRAY['in_person'::text, 'online'::text, 'hybrid'::text])`),
	check("section_enrolled_count_check", sql`enrolled_count >= 0`),
	check("section_waitlist_count_check", sql`waitlist_count >= 0`),
	check("section_status_check", sql`status = ANY (ARRAY['open'::text, 'waitlist'::text, 'closed'::text, 'canceled'::text])`),
	check("section_capacity_check", sql`capacity >= 0`),
	check("section_check", sql`(building_id IS NULL) = (room_number IS NULL)`),
	check("section_check1", sql`(instruction_mode = 'online'::text) OR (building_id IS NOT NULL)`),
	check("section_check2", sql`enrolled_count <= capacity`),
]);

export const student = pgTable("student", {
	universityId: text("university_id").primaryKey().notNull(),
	careerLevel: text("career_level").notNull(),
	totalCredits: numeric("total_credits", { precision: 5, scale:  1 }).default('0').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.universityId],
			foreignColumns: [appUser.universityId],
			name: "student_university_id_fkey"
		}).onDelete("cascade"),
	check("student_career_level_check", sql`career_level = ANY (ARRAY['undergrad'::text, 'grad'::text])`),
	check("student_total_credits_check", sql`total_credits >= (0)::numeric`),
]);

export const registrationRequest = pgTable("registration_request", {
	requestId: integer("request_id").primaryKey().generatedAlwaysAsIdentity({ name: "registration_request_request_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	studentId: text("student_id").notNull(),
	addSectionId: integer("add_section_id"),
	dropSectionId: integer("drop_section_id"),
	requestType: text("request_type").notNull(),
	status: text().default('pending').notNull(),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	reviewedBy: text("reviewed_by"),
	adminNote: text("admin_note"),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.universityId],
			name: "registration_request_student_id_fkey"
		}),
	foreignKey({
			columns: [table.addSectionId],
			foreignColumns: [section.sectionId],
			name: "registration_request_add_section_id_fkey"
		}),
	foreignKey({
			columns: [table.dropSectionId],
			foreignColumns: [section.sectionId],
			name: "registration_request_drop_section_id_fkey"
		}),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [appUser.universityId],
			name: "registration_request_reviewed_by_fkey"
		}),
	check("registration_request_request_type_check", sql`request_type = ANY (ARRAY['enroll'::text, 'swap'::text, 'drop'::text])`),
	check("registration_request_status_check", sql`status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text, 'waitlisted'::text])`),
	check("registration_request_check", sql`((request_type = 'swap'::text) AND (add_section_id IS NOT NULL) AND (drop_section_id IS NOT NULL) AND (add_section_id <> drop_section_id)) OR ((request_type = 'enroll'::text) AND (add_section_id IS NOT NULL) AND (drop_section_id IS NULL)) OR ((request_type = 'drop'::text) AND (add_section_id IS NULL) AND (drop_section_id IS NOT NULL))`),
]);

export const classroom = pgTable("classroom", {
	buildingId: text("building_id").notNull(),
	roomNumber: text("room_number").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [building.buildingId],
			name: "classroom_building_id_fkey"
		}),
	primaryKey({ columns: [table.roomNumber, table.buildingId], name: "classroom_pkey"}),
]);

export const teaches = pgTable("teaches", {
	instructorId: text("instructor_id").notNull(),
	sectionId: integer("section_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.instructorId],
			foreignColumns: [appUser.universityId],
			name: "teaches_instructor_id_fkey"
		}),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.sectionId],
			name: "teaches_section_id_fkey"
		}),
	primaryKey({ columns: [table.sectionId, table.instructorId], name: "teaches_pkey"}),
]);

export const inCart = pgTable("in_cart", {
	studentId: text("student_id").notNull(),
	sectionId: integer("section_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.universityId],
			name: "in_cart_student_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.sectionId],
			name: "in_cart_section_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.studentId, table.sectionId], name: "in_cart_pkey"}),
]);

export const timeSlot = pgTable("time_slot", {
	timeSlotId: text("time_slot_id").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
}, (table) => [
	primaryKey({ columns: [table.timeSlotId, table.startTime, table.endTime], name: "time_slot_pkey"}),
	check("time_slot_check", sql`end_time > start_time`),
]);

export const takes = pgTable("takes", {
	studentId: text("student_id").notNull(),
	sectionId: integer("section_id").notNull(),
	status: text().notNull(),
	waitlistPosition: integer("waitlist_position"),
	grade: text(),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.universityId],
			name: "takes_student_id_fkey"
		}),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.sectionId],
			name: "takes_section_id_fkey"
		}),
	foreignKey({
			columns: [table.grade],
			foreignColumns: [gradeScale.grade],
			name: "takes_grade_fkey"
		}),
	primaryKey({ columns: [table.studentId, table.sectionId], name: "takes_pkey"}),
	check("takes_status_check", sql`status = ANY (ARRAY['enrolled'::text, 'waitlisted'::text, 'dropped'::text, 'completed'::text])`),
	check("takes_waitlist_position_check", sql`waitlist_position > 0`),
	check("takes_check", sql`(status = 'waitlisted'::text) = (waitlist_position IS NOT NULL)`),
	check("takes_check1", sql`(grade IS NULL) OR (status = 'completed'::text)`),
]);
export const instructor = pgView("instructor", {	instructorId: text("instructor_id"),
}).as(sql`SELECT university_id AS instructor_id FROM app_user WHERE role = 'instructor'::text`);

export const admin = pgView("admin", {	adminId: text("admin_id"),
}).as(sql`SELECT university_id AS admin_id FROM app_user WHERE role = 'admin'::text`);