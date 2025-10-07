import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';


import Datepicker from '../components/Datepicker';
import FilterButton from '../components/DropdownFilter';
import Banner from '../partials/Banner';
import DashboardCard12 from '../partials/dashboard/DashboardCard12';
import DashboardCard14 from '../partials/dashboard/DashboardCard14';
import DashboardCard15 from '../partials/dashboard/DashboardCard15';
import DashboardCard16 from '../partials/dashboard/DashboardCard16';
import User3DHeatmapCard from '../partials/dashboard/User3DHeatmapCard';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';




function Dashboard() {
  const [role, setRole] = useState(null);

useEffect(() => {
  const roleCookie = Cookies.get('role');
  setRole(roleCookie);
}, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Team activity</h1>
                    {role === 'admin' ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">Team Leader</div>
                    ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">User</div>
                    )}
                    </div>
              </div>
              
              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Datepicker built with React Day Picker */}
                <Datepicker align="right" />
                {/* Add view button */}
                <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">Add View</span>
                </button>                
              </div>

            </div>

            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">
              <User3DHeatmapCard/>


              {/* Line chart (Acme Plus) 
              <DashboardCard01 />*/}
              {role === 'admin' && (
              <>
              {/* Card (Customers) 
              <DashboardCard10 />*/}
              <DashboardCard14 />
              </>
                )}
              {/* Line chart (Acme Advanced) 
              <DashboardCard02 />*/}
              {/* Card (Recent Activity) */}
              <DashboardCard12 />
              {/* Line chart (Acme Professional) 
              <DashboardCard03 />*/}
              {/* Bar chart (Direct vs Indirect) 
              <DashboardCard04 />*/}
              {role === 'admin' && (
              <>
              <DashboardCard15 />
              <DashboardCard16 />
              </>
                )}
              {/* Line chart (Real Time Value) 
              <DashboardCard05 />*/}
              {/* Admin-only cards */}
              

              {/* Doughnut chart (Top Countries)
              <DashboardCard06 /> */}
              
              {/* Line chart (Sales Over Time)
              <DashboardCard08 />  */}
              {/* Stacked bar chart (Sales VS Refunds) 
              <DashboardCard09 />*/}
              
              {/* Card (Reasons for Refunds) 
              <DashboardCard11 />*/}
              {/* Table (Top Channels) 
              <DashboardCard07 />*/}
              {/* Card (Income/Expenses) 
              <DashboardCard13 />*/}
              
            </div>

          </div>
        </main>

        <Banner />

      </div>
    </div>
  );
}

export default Dashboard;