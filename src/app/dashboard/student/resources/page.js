import { Heart } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Resources</h1>
            <p className="text-gray-500">There are no resources right now.</p>
        </div>
      </div>
    </div>
  );
}
