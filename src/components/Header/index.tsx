import React, { useContext } from "react";
import { VscThreeBars } from "react-icons/vsc";
import { BsBell } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { signIn, signOut, useSession } from "next-auth/react";
import { HiLogout } from "react-icons/hi";
import { GlobalContext } from "../../context/GlobalContextProvider";
import Link from "next/link";

const Header = () => {
  const { status } = useSession();

  const { setIsWriteModalOpen } = useContext(GlobalContext);

  return (
    <header className="flex h-20 w-full flex-row items-center justify-between border-b-[1px]  border-gray-300 bg-white px-4">
      <div className="">
        <VscThreeBars className="text-2xl text-gray-600" />
      </div>
      <Link href={"/"} className="text-xl font-thin select-none cursor-pointer">
        BLOG TITLE
      </Link>
      {status === "authenticated" ? (
        <div className="flex items-center space-x-4">
          <div className="">
            <BsBell className="text-2xl text-gray-600" />
          </div>
          <div className="">
            <div className="h-5 w-5 rounded-full bg-gray-600"></div>
          </div>
          <div className="">
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              <div className="">Write</div>
              <div className="">
                <FiEdit className="text-gray-600" />
              </div>
            </button>
          </div>
          <div className="">
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              <div className="">Logout</div>
              <div className="">
                <HiLogout className="text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="">
          <button
            onClick={() => signIn()}
            className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
          >
            Sign In
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
