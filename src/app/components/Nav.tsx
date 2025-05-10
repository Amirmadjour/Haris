"use client";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/navigation";
import { signOutAction } from "../actions/auth";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function Nav({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOutAction();
    router.push("/auth/login");
  };

  return (
    <div className="fixed z-50 bg-secondary flex items-center justify-between h-[140px] w-full px-20 shrink-0">
      <div className="flex gap-4 items-center justify-center">
        <Image src="/logoHaris.svg" alt="Logo" width={87} height={87} />
        <Image src="/haris.svg" alt="company name" width={152} height={75} />
      </div>
      <div className="flex items-center justify-center gap-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          <p className="font-semibold text-xl text-white font-inter">
            {user?.username}
          </p>
        </div>
        <Image src="/saudiMade.png" alt="Saudi made" width={97} height={38} />
      </div>
    </div>
  );
}