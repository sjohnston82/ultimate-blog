import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi";
import { trpc } from "../../utils/trpc";
import Post from "../Post";
import InfiniteScroll from "react-infinite-scroll-component";

const MainSection = () => {
  const getPosts = trpc.posts.getPosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <main className="col-span-8 h-full w-full border-r border-gray-300 px-24">
      <div className="flex w-full flex-col space-y-4  py-10  ">
        <div className="flex w-full items-center space-x-4 ">
          <label
            htmlFor="search"
            className="relative w-full rounded-3xl border border-gray-800"
          >
            <div className="absolute left-2  flex h-full items-center">
              <div className="w-max">
                <CiSearch className="" />
              </div>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="w-full rounded-3xl py-1 px-4 pl-7 text-sm outline-none placeholder:text-sm placeholder:text-gray-300"
              placeholder="Search..."
            />
          </label>
          <div className="flex w-full items-center justify-end space-x-4">
            <div className="">My topics:</div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="rounded-3xl bg-gray-200/50 px-4 py-3" key={i}>
                  tag {i}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-b border-gray-300 pb-8">
          <div className="">Articles</div>
          <div className="">
            <button className="flex items-center space-x-2 rounded-3xl border border-gray-800 px-4 py-1.5">
              <div className="font-semibold">Following</div>
              <div className="">
                <HiChevronDown className="text-xl" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center space-y-8">
        {getPosts.isLoading && (
          <div className="flex h-full w-full items-center justify-center space-x-4">
            <div>
              <AiOutlineLoading3Quarters className="animate-spin " />
            </div>
            Loading all posts...
          </div>
        )}
        <InfiniteScroll
          dataLength={
            getPosts.data?.pages.flatMap((page) => page.posts).length ?? 0
          }
          next={getPosts.fetchNextPage}
          hasMore={!!getPosts.hasNextPage}
          loader={<h4>Loading...</h4>}
          endMessage={<p className="my-4 text-center">That is the end of posts!</p>}
        >
          {getPosts.isSuccess &&
            getPosts.data?.pages
              .flatMap((page) => page.posts)
              .map((post) => <Post {...post} key={post.id} />)}
        </InfiniteScroll>
      </div>
    </main>
  );
};

export default MainSection;
