import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
