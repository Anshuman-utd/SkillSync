"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Clock, Users, Star, CheckCircle, Award, BookOpen } from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
            const data = await res.json();
            setCourse(data.course || null);
        }
      } catch (error) {
        console.error("Failed to load course", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setCourse((prev) => ({
          ...prev,
          isEnrolled: true,
          studentCount: (prev.studentCount || 0) + 1,
        }));
        alert("Enrolled successfully!");
      } else {
        alert(data.error || "Failed to enroll");
      }
    } catch (error) {
      console.error("Enrollment error", error);
      alert("Something went wrong");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading course details...</div>;
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const mentorName = course.mentor?.user?.name || "Unknown Mentor";
  const mentorImage = course.mentor?.user?.image;

  // Parse learning outcomes or use empty array
  let learningPoints = [];
  try {
    if (course.learningOutcomes) {
        learningPoints = JSON.parse(course.learningOutcomes);
    }
  } catch (e) {
    console.error("Failed to parse learning outcomes", e);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ---------------- HEADER SECTION ---------------- */}
      <div className="bg-gray-900 text-white py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {course.category?.name || "Course"}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4 leading-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star size={16} fill="currentColor" />
                <span>0.0</span>
                <span className="text-gray-400 font-normal ml-1">(0 reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{course.studentCount || 0} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{course.durationWeeks} weeks</span>
              </div>
              <span className="bg-gray-800 px-3 py-1 rounded text-xs text-white border border-gray-700">
                {course.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-16 mt-8 grid md:grid-cols-3 gap-10">
        
        {/* ---------------- LEFT COLUMN ---------------- */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Description */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Course</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
            {learningPoints.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                {learningPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{point}</span>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">No specific learning outcomes provided for this course.</p>
            )}
          </div>

          {/* Meet Your Mentor */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Meet Your Mentor</h2>
            <div className="flex items-center gap-4">
              <img
                src={mentorImage || "https://placehold.co/100"}
                alt={mentorName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <h3 className="font-bold text-gray-900">{mentorName}</h3>
                <p className="text-sm text-gray-500 mb-2">{course.mentor?.bio || "No bio provided."}</p>
                <a href={`/profile/${course.mentor?.id}`} className="text-sm text-red-500 font-medium hover:underline">
                    View Profile
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* ---------------- RIGHT COLUMN (STICKY) ---------------- */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="h-48 relative">
                <Image 
                    src={course.imageUrl || course.image} 
                    alt={course.title} 
                    fill
                    className="object-cover"
                />
            </div>
            
            <div className="p-6">
              <div className="flex items-end gap-2 mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                </h2>
                {course.price === 0 && (
                    <span className="text-gray-500 text-sm mb-1 line-through">$99.00</span>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={course.isEnrolled || enrolling}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all shadow-md ${
                  course.isEnrolled
                    ? "bg-green-100 text-green-600 cursor-default"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                }`}
              >
                {enrolling ? "Enrolling..." : course.isEnrolled ? "Enrolled" : "Enroll Now"}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                30-Day Money-Back Guarantee
              </p>

              <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Clock size={16}/> Duration</span>
                    <span className="font-medium text-gray-900">{course.durationWeeks} weeks</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><BookOpen size={16}/> Level</span>
                    <span className="font-medium text-gray-900">{course.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Users size={16}/> Students</span>
                    <span className="font-medium text-gray-900">{course.studentCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Award size={16}/> Certificate</span>
                    <span className="font-medium text-gray-900">Yes</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

