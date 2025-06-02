import SideMenu from "./SideMenu";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
        {children}
    </div>
  );
}

export default Layout;
