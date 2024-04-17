import Link from "next/link";

const List = () => {
  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-blue-600 text-sm py-4">
      <nav
        className="max-w-[85rem] w-full px-4 sm:flex sm:items-center sm:justify-between"
        aria-label="Global"
      >
        <div
          id="navbar-primary"
          className="hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block"
        >
          <div className="flex flex-row gap-5 sm:items-center sm:mt-0 sm:ps-5">
            <Link
              className="font-medium text-gray-300 hover:text-white"
              href="/"
            >
              Home
            </Link>
            <Link
              className="font-medium text-gray-300 hover:text-white"
              href="/chat"
            >
              Chatbot
            </Link>
            <Link
              className="font-medium text-gray-300 hover:text-white"
              href="/vision"
            >
              Vision
            </Link>
            <Link
              className="font-medium text-gray-300 hover:text-white"
              href="/assistants"
            >
              Assistants
            </Link>
            <Link
              className="font-medium text-gray-300 hover:text-white"
              href="/helpfulAssistant"
            >
              Helpful Assistant
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default List;
