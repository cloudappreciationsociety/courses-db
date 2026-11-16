import { relations } from "drizzle-orm/relations";
import { school, department, campus, building, course, prerequisite, gradeScale, timeSlot, section, session, classroom, appUser, instructor, student, admin, registrationRequest, teaches, inCart, takes } from "./schema";

export const departmentRelations = relations(department, ({one, many}) => ({
	school: one(school, {
		fields: [department.schoolId],
		references: [school.schoolId]
	}),
	courses: many(course),
	instructors: many(instructor),
	students: many(student),
}));

export const schoolRelations = relations(school, ({many}) => ({
	departments: many(department),
}));

export const buildingRelations = relations(building, ({one, many}) => ({
	campus: one(campus, {
		fields: [building.campusId],
		references: [campus.campusId]
	}),
	classrooms: many(classroom),
}));

export const campusRelations = relations(campus, ({many}) => ({
	buildings: many(building),
}));

export const courseRelations = relations(course, ({one, many}) => ({
	department: one(department, {
		fields: [course.departmentId],
		references: [department.departmentId]
	}),
	prerequisites_courseId: many(prerequisite, {
		relationName: "prerequisite_courseId_course_courseId"
	}),
	prerequisites_targetCourseId: many(prerequisite, {
		relationName: "prerequisite_targetCourseId_course_courseId"
	}),
	sections: many(section),
}));

export const prerequisiteRelations = relations(prerequisite, ({one, many}) => ({
	course_courseId: one(course, {
		fields: [prerequisite.courseId],
		references: [course.courseId],
		relationName: "prerequisite_courseId_course_courseId"
	}),
	course_targetCourseId: one(course, {
		fields: [prerequisite.targetCourseId],
		references: [course.courseId],
		relationName: "prerequisite_targetCourseId_course_courseId"
	}),
	gradeScale: one(gradeScale, {
		fields: [prerequisite.minGrade],
		references: [gradeScale.grade]
	}),
	prerequisite: one(prerequisite, {
		fields: [prerequisite.courseId],
		references: [prerequisite.prereqId],
		relationName: "prerequisite_courseId_prerequisite_prereqId"
	}),
	prerequisites: many(prerequisite, {
		relationName: "prerequisite_courseId_prerequisite_prereqId"
	}),
}));

export const gradeScaleRelations = relations(gradeScale, ({many}) => ({
	prerequisites: many(prerequisite),
	takes: many(takes),
}));

export const sectionRelations = relations(section, ({one, many}) => ({
	timeSlot: one(timeSlot, {
		fields: [section.timeSlotId],
		references: [timeSlot.timeSlotId]
	}),
	course: one(course, {
		fields: [section.courseId],
		references: [course.courseId]
	}),
	session: one(session, {
		fields: [section.sessionId],
		references: [session.sessionId]
	}),
	classroom: one(classroom, {
		fields: [section.buildingId],
		references: [classroom.buildingId]
	}),
	registrationRequests_addSectionId: many(registrationRequest, {
		relationName: "registrationRequest_addSectionId_section_sectionId"
	}),
	registrationRequests_dropSectionId: many(registrationRequest, {
		relationName: "registrationRequest_dropSectionId_section_sectionId"
	}),
	teaches: many(teaches),
	inCarts: many(inCart),
	takes: many(takes),
}));

export const timeSlotRelations = relations(timeSlot, ({many}) => ({
	sections: many(section),
}));

export const sessionRelations = relations(session, ({many}) => ({
	sections: many(section),
}));

export const classroomRelations = relations(classroom, ({one, many}) => ({
	sections: many(section),
	building: one(building, {
		fields: [classroom.buildingId],
		references: [building.buildingId]
	}),
}));

export const instructorRelations = relations(instructor, ({one, many}) => ({
	appUser: one(appUser, {
		fields: [instructor.universityId],
		references: [appUser.universityId]
	}),
	department: one(department, {
		fields: [instructor.departmentId],
		references: [department.departmentId]
	}),
	teaches: many(teaches),
}));

export const appUserRelations = relations(appUser, ({many}) => ({
	instructors: many(instructor),
	students: many(student),
	admins: many(admin),
}));

export const studentRelations = relations(student, ({one, many}) => ({
	appUser: one(appUser, {
		fields: [student.universityId],
		references: [appUser.universityId]
	}),
	department: one(department, {
		fields: [student.departmentId],
		references: [department.departmentId]
	}),
	registrationRequests: many(registrationRequest),
	inCarts: many(inCart),
	takes: many(takes),
}));

export const adminRelations = relations(admin, ({one, many}) => ({
	appUser: one(appUser, {
		fields: [admin.universityId],
		references: [appUser.universityId]
	}),
	registrationRequests: many(registrationRequest),
}));

export const registrationRequestRelations = relations(registrationRequest, ({one}) => ({
	student: one(student, {
		fields: [registrationRequest.studentId],
		references: [student.universityId]
	}),
	section_addSectionId: one(section, {
		fields: [registrationRequest.addSectionId],
		references: [section.sectionId],
		relationName: "registrationRequest_addSectionId_section_sectionId"
	}),
	section_dropSectionId: one(section, {
		fields: [registrationRequest.dropSectionId],
		references: [section.sectionId],
		relationName: "registrationRequest_dropSectionId_section_sectionId"
	}),
	admin: one(admin, {
		fields: [registrationRequest.reviewedBy],
		references: [admin.universityId]
	}),
}));

export const teachesRelations = relations(teaches, ({one}) => ({
	instructor: one(instructor, {
		fields: [teaches.instructorId],
		references: [instructor.universityId]
	}),
	section: one(section, {
		fields: [teaches.sectionId],
		references: [section.sectionId]
	}),
}));

export const inCartRelations = relations(inCart, ({one}) => ({
	student: one(student, {
		fields: [inCart.studentId],
		references: [student.universityId]
	}),
	section: one(section, {
		fields: [inCart.sectionId],
		references: [section.sectionId]
	}),
}));

export const takesRelations = relations(takes, ({one}) => ({
	student: one(student, {
		fields: [takes.studentId],
		references: [student.universityId]
	}),
	section: one(section, {
		fields: [takes.sectionId],
		references: [section.sectionId]
	}),
	gradeScale: one(gradeScale, {
		fields: [takes.grade],
		references: [gradeScale.grade]
	}),
}));