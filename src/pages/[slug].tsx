import { useRouter } from "next/router";
import React, { useCallback, useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalContextProvider";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsChat } from "react-icons/bs";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { BiImageAdd } from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";
import { trpc } from "../utils/trpc";
import CommentSidebar from "../components/CommentSidebar";
import UnsplashGallery from "../components/UnsplashGallery";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Interweave } from "interweave";

const PostPage = () => {
  const router = useRouter();

  const { data } = useSession();

  const { setShowCommentSidebar } = useContext(GlobalContext);

  const postRoute = trpc.useContext().posts;

  const invalidateCurrentPostPage = useCallback(() => {
    postRoute.getPost.invalidate({ slug: router.query.slug as string });
  }, [postRoute.getPost, router.query.slug]);

  const getPost = trpc.posts.getPost.useQuery(
    {
      slug: router.query.slug as string,
    },
    {
      // only perform this when the slug is defined
      enabled: !!router.query.slug,
    }
  );

  const likePost = trpc.posts.likePost.useMutation({
    onSuccess: () => {
      invalidateCurrentPostPage();
    },
  });
  // const [isLiked, setIsLiked] = useState(getPost.data?.likes.length ?? 0 > 0);

  const dislikePost = trpc.posts.dislikePost.useMutation({
    onSuccess: () => {
      console.log("post bookmarked");

      invalidateCurrentPostPage();
    },
  });

  const [isUnsplashModalOpen, setIsUnsplashModalOpen] =
    useState<boolean>(false);

  return (
    <MainLayout>
      {getPost.isSuccess && getPost.data && (
        <UnsplashGallery
          slug={getPost.data?.slug}
          isUnsplashModalOpen={isUnsplashModalOpen}
          setIsUnsplashModalOpen={setIsUnsplashModalOpen}
          postId={getPost.data?.id}
        />
      )}
      {getPost.data?.id && <CommentSidebar postId={getPost.data.id} />}
      {getPost.isLoading && (
        <div className="flex h-full w-full items-center justify-center space-x-4">
          <div>
            <AiOutlineLoading3Quarters className="animate-spin " />
          </div>
          Loading all posts...
        </div>
      )}

      {getPost.isSuccess && (
        <div className="fixed bottom-10 flex w-full items-center justify-center ">
          <div className="group flex items-center justify-center space-x-4 rounded-full border border-gray-400 bg-white px-6 py-2 shadow-xl transition duration-300 hover:border-gray-900 ">
            <div className="border-r pr-4 transition duration-300 group-hover:border-gray-900">
              {getPost.data?.likes && getPost.data?.likes.length > 0 ? (
                <FcLike
                  className="cursor-pointer text-lg"
                  onClick={() => {
                    getPost.data?.id &&
                      dislikePost.mutate({
                        postId: getPost.data?.id,
                      });
                  }}
                />
              ) : (
                <FcLikePlaceholder
                  className="cursor-pointer text-lg"
                  onClick={() => {
                    getPost.data?.id &&
                      likePost.mutate({
                        postId: getPost.data?.id,
                      });
                  }}
                />
              )}
            </div>
            <div className="">
              <BsChat
                className="cursor-pointer text-base"
                onClick={() => {
                  setShowCommentSidebar(true);
                  console.log("clicked");
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col items-center justify-center p-10">
        <div className="flex w-full max-w-screen-lg flex-col space-y-6">
          <div className="relative h-[60vh] rounded-xl  shadow-lg">
            {getPost.isSuccess && getPost.data?.featuredImage && (
              <Image
                src={getPost.data?.featuredImage}
                alt={getPost.data?.title}
                fill
                className="rounded-xl"
              />
            )}
            {data?.user?.id === getPost.data?.authorId && (
              <div
                className="absolute top-2 left-2 z-10 cursor-pointer rounded-lg bg-black/30 p-2 text-white hover:bg-black"
                onClick={() => setIsUnsplashModalOpen(true)}
              >
                <BiImageAdd className="text-2xl" />
              </div>
            )}
            <div className="absolute flex h-full w-full items-center justify-center">
              <div className="rounded-xl bg-gray-500 p-4 text-center  text-3xl  text-white opacity-50">
                {getPost.data?.title}
              </div>
            </div>
          </div>
          <div className="border-l-4 border-gray-800 pl-6">
            {getPost.data?.description}
          </div>
          <div className="prose break-words lg:prose-xl">
            <Interweave content={getPost.data?.html} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostPage;
