import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 pb-24 pt-6 sm:px-8 lg:px-16">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
