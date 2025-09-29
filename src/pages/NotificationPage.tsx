import React, { useEffect, useState } from "react";
import NotificationCard from "../components/notifications/NotificationCard";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // temporary mock data (replace with backend fetch later)
  useEffect(() => {
    const mockData: Notification[] = [
      {
        id: "1",
        title: "New Follower",
        message: "John Doe started following you.",
        date: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Album Released",
        message: "Your album 'Summer Vibes' is now live.",
        date: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Subscription Update",
        message: "Your subscription has been renewed successfully.",
        date: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
    ];
    setNotifications(mockData);
  }, []);

  return (
    <div>
      <h2 className="mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        notifications.map((n) => (
          <NotificationCard
            key={n.id}
            title={n.title}
            message={n.message}
            date={n.date}
          />
        ))
      )}
    </div>
  );
};

export default NotificationsPage;
