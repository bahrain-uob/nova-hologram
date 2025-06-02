/* EditBookPage.tsx */
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import withRoleProtection from "@/components/auth/withRoleProtection";
import Image from "next/image";
import {
  PlusCircleIcon,
  SparklesIcon,
  TrashIcon,
  PlayCircleIcon,
  RotateCwIcon,
  PencilIcon,
  Upload,
  FileText,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/addbook/card";
import { Input } from "@/components/addbook/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/addbook/select";




function FieldWithLabel({
  label,
  value,
  onChange,
  editMode,
}: {
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editMode: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {editMode ? (
        <Input value={value} onChange={onChange} />
      ) : (
        <p className="text-sm text-gray-900">{value || "-"}</p>
      )}
    </div>
  );
}

function SelectWithLabel({ label, value, onChange, editMode, options }: { label: string; value: string; onChange: (v: string) => void; editMode: boolean; options: string[] }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {editMode ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger>
          <SelectContent>
            {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm text-gray-900">{value || "-"}</p>
      )}
    </div>
  );
}

function TextAreaWithLabel({
  label,
  value,
  onChange,
  editMode,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  editMode: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {editMode ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={5}
          className="w-full border border-gray-300 rounded p-2 text-sm"
        />
      ) : (
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{value || "-"}</p> // ← removed bg, border, and padding
      )}
    </div>
  );
}



const EditBookPage: React.FC = () => {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const router = useRouter();

  
  const [editMode, setEditMode] = React.useState(false);
  //const [bookData, setBookData] = React.useState<BookData | null>(null);
  const [title, setTitle] = React.useState("");
  const [authors, setAuthors] = React.useState("");
  const [publisher, setPublisher] = React.useState("");
  const [publishedDate, setPublishedDate] = React.useState("");
  const [maturity, setMaturity] = React.useState("");
  const [type, setType] = React.useState<string | undefined>(undefined);
const [genre, setGenre] = React.useState<string | undefined>(undefined);
const [collection, setCollection] = React.useState<string | undefined>(undefined);

  const [isbn, setIsbn] = React.useState("");
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  //const [uploadedBookFile, setUploadedBookFile] = React.useState<File | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  //const bookFileInputRef = React.useRef<HTMLInputElement>(null);
  const [objectives, setObjectives] = React.useState([{ id: 1, text: "" }]);
  const [summary, setSummary] = React.useState("");
  //const [chapter1Summary, setChapter1Summary] = React.useState("");
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState<any>(null); // You can refine the type later
  const [chapters, setChapters] = useState([]);


  useEffect(() => {
    if (!bookId) return;
  
    const fetchData = async () => {
      try {
        if (!bookId) return;
        const data = await import('@/services/libraryService').then(mod => mod.getBookById(bookId));
        if (!data) throw new Error('Book not found');
        setBookData(data);
        setChapters(data.chapters || []);

        const book = data; // Support both wrapped and direct
        console.log("Fetched book:", book);

        setTitle(book.title || "");
        setAuthors((book.authors || []).join(", "));
        setPublisher(
          typeof book.publisher === "string"
            ? book.publisher
            : book.publisher?.name || ""
        );
        setPublishedDate(book.publication_year ? book.publication_year.toString() : "");
        setMaturity(book.reading_level || "");
        setSummary(book.summary || "");
        setType(typeof book.type === "string" ? book.type : undefined);
        setGenre(
          Array.isArray(book.genre)
            ? book.genre[0] // or `.join(", ")` if you want to show multiple
            : typeof book.genre === "string"
            ? book.genre
            : undefined
        );
        setCollection(Array.isArray(book.collection_id) ? book.collection_id[0] : undefined);

        setIsbn(book.isbn || "");

        // Handle objectives
        if (Array.isArray(book.objectives)) {
          if (book.objectives.length > 0) {
            if (typeof book.objectives[0] === "string") {
              // If objectives is string[], convert to proper format
              const formattedObjectives = book.objectives.map((text, index) => ({
                id: index + 1,
                text: String(text)
              }));
              setObjectives(formattedObjectives);
            } else {
              // If objectives is already { id: number; text: string }[]
              const formattedObjectives = book.objectives
                .filter(obj => obj && typeof obj === 'object' && 'id' in obj && 'text' in obj)
                .map(obj => ({
                  id: Number(obj.id) || 0,
                  text: String(obj.text)
                }));
              setObjectives(formattedObjectives.length > 0 ? formattedObjectives : [{ id: 1, text: "" }]);
            }
          } else {
            // Empty array case
            setObjectives([{ id: 1, text: "" }]);
          }
        } else {
          // No objectives case
          setObjectives([{ id: 1, text: "" }]);
        }

      } catch (err) {
        console.error("Error fetching book data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    
  }, [bookId]);
  
  
  

  const handleSaveChanges = async () => {
    try {
      const updatedFields: any = {
        title,
        authors: authors.split(",").map((a) => a.trim()),
        publisher,
        publication_year: publishedDate,
        reading_level: maturity,
        type,
        genre,
        isbn,
        summary,
        objectives,
      };
      
      // 🛠️ Only include collection_id if it's not empty, and convert to number
      if (collection) {
        updatedFields.collection_id = Number(collection);
      }
      
  
      const payload = {
        book_id: bookId,
        updatedFields,
        chapters: chapters.map(({ chapter_id, summary }) => ({ chapter_id, summary })),
      };
      
  
      const res = await fetch("https://ozdejdjb9e.execute-api.us-east-1.amazonaws.com/update-book", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      console.log("Update response:", data);
      alert("Changes saved!");
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update book:", err);
      alert("Failed to update. Check console for details.");
    }
  };
  
  

  const addObjective = () => {
    setObjectives([...objectives, { id: Date.now(), text: "" }]);
  };

  const removeObjective = (id: number) => {
    setObjectives(objectives.filter((obj) => obj.id !== id));
  };

  return (
    <MainLayout activePage="Manage Books">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            <span className="text-gray-400">Manage Books &gt; </span>
            <span className="text-gray-700 font-medium">Book Details</span>
          </p>
          <div className="flex gap-2">
            {editMode && (
              <>
                {/* Cancel Edit = Red/Gray */}
                <Button
                  variant="ghost"
                  className="border-gray-300 text-red-600 hover:bg-red-50"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>

                {/* Save = Indigo like Edit */}
                <Button
                  variant="ghost"
                  className="text-indigo-600 hover:bg-gray-100"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </>
            )}
            {!editMode && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    const confirmed = confirm("Are you sure you want to delete this book?");
                    if (!confirmed || !bookId) return;
                  
                    try {
                      const res = await fetch("https://0wx717uz2c.execute-api.us-east-1.amazonaws.com/delete-book", {
                        method: "POST", // REST APIs typically use POST for deletions via Lambda
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ bookId }),
                      });
                  
                      if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData?.error || "Unknown error");
                      }
                  
                      alert("Book deleted successfully!");
                      router.push("/manage-book");
                    } catch (err) {
                      console.error("Delete failed:", err);
                      alert("Failed to delete book. Please try again.");
                    }
                  }}
                  
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  className="text-indigo-600 hover:bg-gray-100"
                  onClick={() => setEditMode(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>

              </div>
            )}

          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1">
            <Card className="bg-white shadow p-4 h-full">
              <CardContent className="pt-6 flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2 self-start">Book Cover</h3>
              <br></br>
              {uploadedImage ? (
                <Image
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Uploaded Cover"
                  width={180}
                  height={240}
                  className="object-cover rounded mb-4"
                />
              ) : bookData?.book?.cover ? (
                <Image
                  src={bookData.book.cover}
                  alt="Book Cover"
                  width={180}
                  height={240}
                  className="object-cover rounded mb-4"
                />
              ) : (
                <div className="w-40 h-56 bg-gray-100 flex items-center justify-center rounded mb-4">
                  <Upload className="h-10 w-10 text-gray-400" />
                </div>
              )}




                <Button
                  variant="outline"
                  className="w-full mb-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                  onClick={() => imageInputRef.current?.click()}
                  hidden={!editMode}
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload New Cover
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={imageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedImage(file);
                  }}
                />

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  hidden={!editMode}
                >
                  <SparklesIcon className="h-4 w-4 mr-2" /> Generate New Cover
                </Button>
                
                {/* Book File 
                <hr className="w-full border-t border-gray-200 my-6" />
                <h3 className="text-sm font-medium text-gray-600 mb-2 self-start">Book File</h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span>{uploadedBookFile ? uploadedBookFile.name : "book-final-version.pdf"}</span>
                  </div>
                  <span className="text-xs text-gray-500">12.5 MB</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 text-gray-700 border-gray-300 hover:bg-gray-100"
                  onClick={() => bookFileInputRef.current?.click()}
                  hidden={!editMode}
                >
                  <Upload className="w-4 h-4 mr-2" /> Change File
                </Button>
                <input
                  type="file"
                  accept=".pdf,.epub"
                  hidden
                  ref={bookFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedBookFile(file);
                  }}
                />*/}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2">
            <Card className="bg-white shadow p-6">
              <CardContent>
                <br></br>
                {/* Title r */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldWithLabel label="Title" value={title} onChange={(e) => setTitle(e.target.value)} editMode={editMode} />
                  </div>
                </div>
                {/* Type & Genre */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <SelectWithLabel label="Type" value={type} onChange={setType} editMode={editMode} options={["fiction", "non-fiction", "textbook"]} />
                  </div>
                  <div>
                    <SelectWithLabel label="Genre" value={genre} onChange={setGenre} editMode={editMode} options={["mystery", "science", "history"]} />
                  </div>
                </div>

                {/* Collection & ISBN */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <SelectWithLabel label="Collection (Optional)" value={collection} onChange={setCollection} editMode={editMode} options={["summer-reading", "classics", "bestsellers"]} />
                  </div>
                  <div>
                    <FieldWithLabel label="ISBN / DOI" value={isbn} onChange={(e) => setIsbn(e.target.value)} editMode={editMode} />
                  </div>
                </div>

                {/*  Author & Publisher*/}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldWithLabel label="Author" value={authors} onChange={(e) => setAuthors(e.target.value)} editMode={editMode} />
                  </div>
                  <div>
                    <FieldWithLabel label="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} editMode={editMode} />
                  </div>
                </div>

                {/* Year & Maturity Rating*/}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldWithLabel label="Publication Year" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} editMode={editMode} />
                  </div>
                  <div className="mb-4">
                    <FieldWithLabel label="Maturity Rating" value={maturity} onChange={(e) => setMaturity(e.target.value)} editMode={editMode} />
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                  {editMode ? (
                    <>
                      <div className="space-y-2">
                        {objectives.map((objective) => (
                          <div key={objective.id} className="flex items-center gap-2">
                            <Input
                              value={objective.text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setObjectives((prev) =>
                                  prev.map((obj) =>
                                    obj.id === objective.id ? { ...obj, text: newText } : obj
                                  )
                                );
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeObjective(objective.id)}
                              className="h-8 w-8 text-gray-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className="mt-2 text-indigo-600 flex items-center gap-1"
                        onClick={addObjective}
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                        <span>Add Learning Objective</span>
                      </Button>
                    </>
                  ) : (
                    <div className="pl-3 border-l-2 border-gray-200 space-y-1">
                      {objectives.length > 0 ? (
                        objectives.map((obj) => (
                          <p key={obj.id} className="text-sm text-gray-900">- {obj.text}</p>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">-</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-none border border-gray-200 rounded-xl bg-white mt-6">
              <CardContent className="p-0 space-y-6">
                {/* Book Summary */}
                <div className="flex justify-between items-center p-5 pb-0">
                  <h2 className="text-lg font-medium">Book Summary</h2>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Input className="w-64 text-sm border border-gray-200" placeholder="Prompt..." />
                      <Button className="bg-indigo-600 text-white">
                        <RotateCwIcon className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  )}
                </div>

                <div className="px-5">
                  {editMode ? (
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={5}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  ) : (
                    <div className="border border-gray-200 rounded-md min-h-24 p-4 bg-white text-sm whitespace-pre-wrap">
                      {loading
                        ? "Generating summary..."
                        : bookData?.book?.summary || "No summary available."}
                    </div>
                  )}
                </div>


                {/* Book-level Trailer */}
                {bookData?.book?.trailer && bookData.book.trailer_status === "completed" && (
                  <div className="space-y-2 px-5 pt-4">
                    <h3 className="text-base font-medium">Book Trailer</h3>
                    <div className="flex items-center justify-center">
                      <video controls className="rounded-md w-full max-w-4xl aspect-video">
                        <source src={bookData.book.trailer} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                )}
                   <div className="pb-2" />

                </CardContent>
            </Card>

            {/* Book Summary, Trailer, and Chapter-wise Section */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white mt-6">
          <CardContent className="p-0 space-y-6">
          <div className="px-5 pt-5">
                <h2 className="text-lg font-semibold">Chapter-wise</h2>
              </div>
          {loading ? (
            <p className="text-sm px-5 py-5">Loading chapters...</p>
          ) : bookData?.chapters?.length ? (
            bookData.chapters.map((chapter, index) => (
              <div key={chapter.chapter_id} className="space-y-6 px-5 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium">Ch{index + 1} Summary</h3>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Input className="w-64 text-sm border border-gray-200" placeholder="Prompt..." />
                      <Button className="bg-indigo-600 text-white"><RotateCwIcon className="h-4 w-4 mr-2" /> Regenerate</Button>
                    </div>
                  )}
                </div>
                
                {editMode ? (
                  <TextAreaWithLabel
  label=""
  value={chapters[index]?.summary || ""}
  onChange={(e) => {
    const newSummary = e.target.value;
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === index ? { ...ch, summary: newSummary } : ch
      )
    );
  }}
  editMode={true}
/>

                ) : (
                  <div className="border border-gray-200 rounded-md min-h-24 p-4 bg-white text-sm whitespace-pre-wrap">
                    {chapter.summary || "No summary available."}
                  </div>
                )}


                <div className="flex justify-between items-center pt-2">
                  <h3 className="text-base font-medium">Ch{index + 1} Trailer</h3>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Input className="w-64 text-sm border border-gray-200" placeholder="Prompt..." />
                      <Button className="bg-indigo-600 text-white"><RotateCwIcon className="h-4 w-4 mr-2" /> Regenerate</Button>
                    </div>
                  )}
                </div>
                <div className=" flex items-center justify-center">
                  {chapter.trailer_status === "completed" && chapter.trailer ? (
                    <video controls className="rounded-md w-full max-w-4xl aspect-video">
                      <source src={chapter.trailer} type="video/mp4" />
                    </video>
                  ) : chapter.trailer_status === "failed" ? (
                    <p className="text-red-500">Trailer failed to generate.</p>
                  ) : (
                    <p className="text-gray-400">Generating trailer...</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm px-5 pb-5">No chapters available.</p>
          )}  <div className="pb-2" />

                </CardContent>
                </Card>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Protect this route - only librarians can access it
export default withRoleProtection(EditBookPage, ["librarian"]);
