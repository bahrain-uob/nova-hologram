import * as React from "react"

export const Header = () => {
  return (
    <header className="w-full h-16 bg-white shadow-sm flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-7 bg-indigo-600 rounded-sm" />
        {/* Optional decorative shapes — you can remove if not needed */}
        <div className="flex gap-1 mt-1">
          <div className="w-3 h-3.5 bg-black" />
          <div className="w-0.5 h-3.5 bg-black" />
          <div className="w-2 h-2.5 bg-black" />
        </div>
      </div>

      {/* Search Input */}
      <div className="w-[560px]">
        <input
          type="text"
          placeholder="Type to search"
          className="w-full h-10 px-4 text-sm text-zinc-700 placeholder-zinc-400 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
    </header>
  )
}
