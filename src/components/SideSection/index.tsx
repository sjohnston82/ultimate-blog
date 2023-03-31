import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { trpc } from "../../utils/trpc";
import { toast } from "react-hot-toast";

const SideSection = () => {
  const postRoute = trpc.useContext().posts;

  const readingList = trpc.posts.getReadingList.useQuery();
  const suggestions = trpc.user.getSuggestions.useQuery();
  const followUser = trpc.user.followUser.useMutation({
    onSuccess: () => {
      toast.success("User followed!")
    }
  })

  return (
    <aside className=" col-span-4 flex  w-full flex-col space-y-4 p-6">
      <div className="">
        <h3 className="my-6 text-lg font-semibold">
          People you might be interested in:
        </h3>
        <div className="flex flex-col space-y-4">
          {suggestions.isSuccess && suggestions.data?.map((suggestion) => (
            <div className="flex flex-row items-center space-x-5" key={suggestion.id}>
              <div className="h-10 w-10 flex-none rounded-full bg-gray-500">
                <Image src={suggestion.image ?? ""} alt={suggestion.name ?? ""} className="rounded-full" height={40} width={40} />
              </div>
              <div className="">
                <div className="text-sm font-bold text-gray-900">
                  {suggestion.name}
                </div>
                <div className="text-xs">
                 {suggestion.username}
                </div>
              </div>
              <div className="">
                <button onClick={() => followUser.mutate({ userToFollowId: suggestion.id})} className="flex items-center space-x-3 rounded border border-gray-400/50 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 ">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky top-20">
        <h3 className="my-6 text-lg font-semibold">Your reading list:</h3>
        <div className="flex flex-col space-y-4">
          {readingList.data &&
            readingList.data.map((bookmark) => (
              <div
                className="group flex items-center space-x-2"
                key={bookmark.post.id}
              >
                <div className="aspect-square h-full w-2/5 rounded-xl bg-gray-300">
                  {/* <Image src={bookmark.post.featuredImage} alt={bookmark.post.title} fill className="rounded-xl aspect-square" /> */}
                </div>
                <div className="w-3/5 flex-col space-y-2">
                  <Link
                    href={`/${bookmark.post.slug}`}
                    className="text-lg font-semibold decoration-indigo-600 group-hover:underline"
                  >
                    {bookmark.post.title}
                  </Link>
                  <div className="truncate">{bookmark.post.description}</div>
                  <div className="flex w-full items-center space-x-4">
                    <Image
                      src={bookmark.user.image ?? ""}
                      height={32}
                      width={32}
                      alt={bookmark.user.name ?? "Avatar"}
                      className="rounded-full"
                    ></Image>
                    <div className="text-sm">
                      {bookmark.user.name} &#x2022;{" "}
                      {dayjs(bookmark.post.createdDate).format("MMMM DD, YYYY")}
                    </div>
                    {/* <div className="text-sm">March 19th, 2023</div> */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default SideSection;
