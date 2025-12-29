"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, TrendingUp, Users, Edit, Eye, Trash2 } from "lucide-react";

export default function CourseCard({
    course,
    isEnrolled = false,
    isMentor = false,
    progress = null,
    onEnroll,
    onDelete, // For mentor
    toggleFeature // For mentor
}) {
    // Safe Mentor Name Extraction
    const getMentorName = () => {
        if (typeof course.mentor === "string") return course.mentor;
        if (typeof course.mentor === "object" && course.mentor?.user?.name) return course.mentor.user.name;
        if (typeof course.mentor === "object" && course.mentor?.name) return course.mentor.name;
        return course.mentorName || "Unknown Mentor";
    };

    const mentorName = getMentorName();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative h-56 overflow-hidden">
                {course.image ? (
                    <Image
                        src={course.image}
                        width={600}
                        height={400}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <span className="text-sm">No Image</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                {course.category && (
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {typeof course.category === 'object' ? course.category.name : course.category}
                    </span>
                )}

                {/* Mentor Specific Overlays */}
                {isMentor && (
                    <div className="absolute top-3 left-3 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFeature && toggleFeature(course.id);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer z-20 ${course.isFeatured
                                ? "bg-yellow-400 text-gray-900"
                                : "bg-black/50 text-white hover:bg-black/70"
                                }`}
                        >
                            {course.isFeatured ? "Featured" : "Feature"}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < Math.floor(course.rating || 0) ? "currentColor" : "none"} stroke="currentColor" />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{course.rating || 0} ({course.reviewCount || 0} reviews)</span>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-500 transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                    {course.mentorImage ? (
                        <img src={course.mentorImage} alt={mentorName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-500">
                            {mentorName[0] || "M"}
                        </div>
                    )}
                    <span className="font-medium">{mentorName}</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp size={16} />
                        <span>{course.level || "Beginner"}</span>
                    </div>

                    {/* Dynamic Buttons based on Role/Status */}
                    {isMentor ? (
                        <div className="flex items-center gap-2">
                            <Link href={`/dashboard/mentor/courses/${course.id}/edit`} className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit size={18} />
                            </Link>
                            <button onClick={() => onDelete && onDelete(course)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Progress Bar for enrolled students */}
                            {progress !== null && isEnrolled ? (
                                <div className="flex flex-col w-full ml-4">
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                        <span>{progress}% Complete</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    {/* View Details Only */}
                                    {!onEnroll && (
                                        <Link href={`/courses/${course.id}`} className="text-red-500 font-bold text-sm hover:underline">
                                            View Details
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Enroll / Continue Button Area */}
                {!isMentor && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        {isEnrolled ? (
                            <Link
                                href={`/courses/${course.id}`}
                                className="block w-full text-center py-2.5 rounded-xl font-bold text-sm bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                                {progress === 100 ? "Completed" : "Continue Learning"}
                            </Link>
                        ) : (
                            onEnroll ? (
                                <button
                                    onClick={() => onEnroll(course.id)}
                                    className="block w-full text-center py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-shadow shadow-sm hover:shadow-md"
                                >
                                    Enroll Now
                                </button>
                            ) : (
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="block w-full text-center py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-shadow shadow-sm hover:shadow-md"
                                >
                                    Enroll Now
                                </Link>
                            )
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
