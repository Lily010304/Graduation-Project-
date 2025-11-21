// Wrapper to provide stable named exports for bundler
import * as store from './instructorStore.js';

export const LEVELS = store.LEVELS;
export const listCourses = store.listCourses;
export const listCoursesAssignedToCurrentInstructor = store.listCoursesAssignedToCurrentInstructor;
export const getCurrentInstructorId = store.getCurrentInstructorId;
export const getCourse = store.getCourse;
export const createCourse = store.createCourse;
export const updateCourse = store.updateCourse;
export const deleteCourse = store.deleteCourse;
export const publishCourse = store.publishCourse;
export const addWeek = store.addWeek;
export const addDay = store.addDay;
export const addContentItem = store.addContentItem;
export const updateItem = store.updateItem;
export const removeItem = store.removeItem;
export const renameWeek = store.renameWeek;
export const updateWeek = store.updateWeek;
export const renameDay = store.renameDay;
export const removeWeek = store.removeWeek;
export const removeDay = store.removeDay;
export const parseInstructorHash = store.parseInstructorHash;
