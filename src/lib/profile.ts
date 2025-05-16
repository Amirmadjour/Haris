export async function uploadProfileImage(username: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/users/${username}/profile-image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Profile image upload failed");
  }

  return await response.json();
}