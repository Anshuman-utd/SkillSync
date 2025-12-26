"use client";

import { useState } from "react";
import { FileText, Download, Trash2, ExternalLink, Plus } from "lucide-react";

export default function ResourceList({ resources, isMentor, onDelete, onUpload }) {
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        onDelete(id);
      } else {
        alert("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      (resource.course?.title || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search resources by name or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-4 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? "No matching resources found" : "No resources found"}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search terms"
              : isMentor
              ? "Upload your first resource to share with students."
              : "Your mentors haven't uploaded any resources yet."}
          </p>
          {isMentor && !searchQuery && onUpload && (
            <button
              onClick={onUpload}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div 
              key={resource.id} 
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                {isMentor && (
                  <button
                    onClick={() => handleDelete(resource.id)}
                    disabled={deletingId === resource.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 truncate" title={resource.title}>
                {resource.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 truncate">
                {resource.course?.title || "Unknown Course"}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                 <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
                <a
                  href={resource.fileUrl}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
