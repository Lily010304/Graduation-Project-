import { useState } from 'react';
import * as store from '../lib/instructorStore';

export default function InstructorCourseList() {
  const [courses, setCourses] = useState(() => (store.listCoursesAssignedToCurrentInstructor ? store.listCoursesAssignedToCurrentInstructor() : (store.listCourses ? store.listCourses() : [])));
  // Instructors cannot create courses; manager-only. Hide creation UI.
  const filtered = courses;

  // No onCreate; creation is restricted to manager.

  // Instructors cannot delete/archive or publish/unpublish courses here.

  return (
    <div className="max-w-6xl mx-auto rounded-3xl p-0 md:p-0">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Courses</h1>
          <p className="text-sm text-[#0f5a56]/70">Manage your assigned courses and upload content.</p>
        </div>
        {/* Level filter removed per request; instructors see all assigned courses. */}
      </div>


      {filtered.length === 0 ? (
        <div className="text-sm text-[#0f5a56]/70">No courses found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl border border-black/10 p-4 bg-[#58ACA9] text-white shadow-sm">
              <div className="text-base font-semibold mb-1">{c.title}</div>
              <div className="text-sm mb-2">Level: {c.level}</div>
              <div className="text-sm">Enrolled Students: {c.studentsCount ?? 0}</div>
              <div className="text-sm mb-4">Avg. Grade: {(c.avgGrade ?? 0)}%</div>
              <div className="flex items-center justify-center">
                <button
                  className="px-6 py-2 rounded-full bg-[#F29F05] text-white font-semibold border border-black/10 shadow-inner hover:brightness-105 active:scale-95 transition"
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
