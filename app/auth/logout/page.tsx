"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Trigger storage event manually (same tab fix)
    window.dispatchEvent(new Event("storage"));

    router.replace("/");
  }, [router]);

  return null;
}
