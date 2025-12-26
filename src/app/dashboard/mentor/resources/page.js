"use client";

import { useState, useEffect, useCallback } from "react";
import ResourceList from "@/components/Resources/ResourceList";
import ResourceUploadModal from "@/components/Resources/ResourceUploadModal";
import { Plus, Loader2 } from "lucide-react";

export default function MentorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleDelete = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Resources</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload Resource
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <ResourceList 
          resources={resources} 
          isMentor={true} 
          onDelete={handleDelete}
          onUpload={() => setIsModalOpen(true)}
        />
      )}

      <ResourceUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={fetchResources}
      />
    </div>
  );
}
