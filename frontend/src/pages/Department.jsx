import React, { useState } from "react";
import { departments } from "../data/departments";
import DepartmentCard from "../components/departments/DepartmentCard";
import { FaSearch } from "react-icons/fa";

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("all");

  // Filter departments based on search and floor
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.name.am.includes(searchTerm) ||
      dept.description.en.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFloor =
      selectedFloor === "all" || dept.floor.toString() === selectedFloor;

    return matchesSearch && matchesFloor;
  });

  // Get unique floors for filter
  const floors = ["all", ...new Set(departments.map((dept) => dept.floor))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          All Departments
        </h1>
        <p className="text-gray-600">
          Browse all departments and offices in the Ministry of Innovation and
          Technology
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Floor Filter */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Floors</option>
            {floors
              .filter((f) => f !== "all")
              .map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredDepartments.length} of {departments.length}{" "}
          departments
        </p>
      </div>

      {/* Department Grid */}
      {filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-xl text-gray-500 mb-2">No departments found</p>
          <p className="text-gray-400">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Quick Floor Guide */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Floor Guide</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              1
            </div>
            <p className="text-sm">Ground Floor</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              2
            </div>
            <p className="text-sm">Administration</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              3
            </div>
            <p className="text-sm">Technical</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              4
            </div>
            <p className="text-sm">Projects</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              5
            </div>
            <p className="text-sm">Leadership</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
