import Image from "next/image";
import NotificationBell from "./NotificationBell";

export default function Nav() {
  return (
    <div className="fixed z-50 bg-secondary flex items-center justify-between h-[140px] w-full px-20 shrink-0">
      <div className="flex gap-4 items-center justify-center">
        <Image src="/logoHaris.svg" alt="Logo" width={87} height={87} />
        <Image src="/haris.svg" alt="company name" width={152} height={75} />
      </div>
      <div className="flex items-center justify-center gap-8">
        <NotificationBell />

        <div className="flex items-center justify-center gap-2 rounded-full hover:bg-white/5 p-1.5 cursor-pointer transition-all duration-200 ease-in-out">
          <div className="flex items-center justify-center bg-[#4C4C4C] rounded-full p-1.5">
            <Image
              src="/user.svg"
              alt="user"
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <p className="font-semibold text-xl text-white font-inter">Faisal Ghamdi</p>
        </div>
        <Image src="/saudiMade.png" alt="Saudi made" width={97} height={38} />
      </div>
    </div>
  );
}