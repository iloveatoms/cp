"use client";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  followers: number;
  following: number;
  credits: number;
};

type UserProfileModalProps = {
  user: UserProfile;
  onClose: () => void;
};

export default function UserProfileModal({
  user,
  onClose,
}: UserProfileModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-[0_35px_80px_rgba(0,0,0,0.12)] border border-[#E1F1E4] relative">
        <button
          className="absolute top-3 right-3 text-[#2C6E49] hover:text-[#E63946] transition"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-[#2C6E49] mb-4">
          {user.name}&apos;s Profile
        </h2>
        <div className="space-y-2 text-sm text-[#4D4D4D]">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Aadhaar:</strong> {user.aadhaar}
          </p>
          <p>
            <strong>Age:</strong> {user.age}
          </p>
          <p>
            <strong>Followers:</strong> {user.followers}
          </p>
          <p>
            <strong>Following:</strong> {user.following}
          </p>
          <p>
            <strong>Credits:</strong> {user.credits}
          </p>
        </div>
      </div>
    </div>
  );
}
