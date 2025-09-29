import React from "react";

interface NotificationCardProps {
  title: string;
  message: string;
  date: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, message, date }) => {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{message}</p>
        <small className="text-muted">{new Date(date).toLocaleString()}</small>
      </div>
    </div>
  );
};

export default NotificationCard;
