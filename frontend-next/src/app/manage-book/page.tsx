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

interface Book {
  book_id: string;
  book_title: string;
  authors: string[] | string;
  cover_image?: string;
  genres?: string[];
  reading_level?: string;
  publication_year?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Extract unique genres and reading levels from books for filters
  const uniqueGenres = [...new Set(books.flatMap(book => book.genres || []))];
  const uniqueReadingLevels = [...new Set(books.map(book => book.reading_level).filter(Boolean))];
  const uniqueYears = [...new Set(books.map(book => book.publication_year).filter(Boolean))];

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const booksData = await getAllBooks();
        setBooks(booksData || []);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const handleEditBook = (bookId: string) => {
    router.push(`/bookdetail-librarian?bookId=${bookId}`);
    console.log(`Editing book with id: ${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      setDeleting(true);
      const success = await deleteBook(bookId);
      if (success) {
        // Remove the book from the local state
        setBooks(books.filter(book => book.book_id !== bookId));
        setDeleteDialogOpen(false);
        setBookToDelete(null);
      } else {
        setError("Failed to delete book. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      setError("An error occurred while deleting the book.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    // Handle authors that might be an array or string
    const authorText = Array.isArray(book.authors) 
      ? book.authors.join(", ").toLowerCase() 
      : (typeof book.authors === 'string' ? book.authors.toLowerCase() : "");
      
    const matchesSearch =
      book.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorText.includes(searchQuery.toLowerCase());

    const matchesGenre = genre && book.genres
      ? book.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      : true;
      
    const matchesLevel = readingLevel
      ? book.reading_level === readingLevel
      : true;
      
    const matchesYear = publicationYear && book.publication_year
      ? book.publication_year.toString() === publicationYear
      : true;

    return matchesSearch && matchesGenre && matchesLevel && matchesYear;
  });

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

        {/* Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-3 text-center py-10">
              <LoaderIcon className="animate-spin h-10 w-10 mx-auto mb-4 text-primary" />
              <p>Loading books...</p>
            </div>
          ) : error ? (
            <div className="col-span-3 text-center py-10 text-red-500">
              <p>{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-3 text-center py-10">
              <p>No books found matching your criteria.</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <Card key={book.book_id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex p-4 gap-4">
                    {book.cover_image ? (
                      <Image
                        src={book.cover_image}
                        alt={book.book_title}
                        width={96} // Tailwind w-24 = 96px
                        height={128} // Tailwind h-32 = 128px
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <BookIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                          {book.book_title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {Array.isArray(book.authors) ? book.authors.join(", ") : book.authors}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.genres?.map((genre, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {book.reading_level && <p>Level: {book.reading_level}</p>}
                        {book.publication_year && <p>Published: {book.publication_year}</p>}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditBook(book.book_id)}
                          className="text-indigo-600 hover:text-indigo-800 h-8 w-8 p-0"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setBookToDelete(book);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/videosGenerated?bookId=${book.book_id}`)}
                          className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
                        >
                          <VideoIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination (placeholder) */}
        <div className="flex justify-center items-center gap-4">
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            ←
          </button>
          <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">
            1
          </button>
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
