"use client";

import React, { useState, useEffect } from "react";
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Filter as FilterIcon,
  Video as VideoIcon,
  BookOpen as BookIcon,
  Loader2 as LoaderIcon
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { getAllBooks, deleteBook } from "@/services/libraryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Book, BooksResponse } from "@/types";


const fetchBooks = async (): Promise<BooksResponse> => {
  try {
    const response = await fetch("https://a31g9ushy4.execute-api.us-east-1.amazonaws.com/books");

    if (!response.ok) {
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    // ✅ Make sure it's an array
    if (!Array.isArray(data)) {
      return { error: "Invalid data format" };
    }

    return { books: data };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { error: "Failed to fetch books" };
  }
};



const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Extract unique genres and reading levels from books for filters
  const uniqueGenres = [...new Set(books.flatMap(book => book.genre || []))];
  const uniqueReadingLevels = [...new Set(books.map(book => book.reading_level).filter(Boolean))];
  const uniqueYears = [...new Set(books.map(book => book.publication_year).filter(Boolean))];

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await fetchBooks();
            console.log("📚 Books from API:", response.books);

        if (response.error) {
          setError(response.error);
          setBooks([]);
        } else {
          setBooks(response.books || []);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load books from database");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleEditBook = (bookId: string) => {
    // Navigate to the edit book page with the book ID
    router.push(`/bookdetail-librarian?bookId=${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this book?");
    if (!confirmed || !bookId) return;
  
    try {
      setLoading(true);
  
      const res = await fetch("https://0wx717uz2c.execute-api.us-east-1.amazonaws.com/delete-book", {
        method: "POST", // REST API expects POST for deletion
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Unknown error");
      }
  
      // Remove the deleted book from UI
      setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
  
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete book. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        // Safe search matching with null checks
        const matchesSearch = !searchQuery ? true : (
          // Check if book_title exists before calling toLowerCase()
          ((book.book_title || "").toLowerCase().includes(searchQuery.toLowerCase())) ||
          // Check if authors array exists and has elements
          (Array.isArray(book.authors) && book.authors.some(author => 
            (author || "").toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );

        // Safe genre matching with null checks
        const matchesGenre = !genre ? true : (
          Array.isArray(book.genre) && book.genre.some(g => 
            (g || "").toLowerCase().includes(genre.toLowerCase())
          )
        );
        
        // Safe level matching with null check
        const matchesLevel = !readingLevel ? true : 
          book.reading_level === readingLevel;
        
        // Safe year matching with null check
        const matchesYear = !publicationYear ? true : 
          book.publication_year === publicationYear;

        return matchesSearch && matchesGenre && matchesLevel && matchesYear;
      })
    : [];

  return (
    <MainLayout activePage="Manage Books">
      <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Manage Books</h2>
          <button
            onClick={() => {
              router.push("/addbook");
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg gap-2 hover:bg-indigo-700 transition-colors duration-200"
          >
            <span>Add New Book</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="relative flex-1 mb-4">
            <input
              type="text"
              placeholder="Search books, authors, or categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute top-2 right-4">
              <FilterIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Romance">Romance</option>
              <option value="Self Help">Self Help</option>
              <option value="Science Fiction">Science Fiction</option>
            </select>

            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Reading Level</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Publication Year</option>
              <option value="2018">2018</option>
              <option value="1960">1960</option>
              <option value="1949">1949</option>
              <option value="1925">1925</option>
            </select>
          </div>
        </div>

        {/* Loading and error messages */}
        {loading && <p className="text-center text-gray-600">Loading books...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && filteredBooks.length === 0 && (
          <p className="text-center text-gray-600">No books found.</p>
        )}

        {/* Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {filteredBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-6"
            >
              <Image
                src={book.book_cover || "/placeholder-book.jpg"}
                alt={book.book_title}
                width={96}
                height={128}
                className="object-cover rounded-lg"
              />

              <div className="flex flex-col justify-between ml-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{book.book_title}</h3>
                  <p className="text-sm text-gray-500">
  {Array.isArray(book.authors)
    ? book.authors.join(', ')
    : book.authors || 'Unknown Author'}
</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.genre && book.genre.map((g, index) => (
                      <p key={index} className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
                        {g}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Level: {book.reading_level}</p>
                  <p>Published: {book.publication_year}</p>
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEditBook(book.book_id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.book_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination (placeholder) */}
        <div className="flex justify-center items-center gap-4">
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            ←
          </button>
          <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">1</button>
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            →
          </button>
        </div>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Book</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete &quot;{bookToDelete?.book_title}&quot;?</p>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => bookToDelete && handleDeleteBook(bookToDelete.book_id)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </MainLayout>
  );
};

export default ManageBooks;
