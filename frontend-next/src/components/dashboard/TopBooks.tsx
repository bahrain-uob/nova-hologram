import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const books = [
  {
    title: 'The AI Revolution',
    author: 'Sarah Johnson',
    cover: '/books/ai-revolution.jpg',
    rating: 4.9,
  },
  {
    title: 'Data Science Basics',
    author: 'Robert Chen',
    cover: '/books/data-science.jpg',
    rating: 4.7,
  },
  {
    title: 'Python Programming',
    author: 'Michael Lee',
    cover: '/books/python.jpg',
    rating: 4.5,
  },
];

export function TopBooks() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Books This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {books.map((book, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <Image 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{book.title}</p>
                  <p className="text-sm text-primary font-medium">{book.rating}</p>
                </div>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
