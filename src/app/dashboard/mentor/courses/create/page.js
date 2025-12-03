"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, X } from "lucide-react";

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outcomes, setOutcomes] = useState([""]);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER",
    duration: "",
    price: "",
    imageFile: null,
    imagePreview: null,
  });

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    }
    loadCategories();
  }, []);

  const handleOutcomeChange = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, ""]);
  };

  const removeOutcome = (index) => {
    const newOutcomes = outcomes.filter((_, i) => i !== index);
    setOutcomes(newOutcomes);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({
        ...form,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (form.imageFile) {
        const fd = new FormData();
        fd.append("file", form.imageFile);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        imageUrl = upData.url;
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.category,
          level: form.level,
          durationWeeks: Number(form.duration),
          price: Number(form.price),
          imageUrl,
          learningOutcomes: JSON.stringify(outcomes.filter((o) => o.trim() !== "")),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/mentor/courses");
      } else {
        alert("Failed to create course");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ---------------- BASIC INFO ---------------- */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Basic Information</h2>
          <p className="text-gray-500 text-sm mb-6">Provide the main details about your course</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
              <input
                type="text"
                placeholder="e.g., Complete Web Development Bootcamp"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                placeholder="Describe what students will learn in this course..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all h-32 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-white"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-white"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Weeks)</label>
                <input
                  type="number"
                  placeholder="e.g., 12"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  placeholder="0 for free"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- THUMBNAIL ---------------- */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Course Thumbnail</h2>
          <p className="text-gray-500 text-sm mb-6">Upload an attractive image for your course</p>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-red-300 transition-colors bg-gray-50">
            {form.imagePreview ? (
              <div className="relative w-full max-w-md mx-auto h-64 rounded-lg overflow-hidden group">
                <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageFile: null, imagePreview: null })}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400">
                  <Upload size={32} />
                </div>
                <p className="text-gray-600 font-medium mb-2">Drag and drop an image, or click to browse</p>
                <p className="text-gray-400 text-sm mb-6">Recommended: 1280x720px, PNG or JPG</p>
                <label className="px-6 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                  Choose File
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- LEARNING OUTCOMES ---------------- */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">What Students Will Learn</h2>
          <p className="text-gray-500 text-sm mb-6">List the key takeaways from your course</p>

          <div className="space-y-4">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  placeholder={`Learning point ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  value={outcome}
                  onChange={(e) => handleOutcomeChange(index, e.target.value)}
                />
                {outcomes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(index)}
                    className="px-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addOutcome}
              className="mt-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add Learning Point
            </button>
          </div>
        </div>

        {/* ---------------- ACTIONS ---------------- */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>

      </form>
    </div>
  );
}
