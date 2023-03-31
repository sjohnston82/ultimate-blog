import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useState } from "react";

import { z } from "zod";
import Modal from "../Modal";
import { useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";
import useDebounce from "../../hooks/useDebounce";
import { BiLoaderAlt } from "react-icons/bi";
import { toast } from "react-hot-toast";

interface UnsplashGalleryProps {
  isUnsplashModalOpen: boolean;
  setIsUnsplashModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  postId: string;
  slug: string;
}

const UnsplashGallery = ({
  isUnsplashModalOpen,
  setIsUnsplashModalOpen,
  postId,
  slug,
}: UnsplashGalleryProps) => {
  const { register, watch, reset } = useForm<{ searchQuery: string }>({
    resolver: zodResolver(
      z.object({
        searchQuery: z.string().min(3),
      })
    ),
  });

  const [selectedImage, setSelectedImage] = useState("");
  const watchSearchQuery = watch("searchQuery");
  const debouncedSearchQuery = useDebounce(watchSearchQuery, 2000);

  const getImages = trpc.unsplash.getImages.useQuery(
    { searchQuery: debouncedSearchQuery },
    {
      enabled: Boolean(debouncedSearchQuery),
    }
  );

  const utils = trpc.useContext();

  const updateFeaturedImage = trpc.posts.updateFeaturedImage.useMutation({
    onSuccess: () => {
      utils.posts.getPost.invalidate({ slug });
      setIsUnsplashModalOpen(false);
      reset();
      toast.success("Featured image successfully uploaded.");
    },
  });

  return (
    <Modal
      isOpen={isUnsplashModalOpen}
      onClose={() => setIsUnsplashModalOpen(false)}
      title="Select an image from Unsplash"
      unsplash={true}
    >
      <div className="">
        <div className="flex flex-col space-y-4 ">
          <input
            type="text"
            id="search"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            {...register("searchQuery")}
          />
          {debouncedSearchQuery && getImages.isLoading && (
            // <div className="flex h-56 w-full items-center justify-center">
            <BiLoaderAlt className="animate-spin place-content-center text-3xl" />
            // </div>
          )}
          <div className="relative grid  h-96 w-full grid-cols-3 place-items-center gap-4 overflow-y-scroll">
            {getImages.isSuccess &&
              getImages.data?.results.map((image) => (
                <div
                  className="group relative aspect-video h-full w-full cursor-pointer "
                  key={image.id}
                  onClick={() => setSelectedImage(image.urls.full)}
                >
                  <div
                    className={`absolute group-hover:bg-black/40 ${
                      selectedImage === image.urls.full && "bg-black/40"
                    } inset-0 z-10 h-full w-full rounded-md`}
                  ></div>
                  <Image
                    alt={image.alt_description ?? ""}
                    src={image.urls.thumb ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                    className="rounded-md"
                  />
                </div>
              ))}
          </div>
          {selectedImage && (
            <div className="flex w-full justify-center">
              <button
                type="submit"
                className="space-x-3  rounded border border-gray-400 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                onClick={() => {
                  updateFeaturedImage.mutate({
                    postId: postId,
                    imageUrl: selectedImage,
                  });
                }}
                disabled={updateFeaturedImage.isLoading}
              >
                {updateFeaturedImage.isLoading ? "Loading..." : "Upload Image"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UnsplashGallery;
