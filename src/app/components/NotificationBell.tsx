import { Bell } from "lucide-react";

export default function NotificationBell({ count = 5 }) {
  return (
    <div className="relative w-fit hover:bg-white/20 rounded-full p-2 transition-all duration-200 ease-in-out cursor-pointer">
      <Bell className="text-white" size={24} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-brand text font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
}
