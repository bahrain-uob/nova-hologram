"use client";

import React from "react";
import { Cog } from "./Cog";
import { Logout } from "./Logout";
import { Original } from "./Original";
import { Search } from "./Search";
import bookOpenReader1 from "./book-open-reader-1.svg";
import books2 from "./books-2.svg";
import ellipse6 from "./ellipse-6.png";
import frame from "./frame.svg";
import frame2 from "./frame-2.svg";
import frame3 from "./frame-3.svg";
import frame4 from "./frame-4.svg";
import frame5 from "./frame-5.svg";
import frame6 from "./frame-6.svg";
import frame7 from "./frame-7.svg";
import frame8 from "./frame-8.svg";
import frame9 from "./frame-9.svg";
import frame10 from "./frame-10.svg";
import frame11 from "./frame-11.svg";
import frame12 from "./frame-12.svg";
import frame13 from "./frame-13.svg";
import frame14 from "./frame-14.svg";
import frame15 from "./frame-15.svg";
import frame16 from "./frame-16.svg";
import frame17 from "./frame-17.svg";
import frame18 from "./frame-18.svg";
import frame19 from "./frame-19.svg";
import frame20 from "./frame-20.svg";
import frame21 from "./frame-21.svg";
import frame22 from "./frame-22.svg";
import frame23 from "./frame-23.svg";
import frame24 from "./frame-24.svg";
import image1 from "./image.svg";

import "./ManageReader.css";

 n
      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-zinc-200 p-4 space-y-3">
          <div className="space-y-2">
            <SidebarItem icon={frame22} label="Dashboard" />
            <SidebarItem icon={frame23} label="Manage Books" active />
            <SidebarItem icon={books2} label="Manage Collections" />
            <SidebarItem icon={bookOpenReader1} label="Manage Readers" />
          </div>
          <div className="mt-auto space-y-2 pt-10 border-t border-zinc-200">
            <SidebarItem icon={frame20} label="Settings" />
            <SidebarItem icon={frame21} label="Logout" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-8 overflow-auto">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Manage Readers</h2>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg gap-2">
              <img src={frame.src} alt="Add" className="w-4 h-4" />
              <span>Add New Reader</span>
            </button>
          </div>

          {/* Search Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
            <div className="flex gap-4 mb-4">
              <div className="relative w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Search books, authors, or categories"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-gray-700"
                />
                <img src={image1.src} alt="search" className="absolute left-3 top-2.5 w-4 h-4" />
              </div>
              <FilterDropdown icon={frame3} label="All Genres" />
              <FilterDropdown icon={frame4} label="Reading Level" />
              <FilterDropdown icon={frame5} label="Publication Year" />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <ReaderCard
              title="The Future of AI"
              author="Sarah Johnson"
              tags={["Science", "Technology"]}
              icons={[frame6, frame7]}
              image="/img.png"
            />
            <ReaderCard
              title="Mystic Realms"
              author="Michael Chang"
              tags={["Fantasy", "Fiction"]}
              icons={[frame8, frame9]}
              image="/image.png"
            />
            <ReaderCard
              title="Advanced Mathematics"
              author="Dr. Robert Lee"
              tags={["Education", "Mathematics"]}
              icons={[frame10, frame11]}
              image="/img-2.png"
            />
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            <PaginationArrow icon={frame12} />
            <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">1</button>
            <PaginationArrow icon={frame13} />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) => (
  <div className={`flex items-center px-3 py-2 rounded-lg cursor-pointer ${active ? "bg-indigo-100 text-indigo-600" : "hover:bg-zinc-100 text-gray-700"}`}>
    <img src={icon} alt="" className="w-4 h-4 mr-3" />
    <span className="text-sm">{label}</span>
  </div>
);

const FilterDropdown = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex items-center px-3 py-2 border border-zinc-200 rounded-lg bg-white text-gray-700 text-sm">
    <span className="mr-2">{label}</span>
    <img src={icon} alt="" className="w-4 h-4" />
  </div>
);

const ReaderCard = ({
  title,
  author,
  tags,
  icons,
  image,
}: {
  title: string;
  author: string;
  tags: string[];
  icons: string[];
  image: string;
}) => (
  <div className="bg-white rounded-xl shadow p-4 flex gap-4">
    <div className="w-24 h-36 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
    <div className="flex-1">
      <h3 className="text-gray-700 font-medium text-base mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 mb-2">By {author}</p>
      <div className="flex gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="bg-[#fafafb] text-zinc-700 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {icons.map((icon, i) => (
          <img key={i} src={icon} alt="icon" className="w-4 h-4" />
        ))}
      </div>
    </div>
  </div>
);

const PaginationArrow = ({ icon }: { icon: string }) => (
  <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
    <img src={icon} alt="arrow" className="w-2.5 h-4" />
  </button>
);

export default ManageReader;
