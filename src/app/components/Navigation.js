import Link from "next/link";

const List = () => {
  return (
    <>
      <nav>
        <ul className="flex nav-bar">
          <li className="mr-6">
            <Link href="/">Home</Link>
          </li>
          <li className="mr-6">
            <Link href="/chat">Chatbot</Link>
          </li>
          <li className="mr-6">
            <Link href="/vision">Vision</Link>
          </li>
          <li className="mr-6">
            <Link href="/assistants">Assistants</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default List;
