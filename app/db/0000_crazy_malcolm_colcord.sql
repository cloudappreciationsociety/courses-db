-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "department" (
	"department_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"school_id" text NOT NULL,
	CONSTRAINT "department_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "campus" (
	"campus_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "campus_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "building" (
	"building_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"campus_id" text NOT NULL,
	CONSTRAINT "building_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"admin_id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor" (
	"instructor_id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"department_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"student_id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"career_level" text NOT NULL,
	"total_credits" numeric(5, 1) DEFAULT '0' NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "student_career_level_check" CHECK (career_level = ANY (ARRAY['undergrad'::text, 'grad'::text])),
	CONSTRAINT "student_total_credits_check" CHECK (total_credits >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "course" (
	"course_id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"credits" numeric(3, 1) NOT NULL,
	"description" text,
	"requires_dept_consent" boolean DEFAULT false NOT NULL,
	"career_level" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "course_credits_check" CHECK (credits > (0)::numeric),
	CONSTRAINT "course_career_level_check" CHECK (career_level = ANY (ARRAY['undergrad'::text, 'grad'::text]))
);
--> statement-breakpoint
CREATE TABLE "grade_scale" (
	"grade" text PRIMARY KEY NOT NULL,
	"grade_points" numeric(4, 3)
);
--> statement-breakpoint
CREATE TABLE "prerequisite" (
	"prereq_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prerequisite_prereq_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"course_id" text NOT NULL,
	"prereq_type" text NOT NULL,
	"parent_prereq_id" integer,
	"target_course_id" text,
	"min_grade" text,
	CONSTRAINT "prerequisite_prereq_id_course_id_key" UNIQUE("prereq_id","course_id"),
	CONSTRAINT "prerequisite_prereq_type_check" CHECK (prereq_type = ANY (ARRAY['and'::text, 'or'::text, 'not'::text, 'course'::text])),
	CONSTRAINT "prerequisite_check" CHECK ((parent_prereq_id IS NULL) OR (parent_prereq_id <> prereq_id)),
	CONSTRAINT "prerequisite_check1" CHECK (((prereq_type = 'course'::text) AND (target_course_id IS NOT NULL) AND (target_course_id <> course_id)) OR ((prereq_type <> 'course'::text) AND (target_course_id IS NULL) AND (min_grade IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "registration_request" (
	"request_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "registration_request_request_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"student_id" text NOT NULL,
	"add_section_id" integer,
	"drop_section_id" integer,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"admin_note" text,
	CONSTRAINT "registration_request_request_type_check" CHECK (request_type = ANY (ARRAY['enroll'::text, 'swap'::text, 'drop'::text])),
	CONSTRAINT "registration_request_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text, 'waitlisted'::text])),
	CONSTRAINT "registration_request_check" CHECK (((request_type = 'swap'::text) AND (add_section_id IS NOT NULL) AND (drop_section_id IS NOT NULL) AND (add_section_id <> drop_section_id)) OR ((request_type = 'enroll'::text) AND (add_section_id IS NOT NULL) AND (drop_section_id IS NULL)) OR ((request_type = 'drop'::text) AND (add_section_id IS NULL) AND (drop_section_id IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "school" (
	"school_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "school_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "section" (
	"section_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "section_section_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"course_id" text NOT NULL,
	"section_code" text NOT NULL,
	"session_id" text NOT NULL,
	"component" text DEFAULT 'lecture' NOT NULL,
	"instruction_mode" text DEFAULT 'in_person' NOT NULL,
	"notes" text,
	"enrolled_count" integer DEFAULT 0 NOT NULL,
	"waitlist_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"capacity" integer DEFAULT 30 NOT NULL,
	"building_id" text,
	"room_number" text,
	"time_slot_id" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	CONSTRAINT "section_course_id_section_code_session_id_key" UNIQUE("session_id","section_code","course_id"),
	CONSTRAINT "section_component_check" CHECK (component = ANY (ARRAY['lecture'::text, 'recitation'::text, 'laboratory'::text])),
	CONSTRAINT "section_instruction_mode_check" CHECK (instruction_mode = ANY (ARRAY['in_person'::text, 'online'::text, 'hybrid'::text])),
	CONSTRAINT "section_enrolled_count_check" CHECK (enrolled_count >= 0),
	CONSTRAINT "section_waitlist_count_check" CHECK (waitlist_count >= 0),
	CONSTRAINT "section_status_check" CHECK (status = ANY (ARRAY['open'::text, 'waitlist'::text, 'closed'::text, 'canceled'::text])),
	CONSTRAINT "section_capacity_check" CHECK (capacity >= 0),
	CONSTRAINT "section_check" CHECK ((building_id IS NULL) = (room_number IS NULL)),
	CONSTRAINT "section_check1" CHECK ((instruction_mode = 'online'::text) OR (building_id IS NOT NULL)),
	CONSTRAINT "section_check2" CHECK (enrolled_count <= capacity)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_id" text PRIMARY KEY NOT NULL,
	"semester" text NOT NULL,
	"year" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "session_semester_check" CHECK (semester = ANY (ARRAY['fall'::text, 'spring'::text, 'summer'::text]))
);
--> statement-breakpoint
CREATE TABLE "teaches" (
	"instructor_id" text NOT NULL,
	"section_id" integer NOT NULL,
	CONSTRAINT "teaches_pkey" PRIMARY KEY("section_id","instructor_id")
);
--> statement-breakpoint
CREATE TABLE "in_cart" (
	"student_id" text NOT NULL,
	"section_id" integer NOT NULL,
	CONSTRAINT "in_cart_pkey" PRIMARY KEY("student_id","section_id")
);
--> statement-breakpoint
CREATE TABLE "classroom" (
	"building_id" text NOT NULL,
	"room_number" text NOT NULL,
	CONSTRAINT "classroom_pkey" PRIMARY KEY("room_number","building_id")
);
--> statement-breakpoint
CREATE TABLE "time_slot" (
	"time_slot_id" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	CONSTRAINT "time_slot_pkey" PRIMARY KEY("time_slot_id","start_time","end_time"),
	CONSTRAINT "time_slot_check" CHECK (end_time > start_time)
);
--> statement-breakpoint
CREATE TABLE "takes" (
	"student_id" text NOT NULL,
	"section_id" integer NOT NULL,
	"status" text NOT NULL,
	"waitlist_position" integer,
	"grade" text,
	CONSTRAINT "takes_pkey" PRIMARY KEY("student_id","section_id"),
	CONSTRAINT "takes_status_check" CHECK (status = ANY (ARRAY['enrolled'::text, 'waitlisted'::text, 'dropped'::text, 'completed'::text])),
	CONSTRAINT "takes_waitlist_position_check" CHECK (waitlist_position > 0),
	CONSTRAINT "takes_check" CHECK ((status = 'waitlisted'::text) = (waitlist_position IS NOT NULL)),
	CONSTRAINT "takes_check1" CHECK ((grade IS NULL) OR (status = 'completed'::text))
);
--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."school"("school_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building" ADD CONSTRAINT "building_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campus"("campus_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor" ADD CONSTRAINT "instructor_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("department_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("department_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("department_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("course_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_target_course_id_fkey" FOREIGN KEY ("target_course_id") REFERENCES "public"."course"("course_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_min_grade_fkey" FOREIGN KEY ("min_grade") REFERENCES "public"."grade_scale"("grade") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_parent_prereq_id_course_id_fkey" FOREIGN KEY ("course_id","parent_prereq_id") REFERENCES "public"."prerequisite"("prereq_id","course_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "registration_request" ADD CONSTRAINT "registration_request_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student"("student_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_request" ADD CONSTRAINT "registration_request_add_section_id_fkey" FOREIGN KEY ("add_section_id") REFERENCES "public"."section"("section_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_request" ADD CONSTRAINT "registration_request_drop_section_id_fkey" FOREIGN KEY ("drop_section_id") REFERENCES "public"."section"("section_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_request" ADD CONSTRAINT "registration_request_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admin"("admin_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("course_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("session_id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_building_id_room_number_fkey" FOREIGN KEY ("building_id","room_number") REFERENCES "public"."classroom"("building_id","room_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_time_slot_id_start_time_end_time_fkey" FOREIGN KEY ("time_slot_id","start_time","end_time") REFERENCES "public"."time_slot"("time_slot_id","start_time","end_time") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaches" ADD CONSTRAINT "teaches_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor"("instructor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaches" ADD CONSTRAINT "teaches_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."section"("section_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_cart" ADD CONSTRAINT "in_cart_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_cart" ADD CONSTRAINT "in_cart_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."section"("section_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."building"("building_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takes" ADD CONSTRAINT "takes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student"("student_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takes" ADD CONSTRAINT "takes_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."section"("section_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takes" ADD CONSTRAINT "takes_grade_fkey" FOREIGN KEY ("grade") REFERENCES "public"."grade_scale"("grade") ON DELETE no action ON UPDATE no action;
*/