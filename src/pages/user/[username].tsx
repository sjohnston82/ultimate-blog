import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Avatar from "../../components/Avatar";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { BiEdit } from "react-icons/bi";
import { SlShareAlt } from "react-icons/sl";
import { toast } from "react-hot-toast";
import Post from "../../components/Post";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../env/server.mjs";
import Modal from "../../components/Modal";
import slugify from "slugify";
import Link from "next/link";

const UserProfilePage = () => {
  const router = useRouter();

  const currentUser = useSession();

  const userProfile = trpc.user.getUserProfile.useQuery(
    {
      username: router.query.username as string,
    },
    {
      enabled: !!router.query.username,
    }
  );

  const getUserPosts = trpc.user.getUserPosts.useQuery(
    {
      username: router.query.username as string,
    },
    {
      enabled: !!router.query.username,
    }
  );

  const userRoute = trpc.useContext().user;

  const uploadAvatar = trpc.user.uploadAvatar.useMutation({
    onSuccess: () => {
      if (userProfile.data?.username) {
        userRoute.getUserProfile.invalidate({
          username: userProfile.data?.username as string,
        });
        toast.success("avatar updated!");
      }
    },
  });

  const followUser = trpc.user.followUser.useMutation({
    onSuccess: () => {
      toast.success("User followed!");
    },
  });

  const unfollowUser = trpc.user.unfollowUser.useMutation({
    onSuccess: () => {
      toast.success("User unfollowed!");
    }
  })

  const getAllFollowers = trpc.user.getAllFollowers.useQuery();

  const [objectImage, setObjectImage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userProfile.data?.username) {
      const file = e.target.files[0];

      if (file.size > 1.5 * 1000000) {
        return toast.error("images size should not be greater than 1MB");
      }

      setObjectImage(URL.createObjectURL(file));

      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onloadend = () => {
        if (fileReader.result && userProfile.data?.username) {
          uploadAvatar.mutate({
            imageAsDataUrl: fileReader.result as string,
            username: userProfile.data?.username,
          });
        }
      };
    }
  };

  const [isShowingFollowerModal, setIsShowingFollowerModal] = useState(false);

  return (
    <MainLayout>
      {getAllFollowers.isSuccess && (
        <Modal
          isOpen={isShowingFollowerModal}
          onClose={() => setIsShowingFollowerModal(false)}
          title="Users following you:"
        >
          {getAllFollowers.data?.followedBy.map((follower) => (
            <div
              className="flex w-full items-center justify-between"
              key={follower.id}
            >
              <Link
                href={`/user/${slugify(follower.username)}`}
                onClick={() => setIsShowingFollowerModal(false)}
                className="text-xl hover:text-gray-700"
              >
                {follower.name}{" "}
              </Link>
              <button
                onClick={() =>
                 { 
                  follower.followedBy.length === 0 ?
                  followUser.mutate({
                    userToFollowId: follower.id,
                  })
                   :
                    unfollowUser.mutate({
                    userToUnfollowId: follower.id,
                  })}
                }
                className="rounded-xl border border-gray-400 p-2 hover:text-gray-700"
              >
                {follower.followedBy.length > 0 ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </Modal>
      )}
      <div className="flex h-full w-full items-center justify-center">
        <div className="my-10 flex w-full flex-col items-center justify-center lg:max-w-screen-md xl:max-w-screen-lg">
          <div className="flex w-full flex-col rounded-3xl bg-white shadow-md">
            <div className="relative h-44 w-full rounded-t-3xl bg-gradient-to-br from-red-800 via-yellow-600 to-yellow-500">
              <div className="absolute -bottom-10 left-12">
                <div className="group relative h-28 w-28 rounded-full">
                  {currentUser.data?.user?.id === userProfile.data?.id && (
                    <label
                      htmlFor="avatarFile"
                      className="absolute z-10 flex h-full w-full cursor-pointer items-center justify-center rounded-full transition duration-300 group-hover:bg-black/40"
                    >
                      <BiEdit className="hidden text-3xl text-white group-hover:block" />
                      <input
                        type="file"
                        name="avatarFile"
                        id="avatarFile"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple={false}
                      />
                    </label>
                  )}
                  {!objectImage && userProfile.data?.image && (
                    <Avatar
                      src={userProfile.data?.image}
                      alt={userProfile.data?.name ?? ""}
                    />
                  )}
                  {objectImage && (
                    <Avatar
                      src={objectImage}
                      alt={userProfile.data?.name ?? ""}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 ml-12 flex flex-col space-y-0.5 rounded-b-3xl py-5">
              <div className="text-2xl font-semibold text-gray-800">
                {userProfile.data?.name}
              </div>
              <div className="text-gray-600">@{userProfile.data?.username}</div>
              <div className="text-gray-600">
                {userProfile.data?._count.posts ?? 0}{" "}
                {userProfile.data?._count.posts === 1 ? "post" : "posts"}
              </div>
              <button
                onClick={() => setIsShowingFollowerModal(true)}
                className="flex cursor-pointer justify-start text-gray-600 hover:text-gray-400"
              >
                {userProfile.data?._count.followedBy ?? 0}{" "}
                {userProfile.data?._count.followedBy === 1
                  ? "follower"
                  : "followers"}
              </button>
              <div className="">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("URL copied to clipboard!");
                  }}
                  className="mt-2 flex transform items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 active:scale-95"
                >
                  <div className="">Share Profile</div>
                  <div className="">
                    <SlShareAlt className="text-gray-600" />
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="my-10 w-full ">
            {getUserPosts.isSuccess &&
              getUserPosts.data?.posts.map((post) => (
                <Post {...post} key={post.id} />
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
