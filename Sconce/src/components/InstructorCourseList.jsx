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
        <h1 className="text-2xl font-bold text-[#034242]\">Your Courses</h1>
        <p className="text-sm text-[#0f5a56]/70\">Manage your assigned courses and upload content.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-[#0f5a56]/70\">No courses found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl p-5 bg-[#58ACA9] text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-lg font-bold mb-3">{c.title}</div>
              <div className="space-y-2 mb-4 pb-4 border-b border-white/20">
                <div className="text-sm text-white/90">Level: {c.level}</div>
                <div className="text-sm text-white/90">Students: {c.studentsCount ?? 0}</div>
                <div className="text-sm text-white/90">Avg Grade: {(c.avgGrade ?? 0)}%</div>
              </div>
              <button
                className="w-full px-6 py-3 rounded-full bg-[#F29F05] text-white font-semibold text-base hover:brightness-110 active:scale-95 transition shadow-md"
                onClick={()=> (window.location.hash = `#/dashboard/instructor/course/${c.id}`)}
              >
                Manage Course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
