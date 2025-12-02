'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MentorDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level: 'BEGINNER', durationWeeks: 8, imageFile: null, categories: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', level: 'BEGINNER', durationWeeks: 8, categories: '' });

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  async function loadCourses() {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourses((data.courses || []).filter(c => c.mentor?.user?.email === user?.email));
  }

  useEffect(() => { if (user) loadCourses(); }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      let imageUrl = null;
      if (form.imageFile) {
        const fd = new FormData();
        fd.append('file', form.imageFile);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        imageUrl = upData.url;
      }
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl,
          level: form.level,
          durationWeeks: Number(form.durationWeeks),
          categories: form.categories.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Create failed');
      }
      setForm({ title: '', description: '', level: 'BEGINNER', durationWeeks: 8, imageFile: null, categories: '' });
      await loadCourses();
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course?')) return;
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    if (res.ok) loadCourses();
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please <Link href="/login" className="text-red-500">login</Link>.</div>;
  // Treat users with a mentor profile as mentors even if role is out-of-sync
  const isMentor = user.role === 'MENTOR' || !!user.mentor;
  if (!isMentor) return <div className="p-6">Access denied. This dashboard is for mentors.</div>;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-2xl font-semibold mb-4">Mentor Dashboard</h1>
      <p className="text-gray-700 mb-6">Welcome, {user.name}!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-3">Add a Course</h2>
          <form className="space-y-3" onSubmit={handleCreate}>
            <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full border rounded-md px-3 py-2" required />
            <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Description" className="w-full border rounded-md px-3 py-2" required />
            <div className="flex gap-3">
              <select value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})} className="border rounded-md px-3 py-2">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <input type="number" min={1} value={form.durationWeeks} onChange={(e)=>setForm({...form,durationWeeks:e.target.value})} className="border rounded-md px-3 py-2 w-32" placeholder="Weeks" />
            </div>
            <input type="file" accept="image/*" onChange={(e)=>setForm({...form,imageFile:e.target.files?.[0]||null})} />
            <input value={form.categories} onChange={(e)=>setForm({...form,categories:e.target.value})} placeholder="Categories (comma separated)" className="w-full border rounded-md px-3 py-2" />
            <button disabled={creating} className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500">{creating?'Creating...':'Create Course'}</button>
          </form>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-3">My Courses</h2>
          <div className="space-y-3">
            {courses.map((c)=> (
              <div key={c.id} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-600">{c.durationWeeks} weeks • {c.level.toLowerCase()}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/courses/${c.id}`} className="px-3 py-1 text-sm bg-gray-100 rounded-md">View</Link>
                  <button onClick={()=>{ setEditingId(c.id); setEditForm({ title: c.title, description: c.description, level: c.level, durationWeeks: c.durationWeeks, categories: c.categories?.map(cc=>cc.category.name).join(', ') || '' }); }} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md">Edit</button>
                  <button onClick={()=>handleDelete(c.id)} className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md">Delete</button>
                </div>
              </div>
            ))}
          </div>
          {editingId && (
            <div className="mt-4 border rounded-md p-4">
              <h3 className="font-medium mb-2">Edit Course</h3>
              <form className="space-y-3" onSubmit={async (e)=>{
                e.preventDefault();
                const res = await fetch(`/api/courses/${editingId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    level: editForm.level,
                    durationWeeks: Number(editForm.durationWeeks),
                    categories: editForm.categories.split(',').map(s=>s.trim()).filter(Boolean),
                  })
                });
                if (res.ok) {
                  setEditingId(null);
                  await loadCourses();
                }
              }}>
                <input value={editForm.title} onChange={(e)=>setEditForm({...editForm,title:e.target.value})} className="w-full border rounded-md px-3 py-2" />
                <textarea value={editForm.description} onChange={(e)=>setEditForm({...editForm,description:e.target.value})} className="w-full border rounded-md px-3 py-2" />
                <div className="flex gap-3">
                  <select value={editForm.level} onChange={(e)=>setEditForm({...editForm,level:e.target.value})} className="border rounded-md px-3 py-2">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                  <input type="number" min={1} value={editForm.durationWeeks} onChange={(e)=>setEditForm({...editForm,durationWeeks:e.target.value})} className="border rounded-md px-3 py-2 w-32" />
                </div>
                <input value={editForm.categories} onChange={(e)=>setEditForm({...editForm,categories:e.target.value})} className="w-full border rounded-md px-3 py-2" placeholder="Categories (comma separated)" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-md">Save</button>
                  <button type="button" onClick={()=>setEditingId(null)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
