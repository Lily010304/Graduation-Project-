import { useState } from 'react';
import * as store from '../lib/instructorStore';

export default function InstructorCourseList() {
  const [courses, setCourses] = useState(() => (store.listCoursesAssignedToCurrentInstructor ? store.listCoursesAssignedToCurrentInstructor() : (store.listCourses ? store.listCourses() : [])));
  // Instructors cannot create courses; manager-only. Hide creation UI.
  const filtered = courses;

  // No onCreate; creation is restricted to manager.

  // Instructors cannot delete/archive or publish/unpublish courses here.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Courses</h1>
        <p className="text-sm text-white/70">Manage your assigned courses and upload content.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-white/70">No courses found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl border border-white/30 p-5 bg-[#58ACA9] text-white shadow-lg">
              <div className="text-xl font-bold mb-3">{c.title}</div>
              <div className="text-sm mb-2 text-white/90">Level: {c.level}</div>
              <div className="text-sm text-white/90">Enrolled Students: {c.studentsCount ?? 0}</div>
              <div className="text-sm mb-4 text-white/90">Avg. Grade: {(c.avgGrade ?? 0)}%</div>
              <div className="flex items-center justify-center">
                <button
                  className="px-6 py-2 rounded-full bg-[#F29F05] text-white font-semibold shadow-lg hover:brightness-110 active:scale-95 transition"
                  onClick={()=> (window.location.hash = `#/dashboard/instructor/course/${c.id}`)}
                >
                  Manage Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
