// Simple localStorage-backed store for instructor courses
// Data model
// Course: { id, title, level, description, published, instructors?: string[], weeks: Week[] }
// Week: { id, number, title, startDate?: string, days?: Day[], items?: ContentItem[] }
// Day: { id, number, title, items: ContentItem[] }
// ContentItem: { id, type: 'lecture'|'reading'|'assignment'|'quiz'|'resource', title, description?, durationMins?, url?, hidden?: boolean }

const STORAGE_KEY = 'sconce.instructor.courses.v1';

function uid(prefix = 'id') {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function loadRaw() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) return [];
		return data;
	} catch {
		return [];
	}
}

function saveRaw(courses) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
	} catch {
		// ignore write errors (e.g., storage full)
	}
}

// Seed with a sample course if none exist
function ensureSeed() {
	const courses = loadRaw();
	if (courses.length) return courses;
		const cId = uid('course');
	const currentInstructorId = getCurrentInstructorId();
		const fmt = (d) => d.toISOString().slice(0,10);
		const today = new Date();
		const nextWeek = new Date(today.getTime() + 7*24*60*60*1000);
	const w1 = { id: uid('week'), number: 1, title: 'Getting Started', startDate: fmt(today), items: [], days: [] };
	const w2 = { id: uid('week'), number: 2, title: 'Core Concepts', startDate: fmt(nextWeek), items: [], days: [] };
		const d1 = { id: uid('day'), number: 1, title: 'Introduction', items: [
			{ id: uid('item'), type: 'lecture', title: 'Welcome and Syllabus Overview', description: 'Course walkthrough and expectations', durationMins: 20, hidden: false },
			{ id: uid('item'), type: 'reading', title: 'Read: Course Handbook', url: '#', description: 'Policies and resources', hidden: false }
		]};
		const d2 = { id: uid('day'), number: 2, title: 'Tools Setup', items: [
			{ id: uid('item'), type: 'resource', title: 'Download Starter Files', url: '#', hidden: false },
			{ id: uid('item'), type: 'assignment', title: 'Setup Checklist', description: 'Verify your environment', durationMins: 30, hidden: false }
		]};
		// Also seed week-level items (no days) for the new structure
		w1.items.push(
			{ id: uid('item'), type: 'lecture', title: 'Intro Lecture (Week-level)', description: 'Overview without days', durationMins: 15, hidden: false },
		);
		w2.items.push(
			{ id: uid('item'), type: 'reading', title: 'Read: Chapter 1', url: '#', hidden: false },
		);
		w1.days.push(d1, d2);
	const seedCourse = {
		id: cId,
		title: 'Sample Course',
		level: 'Level 1',
		description: 'An example structured course with weeks and days',
		published: false,
			instructors: [currentInstructorId],
		weeks: [w1, w2]
	};
	saveRaw([seedCourse]);
	return [seedCourse];
}

export const LEVELS = ['Level 1', 'Level 2', 'Level 3'];

export function listCourses() {
	return ensureSeed();
}

const INSTRUCTOR_ID_KEY = 'sconce.currentInstructorId.v1';
export function getCurrentInstructorId() {
	try {
		let id = localStorage.getItem(INSTRUCTOR_ID_KEY);
		if (!id) {
			id = 'instructor_demo';
			localStorage.setItem(INSTRUCTOR_ID_KEY, id);
		}
		return id;
	} catch {
		return 'instructor_demo';
	}
}

export function listCoursesAssignedToCurrentInstructor() {
	const id = getCurrentInstructorId();
	return listCourses().filter(c => Array.isArray(c.instructors) ? c.instructors.includes(id) : true);
}

export function getCourse(courseId) {
	return listCourses().find(c => c.id === courseId) || null;
}

export function createCourse({ title, level = LEVELS[0], description = '' }) {
	const courses = listCourses();
	const course = { id: uid('course'), title, level, description, published: false, weeks: [] };
	const next = [...courses, course];
	saveRaw(next);
	return course;
}

export function updateCourse(courseId, patch) {
	const courses = listCourses();
	const idx = courses.findIndex(c => c.id === courseId);
	if (idx === -1) return null;
	const updated = { ...courses[idx], ...patch };
	const next = [...courses];
	next[idx] = updated;
	saveRaw(next);
	return updated;
}

export function deleteCourse(courseId) {
	const courses = listCourses().filter(c => c.id !== courseId);
	saveRaw(courses);
}

export function publishCourse(courseId, published) {
	return updateCourse(courseId, { published: !!published });
}

export function addWeek(courseId, { title } = {}) {
	const courses = listCourses();
	const idx = courses.findIndex(c => c.id === courseId);
	if (idx === -1) return null;
	const course = courses[idx];
	const number = (course.weeks?.length || 0) + 1;
		const week = { id: uid('week'), number, title: title || `Week ${number}`, startDate: undefined, days: [] };
	const updated = { ...course, weeks: [...course.weeks, week] };
	courses[idx] = updated;
	saveRaw(courses);
	return week;
}

export function addDay(courseId, weekId, { title } = {}) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	const number = (week.days?.length || 0) + 1;
	const day = { id: uid('day'), number, title: title || `Day ${number}`, items: [] };
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, days: [...week.days, day] };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return day;
}

export function addContentItem(courseId, weekId, dayId, item) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	const newItem = { id: uid('item'), hidden: false, ...item };
	// If dayId provided and exists, add under day; otherwise add at week level
	if (dayId) {
		const dIdx = (week.days || []).findIndex(d => d.id === dayId);
		if (dIdx === -1) return null;
		const day = week.days[dIdx];
		const newWeeks = [...course.weeks];
		const newDays = [...week.days];
		newDays[dIdx] = { ...day, items: [...(day.items||[]), newItem] };
		newWeeks[wIdx] = { ...week, days: newDays };
		courses[cIdx] = { ...course, weeks: newWeeks };
		saveRaw(courses);
		return newItem;
	}
	const newWeeks = [...course.weeks];
	const items = week.items || [];
	newWeeks[wIdx] = { ...week, items: [...items, newItem] };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return newItem;
}

export function updateItem(courseId, weekId, dayId, itemId, patch) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	// If dayId provided, update within that day; else within week.items
	if (dayId) {
		const dIdx = (week.days || []).findIndex(d => d.id === dayId);
		if (dIdx === -1) return null;
		const day = week.days[dIdx];
		const iIdx = (day.items||[]).findIndex(i => i.id === itemId);
		if (iIdx === -1) return null;
		const newItem = { ...(day.items[iIdx]), ...patch };
		const newWeeks = [...course.weeks];
		const newDays = [...week.days];
		const newItems = [...day.items];
		newItems[iIdx] = newItem;
		newDays[dIdx] = { ...day, items: newItems };
		newWeeks[wIdx] = { ...week, days: newDays };
		courses[cIdx] = { ...course, weeks: newWeeks };
		saveRaw(courses);
		return newItem;
	}
	const items = week.items || [];
	const iIdx = items.findIndex(i => i.id === itemId);
	if (iIdx === -1) return null;
	const newItem = { ...items[iIdx], ...patch };
	const newItems = [...items];
	newItems[iIdx] = newItem;
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, items: newItems };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return newItem;
}

export function removeItem(courseId, weekId, dayId, itemId) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return;
	const week = course.weeks[wIdx];
	if (dayId) {
		const dIdx = (week.days || []).findIndex(d => d.id === dayId);
		if (dIdx === -1) return;
		const day = week.days[dIdx];
		const newItems = (day.items || []).filter(i => i.id !== itemId);
		const newWeeks = [...course.weeks];
		const newDays = [...week.days];
		newDays[dIdx] = { ...day, items: newItems };
		newWeeks[wIdx] = { ...week, days: newDays };
		courses[cIdx] = { ...course, weeks: newWeeks };
		saveRaw(courses);
		return;
	}
	const newItems = (week.items || []).filter(i => i.id !== itemId);
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, items: newItems };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
}

export function renameWeek(courseId, weekId, title) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, title };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return newWeeks[wIdx];
}

export function updateWeek(courseId, weekId, patch) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, ...patch };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return newWeeks[wIdx];
}

export function renameDay(courseId, weekId, dayId, title) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return null;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return null;
	const week = course.weeks[wIdx];
	const dIdx = week.days.findIndex(d => d.id === dayId);
	if (dIdx === -1) return null;
	const day = week.days[dIdx];
	const newWeeks = [...course.weeks];
	const newDays = [...week.days];
	newDays[dIdx] = { ...day, title };
	newWeeks[wIdx] = { ...week, days: newDays };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
	return newDays[dIdx];
}

export function removeWeek(courseId, weekId) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return;
	const course = courses[cIdx];
	const newWeeks = course.weeks.filter(w => w.id !== weekId).map((w, i) => ({ ...w, number: i + 1 }));
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
}

export function removeDay(courseId, weekId, dayId) {
	const courses = listCourses();
	const cIdx = courses.findIndex(c => c.id === courseId);
	if (cIdx === -1) return;
	const course = courses[cIdx];
	const wIdx = course.weeks.findIndex(w => w.id === weekId);
	if (wIdx === -1) return;
	const week = course.weeks[wIdx];
	const newDays = week.days.filter(d => d.id !== dayId).map((d, i) => ({ ...d, number: i + 1 }));
	const newWeeks = [...course.weeks];
	newWeeks[wIdx] = { ...week, days: newDays };
	courses[cIdx] = { ...course, weeks: newWeeks };
	saveRaw(courses);
}

// Utility to parse instructor subroutes
export function parseInstructorHash(hash = window.location.hash) {
	// Supported:
	// #/dashboard/instructor                      -> home dashboard
	// #/dashboard/instructor/courses              -> courses list
	// #/dashboard/instructor/notebooks            -> AI notebooks
	// #/dashboard/instructor/notebook/<notebookId> -> single AI notebook detail (new layout)
	// #/dashboard/instructor/messages             -> messages
	// #/dashboard/instructor/schedule             -> schedule
	// #/dashboard/instructor/course/<courseId>    -> course editor
	// #/dashboard/instructor/quiz/<quizId>        -> quiz builder
	const base = '#/dashboard/instructor';
	if (!hash || !hash.startsWith(base)) return { view: 'home' };
	const parts = hash.slice(base.length).split('/').filter(Boolean);
	if (parts.length === 0) return { view: 'home' };
	if (parts[0] === 'course' && parts[1]) return { view: 'course', courseId: parts[1] };
	// Quiz builder route
	if (parts[0] === 'quiz' && parts[1]) {
		const quizId = parts[1].split('?')[0];
		const params = new URLSearchParams(hash.split('?')[1] || '');
		return { 
			view: 'quiz', 
			quizId,
			courseId: params.get('course'),
			weekId: params.get('week')
		};
	}
	// Notebook detail route (singular)
	if (parts[0] === 'notebook' && parts[1]) {
		return { view: 'notebook', notebookId: parts[1] };
	}
	const valid = new Set(['courses','notebooks','messages','schedule']);
	if (valid.has(parts[0])) return { view: parts[0] };
	return { view: 'home' };
}

// Provide a default export object alongside named exports for bundlers
export default {
	LEVELS,
	listCourses,
	getCurrentInstructorId,
	listCoursesAssignedToCurrentInstructor,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	publishCourse,
	addWeek,
	addDay,
	addContentItem,
	updateItem,
	removeItem,
	renameWeek,
	updateWeek,
	renameDay,
	removeWeek,
	removeDay,
	parseInstructorHash,
};

