"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, BookOpen, Award, Clock, Upload, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    expertise: "",
    interests: "",
    imageFile: null,
    imagePreview: null
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setFormData({
            bio: data.profile.bio || "",
            skills: data.profile.skills || "",
            expertise: data.profile.expertise || "",
            interests: data.profile.interests || "",
            imagePreview: data.profile.image || null,
            imageFile: null
          });
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imageUrl = profile.image;

      if (formData.imageFile) {
        const fd = new FormData();
        fd.append("file", formData.imageFile);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        imageUrl = upData.url;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageUrl,
          bio: formData.bio,
          skills: formData.skills,
          expertise: formData.expertise,
          interests: formData.interests
        })
      });

      if (res.ok) {
        setProfile(prev => ({
            ...prev,
            image: imageUrl,
            bio: formData.bio,
            skills: formData.skills,
            expertise: formData.expertise,
            interests: formData.interests
        }));
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
        const res = await fetch("/api/users/profile", { method: "DELETE" });
        if (res.ok) {
            // Force full reload/redirect to ensure auth state is cleared on client
            window.location.href = "/login";
        } else {
            alert("Failed to delete account. Please try again.");
            setIsDeleting(false);
        }
    } catch (error) {
        console.error("Delete user error:", error);
        setIsDeleting(false);
    }
  };

  if (loading && !profile) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profile) return null;

  const isMentor = profile.role === "MENTOR";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* ---------------- LEFT COLUMN: INFO CARD ---------------- */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img 
                src={editing ? (formData.imagePreview || "https://placehold.co/150") : (profile.image || "https://placehold.co/150")} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover border-4 border-red-50"
              />
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Upload size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            {isMentor && (
                <div className="flex items-center justify-center gap-1 text-yellow-500 mt-1 text-sm font-medium">
                <Award size={16} />
                <span>{profile.avgRating || "0.0"} ({profile.totalReviews || 0} reviews)</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 bg-gray-50 p-4 rounded-xl">
              <div className="text-center">
                <div className="flex justify-center text-red-400 mb-1"><User size={20} /></div>
                <div className="font-bold text-gray-900 text-lg">
                  {isMentor ? profile.totalStudents : profile.enrolledCourses?.length || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {isMentor ? "Students" : "Enrolled"}
                </div>
              </div>
              <div className="text-center border-l border-gray-200">
                <div className="flex justify-center text-red-400 mb-1"><BookOpen size={20} /></div>
                <div className="font-bold text-gray-900 text-lg">
                  {isMentor ? profile.totalCourses : profile.enrolledCourses?.filter(c => c.completed).length || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {isMentor ? "Courses" : "Completed"}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {editing ? (
                 <div className="flex gap-2">
                    <button onClick={handleSave} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Check size={18} /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                        <X size={18} /> Cancel
                    </button>
                 </div>
              ) : (
                <>
                    <button className="w-full bg-red-400 hover:bg-red-500 text-white py-2 rounded-lg font-medium shadow-sm shadow-red-100 transition-all">
                        Connect with {isMentor ? "Mentor" : "Student"}
                    </button>
                    <button 
                        onClick={() => setEditing(true)}
                        className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT COLUMN: DETAILS ---------------- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
            {editing ? (
                <textarea 
                    className="w-full border p-3 rounded-lg" 
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                />
            ) : (
                <p className="text-gray-600 leading-relaxed">
                {profile.bio || "No bio provided yet."}
                </p>
            )}

            <h3 className="text-sm font-bold text-gray-900 mt-6 mb-3">
                {isMentor ? "Expertise" : "Interests"}
            </h3>
            
            {editing ? (
                 <input 
                    className="w-full border p-2 rounded-lg"
                    value={isMentor ? formData.expertise : formData.interests}
                    onChange={(e) => isMentor ? setFormData({...formData, expertise: e.target.value}) : setFormData({...formData, interests: e.target.value})}
                    placeholder={isMentor ? "e.g. Web Development, AI" : "e.g. Coding, Design"}
                 />
            ) : (
                <div className="flex flex-wrap gap-2">
                {(isMentor ? profile.expertise : profile.interests)?.split(',').map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                    {skill.trim()}
                    </span>
                )) || <span className="text-gray-400 text-sm">Not specified</span>}
                </div>
            )}

            {isMentor && (
                <>
                    <h3 className="text-sm font-bold text-gray-900 mt-6 mb-3">Skills</h3>
                    {editing ? (
                        <input 
                            className="w-full border p-2 rounded-lg"
                            value={formData.skills}
                            onChange={(e) => setFormData({...formData, skills: e.target.value})}
                            placeholder="e.g. React, Node.js"
                        />
                    ) : (
                        <div className="flex flex-wrap gap-2">
                        {profile.skills?.split(',').map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200">
                            {skill.trim()}
                            </span>
                        )) || <span className="text-gray-400 text-sm">No skills listed</span>}
                        </div>
                    )}
                </>
            )}
          </div>

          {/* Achievements / Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-red-100 text-red-500 rounded-full">
                        <Award size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Top {isMentor ? "Mentor" : "Student"} 2024</h4>
                        <p className="text-xs text-gray-500">Highest rated</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-red-100 text-red-500 rounded-full">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">
                            {isMentor ? `${profile.totalStudents}+ Students` : `${profile.enrolledCourses?.length || 0} Courses`}
                        </h4>
                        <p className="text-xs text-gray-500">{isMentor ? "Lives impacted" : "Enrolled"}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Courses List */}
            {/* Courses List */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
                {isMentor ? `Courses by ${profile.name}` : "Enrolled Courses"}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                {(isMentor ? profile.courses : profile.enrolledCourses)?.map((course) => (
                    <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-200 relative">
                             <img 
                               src={course.image || "https://placehold.co/400"} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.src = "https://placehold.co/400?text=No+Image";
                               }}
                             />
                             <span className="absolute top-2 right-2 bg-red-400 text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                                {course.level || "Course"}
                             </span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                            <div className="flex items-center gap-2 mt-2 mb-4">
                                <img src={profile.image || "https://placehold.co/30"} className="w-5 h-5 rounded-full" />
                                <span className="text-xs text-gray-500">{profile.name}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                {isMentor && (
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Award size={14} /> {course.rating || "0.0"}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Clock size={14} /> {course.durationWeeks || 8} weeks
                                </div>
                            </div>

                            <Link href={`/courses/${course.id}`} className="block w-full py-2 bg-red-400 hover:bg-red-500 text-white text-sm rounded-lg font-medium transition-colors text-center">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}

                {(!isMentor && (!profile.enrolledCourses || profile.enrolledCourses.length === 0)) && (
                    <p className="text-gray-500 text-sm col-span-2 text-center py-4">No enrolled courses yet.</p>
                )}
                 {(isMentor && (!profile.courses || profile.courses.length === 0)) && (
                    <p className="text-gray-500 text-sm col-span-2 text-center py-4">No courses created yet.</p>
                )}
            </div>
          </div>

          {/* DANGER ZONE */}
          {editing && (
             <div className="bg-red-50 rounded-2xl shadow-sm p-8 border border-red-100 mt-6">
                <h2 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-700 mb-4">
                    Deleting your account is permanent. All your data including courses and enrollments will be wiped out immediately.
                </p>
                <button 
                    onClick={() => setDeleteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Delete My Account
                </button>
             </div>
          )}

        </div>
      </div>
      
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </div>
  );
}