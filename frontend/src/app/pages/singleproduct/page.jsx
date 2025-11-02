"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to categories page since this is now a dynamic route
    router.push("/pages/categories");
  }, [router]);

  return (
    <div className="w-full min-h-screen px-5 lg:px-10 flex flex-col py-8 gap-10">
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Redirecting to categories...</div>
      </div>
    </div>
  );
}

export default page;
