import Link from "next/link";

export default function Footer() {
    return (
      <footer className="bg-white  mt-0 sticky border-gray-200 border-t">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
  
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                S
              </div>
              <span className="text-xl font-semibold text-black">SkillSync</span>
            </div>
  
            <p className="text-gray-600 mt-3 leading-relaxed">
              Level up your skills with expert mentorship and curated learning resources.
            </p>
          </div>
  
          {/* Platform */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Platform</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/courses" className="hover:text-red-400 cursor-pointer">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-red-400 cursor-pointer">
                  Mentors
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-red-400 cursor-pointer">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
  
          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-red-400 cursor-pointer">About Us</li>
              <li className="hover:text-red-400 cursor-pointer">Contact</li>
              <li className="hover:text-red-400 cursor-pointer">Careers</li>
            </ul>
          </div>
  
          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-red-400 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-red-400 cursor-pointer">Terms of Service</li>
              <li className="hover:text-red-400 cursor-pointer">Cookie Policy</li>
            </ul>
          </div>
  
        </div>
  
        <div className="border-t mt-10 border-gray-200 ">
          <p className="text-center text-gray-500 text-sm py-6">
            © {new Date().getFullYear()} SkillSync. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  