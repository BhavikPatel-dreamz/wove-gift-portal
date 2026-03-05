"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import {
  getProfileDetails,
  updateProfileDetails,
  updateProfilePassword,
} from "@/lib/action/profileAction";

const nameRegex = /^[A-Za-z][A-Za-z\s'-]*$/;
const phoneRegex = /^\+?[0-9()\-\s]+$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,100}$/;

const gradientBorderCardStyle = {
  background:
    "linear-gradient(180deg,#FEF8F6 0%,#FDF7F8 100%) padding-box, linear-gradient(114.06deg,#ED457D 11.36%,#FA8F42 90.28%) border-box",
};

function formatDate(value) {
  if (!value) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch (_error) {
    return "N/A";
  }
}

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const loadProfileDetails = useCallback(async () => {
    setIsLoading(true);
    const result = await getProfileDetails();

    if (!result.success) {
      setProfileMessage({
        type: "error",
        text: result.message || "Unable to load your profile details.",
      });
      setIsLoading(false);
      return;
    }

    setProfileData(result.data);
    setProfileForm({
      firstName: result.data.firstName || "",
      lastName: result.data.lastName || "",
      email: result.data.email || "",
      phone: result.data.phone || "",
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    loadProfileDetails();
  }, [loadProfileDetails, session?.user?.id]);

  const initials = useMemo(() => {
    const first = profileForm.firstName?.[0] || "";
    const last = profileForm.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [profileForm.firstName, profileForm.lastName]);

  const validateProfileForm = useCallback(() => {
    const nextErrors = {};
    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const phone = profileForm.phone.trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      nextErrors.firstName = "First name must be at least 2 characters";
    } else if (!nameRegex.test(firstName)) {
      nextErrors.firstName = "First name contains invalid characters";
    }

    if (!lastName) {
      nextErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      nextErrors.lastName = "Last name must be at least 2 characters";
    } else if (!nameRegex.test(lastName)) {
      nextErrors.lastName = "Last name contains invalid characters";
    }

    if (phone) {
      if (!phoneRegex.test(phone)) {
        nextErrors.phone = "Phone number contains invalid characters";
      } else {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 8 || digits.length > 15) {
          nextErrors.phone = "Phone number must contain 8 to 15 digits";
        }
      }
    }

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [profileForm.firstName, profileForm.lastName, profileForm.phone]);

  const validatePasswordForm = useCallback(() => {
    const nextErrors = {};

    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (!strongPasswordRegex.test(passwordForm.newPassword)) {
      nextErrors.newPassword =
        "Use 8+ chars with uppercase, lowercase, number, and special character";
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      nextErrors.newPassword = "New password must be different from current";
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [passwordForm.confirmPassword, passwordForm.currentPassword, passwordForm.newPassword]);

  const handleProfileFieldChange = useCallback((field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => ({ ...prev, [field]: "" }));
    setProfileMessage(null);
  }, []);

  const handlePasswordFieldChange = useCallback((field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    setPasswordMessage(null);
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);

    const result = await updateProfileDetails({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      phone: profileForm.phone.trim(),
    });

    if (!result.success) {
      setProfileMessage({
        type: "error",
        text: result.message || "Failed to update profile details.",
      });
      if (result.fieldErrors) {
        setProfileErrors(result.fieldErrors);
      }
      setIsSavingProfile(false);
      return;
    }

    setProfileData(result.data);
    setProfileForm((prev) => ({
      ...prev,
      firstName: result.data.firstName || "",
      lastName: result.data.lastName || "",
      phone: result.data.phone || "",
    }));
    setProfileMessage({
      type: "success",
      text: result.message || "Profile updated successfully.",
    });
    setIsSavingProfile(false);
    router.refresh();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!validatePasswordForm()) {
      return;
    }

    setIsSavingPassword(true);

    const result = await updateProfilePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });

    if (!result.success) {
      setPasswordMessage({
        type: "error",
        text: result.message || "Failed to update password.",
      });
      if (result.fieldErrors) {
        setPasswordErrors(result.fieldErrors);
      }
      setIsSavingPassword(false);
      return;
    }

    setPasswordMessage({
      type: "success",
      text: result.message || "Password updated successfully.",
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsSavingPassword(false);
  };

  if (!session?.user?.id) {
    return (
      <section className="min-h-screen bg-gray-50 px-4 py-30 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl bg-white p-8 text-center"
            style={{ boxShadow: "0px 0px 60px 0px #0000000F" }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
              Sign In To View Your Profile
            </h1>
            <p className="text-[#4A4A4A] mb-6">
              Please log in to view and manage your account details.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-semibold bg-linear-to-r from-[#ED457D] to-[#FA8F42]"
            >
              Go To Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gray-50 px-4 py-30 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse rounded-3xl bg-white h-40 mb-6" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="animate-pulse rounded-3xl bg-white h-80" />
            <div className="animate-pulse rounded-3xl bg-white h-80 lg:col-span-2" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-30 md:px-8">
      <div className="max-w-7xl mx-auto sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
            My Profile
          </h1>
          <p className="text-[#4A4A4A] text-sm sm:text-base">
            View your account details and keep your password secure.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#1A1A1A14]">
            <div className="w-14 h-14 rounded-full bg-linear-to-r from-[#ED457D] to-[#FA8F42] text-white font-bold text-lg flex items-center justify-center mb-4">
              {initials}
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">
              {profileForm.firstName} {profileForm.lastName}
            </h2>
            <p className="text-sm text-[#4A4A4A] mb-4">{profileForm.email}</p>

            <div className="space-y-3 text-sm">
              {/* <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Role</span>
                <span className="font-medium text-[#1A1A1A]">
                  {profileData?.role || "CUSTOMER"}
                </span>
              </div> */}
              <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Member Since</span>
                <span className="font-medium text-[#1A1A1A]">
                  {formatDate(profileData?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Last Updated</span>
                <span className="font-medium text-[#1A1A1A]">
                  {formatDate(profileData?.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Account Status</span>
                <span className="font-medium text-[#1A1A1A]">
                  {profileData?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {/* <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Email Verified</span>
                <span className="font-medium text-[#1A1A1A]">
                  {profileData?.isVerified ? "Yes" : "No"}
                </span>
              </div> */}
            </div>
          </div>

          <div
            className="lg:col-span-2 rounded-[24px] border-2 border-transparent p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)]"
            style={gradientBorderCardStyle}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-5">
              Profile Details
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        handleProfileFieldChange("firstName", e.target.value)
                      }
                      placeholder="First Name*"
                      maxLength={50}
                      autoComplete="given-name"
                      className={`w-full px-4 py-3 bg-white border ${profileErrors.firstName ? "border-red-500" : "border-[#1A1A1A33]"} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                    />
                    {profileErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {profileErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        handleProfileFieldChange("lastName", e.target.value)
                      }
                      placeholder="Last Name*"
                      maxLength={50}
                      autoComplete="family-name"
                      className={`w-full px-4 py-3 bg-white border ${profileErrors.lastName ? "border-red-500" : "border-[#1A1A1A33]"} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                    />
                    {profileErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {profileErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="email"
                      value={profileForm.email}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-[#1A1A1A1F] rounded-[15px] text-[#6B7280] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        handleProfileFieldChange("phone", e.target.value)
                      }
                      placeholder="Phone Number"
                      maxLength={20}
                      autoComplete="tel"
                      className={`w-full px-4 py-3 bg-white border ${profileErrors.phone ? "border-red-500" : "border-[#1A1A1A33]"} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                    />
                    {profileErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>
                    )}
                  </div>
                </div>

                {profileMessage && (
                  <p
                    className={`text-sm ${profileMessage.type === "success" ? "text-green-700" : "text-red-600"}`}
                  >
                    {profileMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-full text-white font-semibold transition-all ${isSavingProfile ? "bg-gray-400 cursor-not-allowed" : "bg-linear-to-r from-[#ED457D] to-[#FA8F42] hover:opacity-95 cursor-pointer"}`}
                >
                  {isSavingProfile ? "Saving..." : "Save Profile"}
                </button>
            </form>
          </div>
        </div>

        <div
          className="rounded-[24px] border-2 border-transparent p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)]"
          style={gradientBorderCardStyle}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-5">
            Update Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-2xl">
              <div>
                <div
                  className={`relative bg-white rounded-[15px] border ${passwordErrors.currentPassword ? "border-red-500" : "border-[#1A1A1A33]"}`}
                >
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordFieldChange("currentPassword", e.target.value)
                    }
                    placeholder="Current Password*"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 cursor-pointer"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <div
                  className={`relative bg-white rounded-[15px] border ${passwordErrors.newPassword ? "border-red-500" : "border-[#1A1A1A33]"}`}
                >
                  <input
                    type={showPassword.next ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordFieldChange("newPassword", e.target.value)
                    }
                    placeholder="New Password*"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, next: !prev.next }))
                    }
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 cursor-pointer"
                  >
                    {showPassword.next ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <div
                  className={`relative bg-white rounded-[15px] border ${passwordErrors.confirmPassword ? "border-red-500" : "border-[#1A1A1A33]"}`}
                >
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordFieldChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm New Password*"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 cursor-pointer"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              {passwordMessage && (
                <p
                  className={`text-sm ${passwordMessage.type === "success" ? "text-green-700" : "text-red-600"}`}
                >
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingPassword}
                className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-full text-white font-semibold transition-all ${isSavingPassword ? "bg-gray-400 cursor-not-allowed" : "bg-linear-to-r from-[#ED457D] to-[#FA8F42] hover:opacity-95 cursor-pointer"}`}
              >
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
          </form>
        </div>
      </div>
    </section>
  );
}
