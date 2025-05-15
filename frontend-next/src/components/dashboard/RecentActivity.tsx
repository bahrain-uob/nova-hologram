import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const activities = [
  {
    user: {
      name: "John Doe",
      image: "/avatars/01.png",
      initials: "JD",
    },
    action: "finished reading",
    book: "The AI Revolution",
    time: "2 hours ago",
  },
  {
    user: {
      name: "Emma Wilson",
      image: "/avatars/02.png",
      initials: "EW",
    },
    action: "started",
    book: "Data Science Basics",
    time: "3 hours ago",
  },
  {
    user: {
      name: "Mike Brown",
      image: "/avatars/03.png",
      initials: "MB",
    },
    action: "rated",
    book: "Python Programming",
    rating: 4.5,
    time: "4 hours ago",
  },
];

export function RecentActivity() {
  return (
    <Card className="bg-white">
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.user.image}
                  alt={activity.user.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.action}{" "}
                  <span className="font-medium">{activity.book}</span>
                  {activity.rating && (
                    <span className="ml-1 text-yellow-500">
                      {"★".repeat(Math.floor(activity.rating))}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
