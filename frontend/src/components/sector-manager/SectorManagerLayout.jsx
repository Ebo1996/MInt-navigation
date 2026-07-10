import React from "react";
import { Outlet } from "react-router-dom";

const SectorManagerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default SectorManagerLayout;
