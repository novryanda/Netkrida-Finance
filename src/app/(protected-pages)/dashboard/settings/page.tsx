/**
 * Settings Page
 * Halaman untuk mengatur profile user
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/settings/change-password-form";
import { ProfilePictureUpload } from "@/components/dashboard/settings/profile-picture-upload";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const user = await settingsService.getUserProfile(session.user.id);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <ProfilePictureUpload
            currentImage={user.image}
            userName={user.name}
          />
          <ProfileForm user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
