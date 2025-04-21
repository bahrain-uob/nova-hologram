"use client";
import {
  FileIcon,
  ImageIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrashIcon,
  SearchIcon,
} from "lucide-react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/addbook/breadcrumb";
import { Button } from "../../components/addbook/button";
import { Card, CardContent } from "../../components/addbook/card";
import { Input } from "../../components/addbook/input";
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
  authors?: string[]; // ⬅️ استخدمي authors[0] مثلًا
  publisher?: string;
  publishedDate?: string; // ⬅️ سنة أو تاريخ النشر
  description?: string;
  maturityRating?: string; // ⬅️ ممكن تعتبرينه "Reading Level"
  imageLinks?: {
    thumbnail?: string;
  };
};
export default function AddBookPage() {
  const [objectives, setObjectives] = React.useState([
    { id: 1, text: "learning objective" },
  ]);

  
  

// 🔽 [أضف الكود الجديد هنا]

// لحالة الزر: هل المستخدم ضغط على fetch ولا لا؟
const [isFetched, setIsFetched] = React.useState(false);

// لحفظ حالة الكتاب: البيانات اللي جابها الـ API
const [bookData, setBookData] = React.useState<BookData | null>(null);

// لحالة تحميل/انتظار
const [loading, setLoading] = React.useState(false);

// لحقل ISBN/DOI
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
        body: JSON.stringify({ input: isbnInput.trim() }), // ✅ updated key here
      }
    );

    const data = await response.json();

    if (data && data.title) {
      setBookData({
        title: data.title,
        authors: data.authors || [],
        publisher: data.publisher || data.publishers?.[0] || "", // ✅ support both ISBN & DOI
        publishedDate: data.publish_date || "",
        description: data.description || "",
        maturityRating: data.maturity_rating || "", // ✅ read from API
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
    <div className="flex flex-col min-h-screen bg-[#FAFAFB]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E4E4E7]">
        <div className="text-2xl font-bold text-indigo-600">ClarityUI</div>
        <div className="relative flex-1 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Type to search"
            className="pl-10 pr-4 py-1.5 w-full bg-gray-100 rounded-full"
          />
        </div>
      
      </header>

      <div className="flex flex-1">
      <div className="w-64 bg-white border-r border-[#E4E4E7] p-4 flex flex-col">
      <nav className="space-y-1">
            <div className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-700">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Dashboard</span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-indigo-600 text-white rounded-md">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20V2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V19.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Manage Books</span>
            </div>

            <div className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-700">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7M14 17L19 12L14 7M19 12H7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Manage Collections</span>
            </div>

            <div className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-700">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Manage Readers</span>
            </div>
          </nav>

          <div className="mt-auto space-y-1">
            <div className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-700">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Settings</span>
            </div>

            <div className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-700">
              <div className="w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semi-bold-13px">Log out</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 bg-[#FAFAFB]">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    className="text-gray-400 font-semi-bold-13px"
                  >
                    Manage Books
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    className="text-gray-700 font-semi-bold-13px"
                  >
                    Add Book
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

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
    {objectives.map((objective, index) => (
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
          <img
            src={
              uploadedImage
                ? URL.createObjectURL(uploadedImage)
                : bookData?.imageLinks?.thumbnail || ""
            }
            alt="Book Cover"
            className="w-24 h-32 object-cover rounded mb-2"
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
  onClick={isFetched ? () => {/* Handle generate video */} : fetchBookData}
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
          </div>
        </div>
      </div>
    </div>
  );
};
