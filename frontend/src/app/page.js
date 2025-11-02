/**
 * Homepage - Now uses dynamic sections managed by admin
 * Sections are loaded from the database and rendered based on admin configuration
 */
import DynamicHomepage from "@/components/homepage/DynamicHomePage";

export default function Home() {
  return <DynamicHomepage />;
}
