import { useEffect } from "react";
import { getProfile } from "../api/profile";

export default function Profile() {
  useEffect(() => {
    getProfile().catch(() => undefined);
  }, []);

  return (
    <div className="p-6 text-2xl font-semibold">
      Profile Page
    </div>
  )
}
