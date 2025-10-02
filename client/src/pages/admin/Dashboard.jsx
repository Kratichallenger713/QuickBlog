import React, { useEffect, useState } from "react";
import { assets, dashboard_data } from "../../assets/assets";
import BlogTableItem from "../../components/admin/BlogTableitem";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    blogs: 0,
    comments: 0,
    drafts: 0,
    recentBlogs: []
  });

  const {axios} = useAppContext()

  const fetchDashboard = async () => {
    try {
      const {data} = await axios.get('api/admin/dashboard')
      console.log('API response:', data);  // <--- Add this
      data.success ? setDashboardData(data.dashboardData):toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
    // setDashboardData(dashboard_data)
  };

  useEffect(() => {
    fetchDashboard();
  }, []);


  //naya add kiya 

  useEffect(() => {
  console.log("Fetched Dashboard Data:", dashboardData);
}, [dashboardData]);



  return (
    <div className=" flex-1 p-4 md:p-10 bg-blue-50/50 ">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all">
          <img src={assets.dashboard_icon_1} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.blogs}
            </p>
            <p className="text-gray-400 font-light">Blogs</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all">
          <img src={assets.dashboard_icon_2} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.comments}
            </p>
            <p className="text-gray-400 font-light">Comments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all">
          <img src={assets.dashboard_icon_3} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.drafts}
            </p>
            <p className="text-gray-400 font-light">Drafts</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 m-4 mt-6 text-gray-600">
          <img src={assets.dashboard_icon_4} alt="" />
          <p>Latest Blogs </p>
        </div>

        <div className="relative max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-white">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-xs text-gray-600 text-left uppercase">
              <tr>
                <th scope="col" className="px-2 py-4  xl-px-6">
                  #
                </th>
                <th scope="col" className="px-2 py-4 ">
                  Blog Title{" "}
                </th>
                <th scope="col" className="px-2 py-4  max-sm:hidden">
                  Date
                </th>
                <th scope="col" className="px-2 py-4  max-sm:hidden">
                  status
                </th>
                <th scope="col" className="px-2 py-4 ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>

            {/* //naya add kiya  */}
            {Array.isArray(dashboardData.recentBlogs) && dashboardData.recentBlogs.length > 0 ? (
    [...dashboardData.recentBlogs]
      .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    })
      .map((blog, index) => (
        <BlogTableItem
          key={blog._id}
          blog={blog}
          fetchBlogs={fetchDashboard}
          index={index + 1}
        />
      ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center py-4 text-gray-500">
        No recent blogs to show.
      </td>
    </tr>
  )}



              {/* {dashboardData.recentBlogs.map((blog, index) => {
                return <BlogTableItem  key={blog._id}  blog={blog} fetchBlogs={fetchDashboard} index={index+1}  />                
               })} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
