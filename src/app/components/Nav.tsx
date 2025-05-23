"use client";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile, signOutAction } from "../actions/auth";
import { LogOut, Camera, User } from "lucide-react";
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
import Link from "next/link";
import { uploadProfileImage } from "@/lib/profile";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Nav({ user }: { user: any }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOutAction();
    router.push("/auth/login");
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { profile_image } = await getCurrentUserProfile(user.username);
        setProfileImage(profile_image);
      } catch (error) {
        console.error("Failed to fetch profile image:", error);
      }
    };

    fetchProfileImage();
  }, [user.username]);

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image."
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Maximum 5MB allowed.");
        return;
      }

      const { imageUrl } = await uploadProfileImage(user.username, file);
      setProfileImage(`${imageUrl}?${Date.now()}`);
      console.log(imageUrl);
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to update profile image");
      console.error("Profile image upload error:", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="fixed z-50 bg-secondary flex items-center justify-between h-[140px] w-full px-20 shrink-0">
      <Link href="/" className="flex gap-4 items-center justify-center">
        <Image src="/logoHaris.svg" alt="Logo" width={87} height={87} />
        <Image src="/haris.svg" alt="company name" width={152} height={75} />
      </Link>
      <div className="flex items-center justify-center gap-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-center justify-center gap-2 rounded-full hover:bg-white/5 p-1.5 transition-all duration-200 ease-in-out relative group">
          <div className="relative">
            {profileImage ? (
              <Avatar>
                <AvatarImage src={profileImage} alt="user" />
              </Avatar>
            ) : (
              <div className="flex items-center justify-center bg-[#4C4C4C] rounded-full w-[36px] h-[36px]">
                <User width={24} height={24} className="rounded-full" />
              </div>
            )}
            <button
              className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <p className="font-semibold text-xl text-white font-inter">
            {user?.username}
          </p>
        </div>
        <Image src="/saudiMade.png" alt="Saudi made" width={97} height={38} />
      </div>
    </div>
  );
}
