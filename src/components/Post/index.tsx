import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CiBookmarkCheck, CiBookmarkPlus } from "react-icons/ci";
import { trpc, type RouterOutputs } from "../../utils/trpc";

type Post = RouterOutputs["posts"]["getPosts"][number];

const Post = ({ ...post }: Post) => {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(post.bookmarks?.length)
  );

  const bookmarkPost = trpc.posts.bookmarkPost.useMutation({
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
    },
  });

  const unbookmarkPost = trpc.posts.unbookmarkPost.useMutation({
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
    },
  });

  return (
    <div
      className=" flex  flex-col space-y-4 border-b border-gray-300 pb-8 last:border-none"
      key={post.id}
    >
      <Link
        href={`/user/${post.author.username}`}
        className="group flex w-full cursor-pointer items-center space-x-2 "
      >
        {post.author.image && (
          <Image
            className="h-10 w-10 rounded-full bg-gray-400"
            alt={post.author.name ?? ""}
            src={post.author.image ?? ""}
            width={40}
            height={40}
          />
        )}
        <div className="">
          <p className="font-semibold">
            <span className="decoration-indigo-600 group-hover:underline">
              {post.author?.name}{" "}
            </span>
            &#x2022; {dayjs(post.createdDate).format("MMMM DD, YYYY")}
          </p>
          <p className="text-sm">
            All-around cool dude and coder extraordinaire
          </p>
        </div>
      </Link>
      <Link
        href={`/${post.slug}`}
        className=" group grid h-44 w-full grid-cols-12 gap-4"
      >
        <div className="col-span-8 flex h-full flex-col space-y-4">
          <p className="text-2xl font-bold text-gray-800 decoration-indigo-600 group-hover:underline">
            {post.title}
          </p>
          <p className="break-words text-sm text-gray-500">
            {post.description}
          </p>
        </div>
        <div className="col-span-4">
          <div className="h-full w-full transform rounded-xl bg-gray-300 transition duration-300 hover:scale-105 hover:shadow-xl">
            {post.featuredImage ? <Image src={post.featuredImage ?? ""} alt={post.title} fill className="rounded-xl" /> : "No image uploaded."}
          </div>
        </div>
      </Link>
      <div className="">
        <div className="flex w-full items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {post.tags?.map((tag) => (
              <Link
                href={`/tag/${tag.slug}`}
                className="rounded-2xl bg-gray-200/50 px-5 py-3"
                key={tag.id}
              >
                {tag.name}
              </Link>
            ))}
          </div>
          {session && (
            <div className="">
              {isBookmarked ? (
                <CiBookmarkCheck
                  className="cursor-pointer text-3xl text-indigo-600"
                  onClick={() => {
                    unbookmarkPost.mutate({ postId: post.id });
                  }}
                />
              ) : (
                <CiBookmarkPlus
                  className="cursor-pointer text-3xl"
                  onClick={() => {
                    bookmarkPost.mutate({ postId: post.id });
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
