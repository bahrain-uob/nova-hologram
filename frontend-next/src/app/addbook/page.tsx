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
type BookData = {
  title?: string;
  authors?: string[]; 
  publisher?: string;
  publishedDate?: string; 
  description?: string;
  maturityRating?: string; 
  imageLinks?: {
    thumbnail?: string;
  };
};
export default function AddBookPage() {
  const [objectives, setObjectives] = React.useState([
    { id: 1, text: "" },
  ]);

  
  const router = useRouter();




const [isFetched, setIsFetched] = React.useState(false);

const [bookData, setBookData] = React.useState<BookData | null>(null);

const [loading, setLoading] = React.useState(false);

const [isbnInput, setIsbnInput] = React.useState("");
const [title, setTitle] = React.useState("");
const [authors, setAuthors] = React.useState("");
const [publisher, setPublisher] = React.useState("");
const [publishedDate, setPublishedDate] = React.useState("");
const [maturity, setMaturity] = React.useState("");
const [type, setType] = React.useState("");
const [genre, setGenre] = React.useState("");
const [collection, setCollection] = React.useState("");
const imageInputRef = React.useRef<HTMLInputElement>(null);
const bookFileInputRef = React.useRef<HTMLInputElement>(null);

const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
const [uploadedBookFile, setUploadedBookFile] = React.useState<File | null>(null);



React.useEffect(() => {
  if (bookData) {
    setTitle(bookData.title || "");
    setAuthors((bookData.authors || []).join(", "));
    setPublisher(bookData.publisher || "");
    setPublishedDate(bookData.publishedDate || "");
    setMaturity(
      bookData.maturityRating === "MATURE"
        ? "Adults"
        : bookData.maturityRating === "NOT_MATURE"
        ? "Kids"
        : ""
    );
  }
}, [bookData]);

const fetchBookData = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      "https://778wwf05pa.execute-api.us-east-1.amazonaws.com/default/LambdaStack-GetBookInfoLambda83EE58F2-lcXSwzrnIGks",
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
        title: data.title,
        authors: data.authors || [],
        publisher: data.publisher || data.publishers?.[0] || "", 
        publishedDate: data.publish_date || "",
        description: data.description || "",
        maturityRating: data.maturity_rating || "", 
        imageLinks: {
          thumbnail: data.cover_image || "",
        },
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <Select value={type} onValueChange={(value) => setType(value || "")}>
                      <SelectTrigger className="border-gray-e4">
    <SelectValue placeholder="Select Type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="fiction">Fiction</SelectItem>
    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
    <SelectItem value="textbook">Textbook</SelectItem>
  </SelectContent>
</Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <Select value={genre} onValueChange={(value) => setGenre(value || "")}>
                        <SelectTrigger>
    <SelectValue placeholder="Select Genre" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="mystery">Mystery</SelectItem>
    <SelectItem value="science">Science</SelectItem>
    <SelectItem value="history">History</SelectItem>
  </SelectContent>
</Select>
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collection (Optional)</label>
                        <Select value={collection} onValueChange={setCollection}>
  <SelectTrigger>
    <SelectValue placeholder="Select Collection" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="summer-reading">Summer Reading</SelectItem>
    <SelectItem value="classics">Classics</SelectItem>
    <SelectItem value="bestsellers">Bestsellers</SelectItem>
  </SelectContent>
</Select>
                      </div>

                      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    ISBN/DOI
  </label>

  <div className="flex items-center gap-2">
    <Input
      placeholder="ISBN/DOI number"
      value={isbnInput}
      onChange={(e) => setIsbnInput(e.target.value)}
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
  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
  <Input
  placeholder="Enter book title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
</div>

<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
    <Input
  placeholder="Enter author name"
  value={authors}
  onChange={(e) => setAuthors(e.target.value)}
/>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
    <Input
  placeholder="Enter publisher name"
  value={publisher}
  onChange={(e) => setPublisher(e.target.value)}
/>
  </div>
</div>

<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
    <Input
  placeholder="Enter publication year"
  value={publishedDate}
  onChange={(e) => setPublishedDate(e.target.value)}
/>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Rating</label>
    <Input
  placeholder="Maturity Rating"
  value={maturity}
  onChange={(e) => setMaturity(e.target.value)}
/>
  </div>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
  <div className="space-y-2">
    {objectives.map((objective) => (
      <div key={objective.id} className="flex items-center gap-2">
        <Input
          defaultValue={objective.text}
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
  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt for the summary</label>
  <Textarea placeholder="Write Prompt" className="min-h-[100px]" />
</div>
</>)}
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
        if (file?.type.startsWith("image/")) setUploadedImage(file);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {(uploadedImage || bookData?.imageLinks?.thumbnail) ? (
        <div className="relative">
          <Image
            src={
              uploadedImage
                ? URL.createObjectURL(uploadedImage)
                : bookData?.imageLinks?.thumbnail || "/placeholder.png"
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
              if (bookData?.imageLinks?.thumbnail) {
                setBookData({
                  ...bookData,
                  imageLinks: { thumbnail: "" },
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

      <p className="text-sm text-gray-500 mb-4">Drop your image here or</p>
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
          if (file) setUploadedImage(file);
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
        if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".epub"))) {
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
          {uploadedBookFile ? uploadedBookFile.name : "Upload PDF or ePub file"}
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
          if (file) setUploadedBookFile(file);
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
              <Button variant="outline" className="border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700">Cancel</Button>
              <Button
  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
  onClick={
    isFetched
      ? () => router.push("/videosGenerated")
      : fetchBookData
  }
  disabled={loading}
>
  <SparklesIcon className="h-4 w-4" />
  {loading
    ? "Loading..."
    : isFetched
    ? "Generate Overview & Video"
    : "Fetch Book Data"}
</Button>


              </div>
              
            </div>
            </MainLayout>
  );
};
