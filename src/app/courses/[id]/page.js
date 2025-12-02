'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';



export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      setCourse(data.course || null);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!course) return <div className="p-6">Course not found.</div>;

  const cats = course.categories?.map((cc) => cc.category.name) || [];
  const mentorName = course.mentor?.user?.name || 'Unknown Mentor';

  return (
    <div className="min-h-screen bg-white text-black">
      {course.imageUrl && (
        <div className="h-64 w-full overflow-hidden">
          <Image src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-3 flex-wrap">
          {cats.map((c) => (
            <span key={c} className="px-2 py-1 text-xs bg-gray-100 rounded-md">{c}</span>
          ))}
        </div>
        <h1 className="text-2xl font-semibold mb-2">{course.title}</h1>
        <p className="text-gray-700 mb-4">By {mentorName}</p>
        <div className="flex gap-4 text-sm text-gray-600 mb-6">
          <span>⭐ {course.rating.toFixed(1)}</span>
          <span>{course.durationWeeks} weeks</span>
          <span className="capitalize">{course.level.toLowerCase()}</span>
        </div>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{course.description}</p>
      </div>
    </div>
  );
}

