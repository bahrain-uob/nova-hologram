"use client";
import {
  FileIcon,
  ImageIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import React from "react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/addbook/card";
import { Input } from "../../components/addbook/input";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/addbook/select";
import { Textarea } from "../../components/addbook/textarea";
import { Book } from "@/types/book";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function AddBookPage() {
  const [objectives, setObjectives] = React.useState([{ id: 1, text: "" }]);
  const allGenres = [
    "Mystery",
    "Science",
    "History",
    "Fantasy",
    "Adventure",
    "Romance",
    "Horror",
    "Drama",
    "Biography",
    "Self-Help",
    "Technology",
    "Education",
  ];

  const router = useRouter();

  const [isFetched, setIsFetched] = React.useState(false);

  const [bookData, setBookData] = React.useState<Book | null>(null);

  const [loading, setLoading] = React.useState(false);

  const [isbnInput, setIsbnInput] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [authors, setAuthors] = React.useState("");
  const [publisher, setPublisher] = React.useState("");
  const [publishedDate, setPublishedDate] = React.useState("");
  const [maturity, setMaturity] = React.useState("");
  const [type, setType] = React.useState("");
  const [genre, setGenre] = React.useState<string[]>([]);
  const [collection, setCollection] = React.useState("");
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const bookFileInputRef = React.useRef<HTMLInputElement>(null);
  const [language, setLanguage] = React.useState("");

  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  const [uploadedBookFile, setUploadedBookFile] = React.useState<File | null>(
    null
  );
  const [userId, setUserId] = React.useState("anonymous");
  const [isSaving, setIsSaving] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const [errors, setErrors] = React.useState({
    title: false,
    authors: false,
    publisher: false,
    publishedDate: false,
    maturity: false,
    type: false,
    genre: false,
    language: false,
    isbn: false,
    objectives: false,
    uploadedBookFile: false,
  });

  React.useEffect(() => {
    // Only run this on client side
    getCurrentUser()
      .then((user) => {
        const id = user.attributes?.sub || "anonymous";

        setUserId(id);
      })
      .catch((err) => {
        console.warn(" No user found. Defaulting to anonymous.", err);
      });
  }, []);

  React.useEffect(() => {
    if (bookData) {
      setTitle(bookData.title || "");
      setAuthors(
        Array.isArray(bookData.authors) ? bookData.authors.join(", ") : ""
      );

      // Cast publisher as any to access `.name` safely
      const publisherObj = bookData.publisher as { name?: string };
      setPublisher(publisherObj?.name || "");

      setPublishedDate(bookData.publication_year || "");
      setMaturity(bookData.reading_level || "");
    }
  }, [bookData]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://n3krykafj8.execute-api.us-east-1.amazonaws.com/dev/get-book-info",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: isbnInput.trim() }),
        }
      );

      const data = await response.json();

      if (data && data.title) {
        setBookData({
          book_id: "", // Optional: backend will create it
          user_id: "", // Optional: depends on auth
          title: data.title,
          authors: JSON.parse(JSON.stringify(data.authors || [])),
          publisher: JSON.parse(
            JSON.stringify({
              name: data.publisher || data.publishers?.[0] || "",
            })
          ),
          publication_year: data.publish_date || "",
          reading_level: data.maturity_rating === "MATURE" ? "Adults" : "Kids",
          type: "",
          genre: JSON.parse(JSON.stringify([])),
          collection_id: [],
          isbn: isbnInput,
          language: "English",
          cover: data.cover_image || "",
          summary: data.description || "",
          book_trailer: "",
          created_at: new Date(),
          updated_at: new Date(),
        });
        setIsFetched(true);
      } else {
        setBookData(null);
        setIsFetched(true);
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
      setBookData(null);
      setIsFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: !title.trim(),
      authors: !authors.trim(),
      publisher: !publisher.trim(),
      publishedDate: !publishedDate.trim(),
      maturity: !maturity.trim(),
      type: !type.trim(),
      genre: genre.length === 0,
      language: !language.trim(),
      isbn: !isbnInput.trim(),
      objectives: objectives.some((obj) => !obj.text.trim()),
      uploadedBookFile: !uploadedBookFile,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async () => {
    const bookId = self.crypto.randomUUID();
    setIsSaving(true);
    if (!validateForm()) {
      //alert(" Please fill in all required fields.");
      setIsSaving(false);
      return;
    }

    try {
      // 1. Get pre-signed URLs
      const presignResponse = await fetch(
        "https://pyglhv51a7.execute-api.us-east-1.amazonaws.com/get-upload-urls",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            bookFilename: uploadedBookFile.name,
            coverFilename: uploadedImage?.name || null,
          }),
        }
      );

      const {
        bookUrl: bookFileUrl,
        coverUrl: coverImageUrl,
        bookKey: bookFileKey,
        coverKey: coverImageKey,
      } = await presignResponse.json();

      // 2. Upload to S3 directly
      await fetch(bookFileUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadedBookFile.type },
        body: uploadedBookFile,
      });

      if (uploadedImage && coverImageUrl) {
        await fetch(coverImageUrl, {
          method: "PUT",
          headers: { "Content-Type": uploadedImage.type },
          body: uploadedImage,
        });
      }

      // 3. Send metadata to BookHandler
      const metadata = {
        book_id: bookId,
        user_id: userId,
        book_title: title,
        authors: authors.split(",").map((a) => a.trim()),
        publisher: { name: publisher },
        publication_year: publishedDate,
        reading_level: maturity,
        type,
        genre,
        collection: collection,
        objectives,
        prompt,
        language,
        isbn: isbnInput,
        book_cover: uploadedImage
          ? `s3://storagestack-readingmaterialse72d08c8-spmbixoyxput /${coverImageKey}`
          : bookData?.cover || "",

        book_file: `s3://${bookFileKey}`,
      };

      const saveResponse = await fetch(
        "https://jn6iwx83o8.execute-api.us-east-1.amazonaws.com/save-book",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        }
      );

      if (!saveResponse.ok) throw new Error("Metadata save failed.");
      const result = await saveResponse.json();
      console.log(" Upload complete:", result);
      router.push(`/videosGenerated?bookId=${bookId}`);
    } catch (err) {
      console.error(" Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsSaving(false);
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
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value || "");
                      if (errors.type && value) {
                        setErrors((prev) => ({ ...prev, type: false }));
                      }
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "border",
                        errors.type ? "border-red-500" : "border-gray-e4"
                      )}
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiction">Book</SelectItem>
                      <SelectItem value="non-fiction">Journal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">
                      Type is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full h-10 border border-gray-300 rounded-md px-3 justify-between text-sm text-gray-700"
                      >
                        {genre.length > 0
                          ? genre.join(", ")
                          : "Select Genre(s)"}
                        <svg
                          className="h-4 w-4 opacity-50 ml-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 rounded-md shadow-lg border border-gray-200 bg-white z-50">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {allGenres.map((g) => (
                          <label
                            key={g}
                            className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <Checkbox
                              checked={genre.includes(g)}
                              onCheckedChange={(checked) => {
                                const updated = checked
                                  ? [...genre, g]
                                  : genre.filter((item) => item !== g);
                                setGenre(updated);
                                if (errors.genre && updated.length > 0) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    genre: false,
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-800">{g}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.genre && (
                    <p className="text-sm text-red-600 mt-1">
                      At least one genre must be selected
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection (Optional)
                  </label>
                  <Select value={collection} onValueChange={setCollection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Summer Reading</SelectItem>
                      <SelectItem value="2">Classics</SelectItem>
                      <SelectItem value="3">Bestsellers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <Select
                    value={language}
                    onValueChange={(value) => {
                      setLanguage(value || "");
                      if (errors.language && value) {
                        setErrors((prev) => ({ ...prev, language: false }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.language && (
                    <p className="text-sm text-red-600 mt-1">
                      Language is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN/DOI
                  </label>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="ISBN/DOI number"
                      value={isbnInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setIsbnInput(value);
                        if (errors.isbn && value.trim()) {
                          setErrors((prev) => ({ ...prev, isbn: false }));
                        }
                      }}
                      className="flex-1"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600 flex items-center gap-1"
                      onClick={() => {
                        setIsbnInput("");
                        setIsFetched(false);
                        setBookData(null);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                      </svg>
                      Clear
                    </Button>
                  </div>
                  {errors.isbn && (
                    <p className="text-sm text-red-600 mt-1">
                      ISBN/DOI is required
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    or{" "}
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline"
                      onClick={() => {
                        setIsFetched(true);
                        setBookData(null);
                        setTitle("");
                        setAuthors("");
                        setPublisher("");
                        setPublishedDate("");
                        setMaturity("");
                        setUploadedImage(null);
                        setUploadedBookFile(null);
                      }}
                    >
                      Enter manually instead
                    </button>
                  </p>
                </div>
              </div>
              {isFetched && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTitle(value);
                        if (errors.title && value.trim()) {
                          setErrors((prev) => ({ ...prev, title: false }));
                        }
                      }}
                      placeholder="Enter book title"
                    />

                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        Title is required
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <Input
                        placeholder="Enter author name"
                        value={authors}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAuthors(value);
                          if (errors.authors && value.trim()) {
                            setErrors((prev) => ({ ...prev, authors: false }));
                          }
                        }}
                      />
                      {errors.authors && (
                        <p className="text-sm text-red-600 mt-1">
                          Author is required
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publisher
                      </label>
                      <Input
                        placeholder="Enter publisher name"
                        value={publisher}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPublisher(value);
                          if (errors.publisher && value.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              publisher: false,
                            }));
                          }
                        }}
                      />
                      {errors.publisher && (
                        <p className="text-sm text-red-600 mt-1">
                          Publisher is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publication Year
                      </label>
                      <Input
                        placeholder="Enter publication year"
                        value={publishedDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPublishedDate(value);
                          if (errors.publishedDate && value.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              publishedDate: false,
                            }));
                          }
                        }}
                      />
                      {errors.publishedDate && (
                        <p className="text-sm text-red-600 mt-1">
                          Publication year is required
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maturity Rating
                      </label>
                      <Input
                        placeholder="Maturity Rating"
                        value={maturity}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMaturity(value);
                          if (errors.maturity && value.trim()) {
                            setErrors((prev) => ({ ...prev, maturity: false }));
                          }
                        }}
                      />
                      {errors.maturity && (
                        <p className="text-sm text-red-600 mt-1">
                          Maturity rating is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Learning Objectives
                    </label>
                    <div className="space-y-2">
                      {objectives.map((objective) => (
                        <div
                          key={objective.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={objective.text}
                            onChange={(e) => {
                              const value = e.target.value;

                              setObjectives((prev) =>
                                prev.map((obj) =>
                                  obj.id === objective.id
                                    ? { ...obj, text: value }
                                    : obj
                                )
                              );

                              if (errors.objectives && value.trim()) {
                                const hasEmpty = objectives.some((obj) =>
                                  obj.id === objective.id
                                    ? !value.trim()
                                    : !obj.text.trim()
                                );
                                if (!hasEmpty) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    objectives: false,
                                  }));
                                }
                              }
                            }}
                            placeholder="Enter learning objective"
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
                      {errors.objectives && (
                        <p className="text-sm text-red-600 mt-1">
                          All objectives must be filled
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-2 text-indigo-600 flex items-center gap-1"
                      onClick={addObjective}
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      <span>Add Learning Objective</span>
                    </Button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prompt for the summary
                    </label>
                    <Textarea
                      placeholder="Write Prompt"
                      className="min-h-[100px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-span-1 space-y-6 mt-18">
            {isFetched && (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Cover Image</h3>
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center relative"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file?.type.startsWith("image/"))
                          setUploadedImage(file);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {uploadedImage || bookData?.cover ? (
                        <div className="relative">
                          <Image
                            src={
                              uploadedImage
                                ? URL.createObjectURL(uploadedImage)
                                : bookData?.cover || "/placeholder.png"
                            }
                            alt="Book Cover"
                            width={96}
                            height={128}
                            className="object-cover rounded mb-2"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImage(null);
                              if (bookData?.cover) {
                                setBookData({
                                  ...bookData,
                                  cover: "",
                                });
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50"
                            aria-label="Remove image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-red-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 6a1 1 0 011.414 0L10 8.586l2.586-2.586A1 1 0 1114 7.414L11.414 10l2.586 2.586a1 1 0 01-1.414 1.414L10 11.414l-2.586 2.586a1 1 0 01-1.414-1.414L8.586 10 6 7.414A1 1 0 016 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mb-4">
                        Drop your image here or
                      </p>
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              // 5MB
                              alert(
                                "Cover image is too large. Please upload an image smaller than 5MB."
                              );
                              return;
                            }
                            setUploadedImage(file);
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Book File</h3>
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center relative"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (
                          file &&
                          (file.name.endsWith(".pdf") ||
                            file.name.endsWith(".epub"))
                        ) {
                          setUploadedBookFile(file);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="relative w-full flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                          <FileIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {uploadedBookFile
                            ? uploadedBookFile.name
                            : "Upload PDF or ePub file"}
                        </p>
                        {uploadedBookFile && (
                          <button
                            type="button"
                            onClick={() => setUploadedBookFile(null)}
                            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                            aria-label="Remove uploaded file"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-red-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 6a1 1 0 011.414 0L10 8.586l2.586-2.586A1 1 0 1114 7.414L11.414 10l2.586 2.586a1 1 0 01-1.414 1.414L10 11.414l-2.586 2.586a1 1 0 01-1.414-1.414L8.586 10 6 7.414A1 1 0 016 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        {errors.uploadedBookFile && (
                          <p className="text-sm text-red-600 mt-1">
                            Book file is required
                          </p>
                        )}
                      </div>

                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                        onClick={() => bookFileInputRef.current?.click()}
                      >
                        Upload File
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.epub"
                        hidden
                        ref={bookFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert(
                                "Book file is too large. Please upload a file smaller than 10MB."
                              );
                              return;
                            }

                            setUploadedBookFile(file);
                            setErrors((prev) => ({
                              ...prev,
                              uploadedBookFile: false,
                            }));
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {!loading && !isSaving && (
            <Button
              variant="outline"
              className="border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700"
              onClick={() => router.push("/manage-book")}
            >
              Cancel
            </Button>
          )}

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            onClick={isFetched ? handleSubmit : fetchBookData}
            disabled={loading || isSaving}
          >
            <SparklesIcon className="h-4 w-4" />
            {loading || isSaving
              ? "Loading..."
              : isFetched
              ? "Generate Overview & Video"
              : "Fetch Book Data"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
