"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { BiSearch } from "react-icons/bi";
import StyledRating from "../styled-rating";

interface Course {
  name: string;
  thumbnail?: string;
  ratings: number;
}

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Course[]>([]);
  const [selectedResult, setSelectedResult] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/get-key-search/${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data.courseSearch || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchHandler = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      router.push(`/search/${query}`);
      setShowResults(false);
    } else {
      toast.error("Please enter at least one character!");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  const handleResultSelection = (result: string) => {
    setSelectedResult(result);
    setQuery(result);
    setShowResults(false);
    router.push(`/search/${result}`);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form className="flex items-center h-[50px] mt-3" onSubmit={searchHandler}>
        <input
          type="search"
          placeholder={selectedResult || "Search Courses..."} 
          className="bg-white border dark:border-none dark:bg-[#575757] dark:placeholder:text-[#ffffffdd] rounded-l-[5px] px-2 h-full flex-1 outline-none font-josefin"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        <button 
          type="submit" 
          className="w-[50px] main-gradient rounded-r-[5px] text-dark_text grid place-items-center h-full"
        >
          <BiSearch size={30} />
        </button>
      </form>

      {showResults && query.length >= 2 && (
        <div className="absolute z-10 w-full">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-700 p-3 text-center text-gray-500 dark:text-gray-300 shadow-md">
              Loading...
            </div>
          ) : (
            <ul className="bg-white dark:bg-slate-700 shadow-md max-h-60 overflow-auto text-black dark:text-white">
              {results.length > 0 ? (
                results.map((course: Course, index: number) => (
                  <li 
                    key={index} 
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center" 
                    onClick={() => handleResultSelection(course.name)}
                  >
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.name} 
                        className="w-11 h-11 mr-2 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 mr-2 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs rounded">
                        No Image
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{course.name}</div>
                      <StyledRating
                        defaultValue={course.ratings || 0}
                        readOnly
                        size="small"
                        customClasses="mt-1" 
                      />
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-3 text-gray-500 dark:text-gray-300">No results found</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;