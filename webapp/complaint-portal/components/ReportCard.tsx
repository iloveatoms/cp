import React from "react";

type UserProfile = {
  userid: number;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  followers: string;
  following: string;
  credits: number;
  dateOfCreation: string;
  profileUrl: string;
  bio: string;
};

type Report = {
  postid: string;
  userid: number;
  dateOfCreation: string;
  title: string;
  text: string;
  imageUrl: string;
  meta: {
    location: string;
    category: string;
    fileName: string;
  };
  likes: number;
  dislikes: number;
  credits: number;
  user: UserProfile;
};

interface ReportCardProps {
  report: Report;
  onVote: (postid: string, delta: number) => void; // Function to handle voting
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onVote }) => {
  const handleLike = () => {
    onVote(report.postid, 1); // Increment likes
  };

  const handleDislike = () => {
    onVote(report.postid, -1); // Decrement likes (dislike)
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
      <img
        src={report.imageUrl}
        alt={report.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold text-green-800 mb-2">{report.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{report.text}</p>
      <p className="text-xs text-gray-500">
        <strong>Location:</strong> {report.meta.location} | <strong>Category:</strong> {report.meta.category}
      </p>

      {/* Displaying Likes/Dislikes */}
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleLike}
            className="text-green-500 hover:text-green-700 focus:outline-none"
          >
            <i className="fas fa-thumbs-up"></i>
          </button>
          <span className="text-gray-700">{report.likes}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleDislike}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <i className="fas fa-thumbs-down"></i>
          </button>
          <span className="text-gray-700">{report.dislikes}</span>
        </div>
      </div>

      {/* Displaying the User's Profile */}
      <div className="flex items-center mt-4">
        <img
          src={report.user.profileUrl}
          alt={report.user.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="font-medium text-gray-800">{report.user.name}</p>
          <p className="text-xs text-gray-500">{report.user.aadhaar}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
