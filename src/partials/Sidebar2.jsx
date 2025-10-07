import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.body.classList.add("sidebar-expanded");
    } else {
      document.body.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static h-[100dvh] overflow-y-scroll no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64 shrink-0 bg-white dark:bg-gray-800 pt-0 pb-4 px-0 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Full-width Yellow Header with DHL Logo */}
        <div className="w-full bg-yellow-400 h-16 flex items-center justify-center">
          <NavLink end to="/" className="w-full h-full flex items-center justify-center">
            <img
              src="https://cdn.cookielaw.org/logos/9375bad7-f65e-4f8a-bc16-8254723bd66a/10736aa6-11a1-40d7-b1de-de46f2e1acf2/DHL_logo_rgb.png"
              alt="DHL Logo"
              className="h-10 object-contain"
            />
          </NavLink>
        </div>

        {/* Close button (Mobile only) */}
        <button
          ref={trigger}
          className="lg:hidden text-gray-600 absolute top-4 right-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
        >
          <span className="sr-only">Close sidebar</span>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
          </svg>
        </button>

        {/* Navigation groups go here */}
        <div className="px-4">
          {/* Example group */}
          <SidebarLinkGroup activecondition={pathname === "/"}>
            {(handleClick, open) => (
              <a
                href="#0"
                className="block text-gray-800 dark:text-gray-100 py-2 hover:text-gray-900 dark:hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                  setSidebarExpanded(true);
                }}
              >
                <span className="text-sm font-medium">Dashboard</span>
              </a>
            )}
          </SidebarLinkGroup>
        </div>

        {/* Expand/collapse control */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto pr-4">
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            <span className="sr-only">Expand / collapse sidebar</span>
            <svg
              className="shrink-0 fill-current sidebar-expanded:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
