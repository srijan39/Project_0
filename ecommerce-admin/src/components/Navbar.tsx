const Navbar = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-bold text-xl">
        Ecommerce Admin
      </h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;