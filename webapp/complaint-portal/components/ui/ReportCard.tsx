"use client";


import { useRouter } from "next/navigation";
import { Report} from "@/lib/types"


import ReviewedIcon from "@/components/svg/reviewed";
import UnderReviewIcon from "@/components/svg/underReview";
import RejectedIcon from "@/components/svg/rejected";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const statusConfig : any = {
  reviewed: {
    title : "Reviewed",
    Icon: ReviewedIcon,
    style: "text-green-600",
  },
  underReview: {
    title : "Under Review",
    Icon: UnderReviewIcon,
    style: "text-yellow-500 hover:animate-spin",
  },
  rejected: {
    title: "Rejected",
    Icon: RejectedIcon,
    style: "text-red-600",
  },
};


function formatRelativeDate(dateString: number) {
  const date = new Date(Number(dateString));
  const now = new Date();
  const differenceInMilliseconds = now.getTime() - date.getTime();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  let ret :string = "";
  if (differenceInMilliseconds <= oneDayInMilliseconds) {
      ret += date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
      // More than 24 hours ago, show date (e.g., "Jan 1, 2025")
      ret += date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return ret
}


type ReportCardProps = {
  report : Report,
  updater? : (report : Report, action : string) => void
}

const ReportCard: React.FC<ReportCardProps> = ({ report, updater}) => {

  const router = useRouter();
  const [minimal, setMinimal] = useState<boolean>(false);

  useEffect(()=>{
    setMinimal( (updater === undefined) ? true : false )
  })

  let action : string;

  const handleLikes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if(report.currentUser.userid === -1){ toast.info("Please log in to vote."); return; }

    action = "neutral"; // as 0, then if wont execute -> action=Neutral

    const L = report.currentUser.postLiked;
    const D = report.currentUser.postDisliked;
    const C = ((e.target as HTMLButtonElement).getAttribute("button-type") === "btnLike") ? true : false;
    if (
      /**
       *
       * Click : Liked 1 , Disliked 0
       * Action : Neutral 0, Proceed (As Click) 1
       *
       * L D C Action
       * 0 0 0   1     // Action Click
       * 0 0 1   1     // Action Click
       *
       * 0 1 0   0     // Neutral
       * 0 1 1   1     // Action Click
       *
       * 1 0 0   1     // Action Click
       * 1 0 1   0     // Neutral
       *
       * 1 1 0   1     // Not possible State from DB (Action Click)
       * 1 1 1   1     // Not possible State from DB (Action Click)
       *
       *  F(A, B, C) = Σ( 0, 1, 3, 4, 6, 7)
       *             = L'D' + LD + L'C + L'C
       *             = ~(L⊕D) + L⊕C
       *             = ~(L^D) | L^C
       *
       */
      (L===D) || (L!==C)
    )
    {
      action = C ? "liked" : "disliked";
    }
    if(updater !== undefined) updater(report, action)
  };

  return (
    <div className={"bg-[#000000] mx-6 my-2 p-4 md:p-2 lg:p-8 z-9999 rounded-lg shadow-md hover:shadow-lg hover:shadow-green-700 transition-all flex flex-col max-h-[646px] w-[380px]"}>
        {/* Image */}
        <img src={report.imageUrl}
          alt={report.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />

        {/* Title */}
        <h3 className="text-lg w-full font-semibold text-green-800 mb-1 line-clamp-2">
          {report.title}
        </h3>

        {/* Description */}
        <p className="flex-1 w-full text-sm text-gray-600 mb-2 line-clamp-5 overflow-hidden"
          dangerouslySetInnerHTML={{ __html : report.text }}>
          {/* {report.text} */}
        </p>

        {/* Meta info */}
        {!minimal && (
          <p className="flex flex-col text-xs text-gray-500 mb-3">
            <span
              title={`Latitude : ${report.meta.gps?.latitude} \n Longitude : ${report.meta.gps?.longitude}`}
              onClick=
              {
                ()=>{
                router.push(`/map?latitude=${report.meta.gps?.latitude}&longitude=${report.meta.gps?.longitude}&z=19&i=${report.postid}`)
                }
              }
              className="hover:cursor-pointer hover:underline hover:decoration-green-500">
                <strong>Location:</strong> {report.meta.location}
            </span>
            <span
              className="hover:cursor-pointer hover:underline hover:decoration-green-500">
                <strong>Category:</strong> {report.meta.category}
            </span>
          </p>
        )}

        {/* Likes */}
        { !minimal && (
          <div className="flex w-full items-center justify-start gap-6 mb-4">
            <div className="flex items-center gap-1">
              <button
                button-type="btnLike"
                button-active={report.currentUser.postLiked}
                onClick={handleLikes}
              >
                👍
              </button>
              <span
                className="text-[#dddddd]"
                style={{ color: report.currentUser.postLiked ? "green" : "initial" }}
              >
                {report.likes}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                button-type="btnDislike"
                button-active={report.currentUser.postDisliked}
                onClick={handleLikes}
              >
                👎
              </button>
              <span
                className="text-[#dddddd]"
                style={{ color: report.currentUser.postDisliked ? "red" : "initial" }}
              >
                {report.dislikes}
              </span>
            </div>
          </div>
        )}


        {/* User Profile & Status */}
        <div className="flex w-full items-center justify-between border-t pt-3 gap-4">
          {/* User Profile (sticks to bottom) */}
          <div className="flex items-center mt-auto pt-3">
            <img
              src={report.user.profileUrl}
              alt={report.user.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <p className="font-medium text-gray-800" dangerouslySetInnerHTML={{ __html : report.user.name }}></p>
              <p className="text-xs text-gray-500">
                {formatRelativeDate(report.dateOfCreation)}
              </p>
            </div>

          </div>

          {/* Post Status (sticks to bottom) */}
          <div className="flex items-center"
            title={statusConfig[report.meta.status].title + "\nMarked at:" + formatRelativeDate(report.meta.statusDate)}  >
          {(() => {
              const status = statusConfig[report.meta.status];
              if (!status) return null;

              const { Icon, style } = status;

              return <Icon className={`w-6 h-6 ${style}`} />;
            })()}
          </div>
        </div>

      </div>
  );
};

export default ReportCard;

