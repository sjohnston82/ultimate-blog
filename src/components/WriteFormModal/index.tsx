import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../context/GlobalContextProvider";
import Modal from "../Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { toast } from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import TagAutoCompletion from "../TagsAutoCompletion";
import TagFormModal from "../TagFormModal";
import { HiXMark } from "react-icons/hi2";
import dynamic from "next/dynamic";

// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

interface IFormInputs {
  title: string;
  description: string;
  text: string;
  html: string;
}

export const writeFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  text: z.string().min(100).optional(),
  html: z.string().min(100),
});

export type TAG = { id: string; name: string };

const WriteModalForm = () => {
  const { isWriteModalOpen, setIsWriteModalOpen } = useContext(GlobalContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<IFormInputs>({
    resolver: zodResolver(writeFormSchema),
  });

  const postRoute = trpc.useContext().posts;

  const createPost = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      toast.success(`Post created successfully!`);
      setIsWriteModalOpen(false);
      reset();
      postRoute.getPosts.invalidate();
    },
  });

  const onSubmit = (data: IFormInputs) => {
    const mutationData =
      selectedTags.length > 0 ? { ...data, tagIds: selectedTags } : data;
    createPost.mutate(mutationData);
  };

  const [selectedTags, setSelectedTags] = useState<TAG[]>([]);

  const [showTagCreateModal, setShowTagCreateModal] = useState(false);

  const getTags = trpc.tag.getTags.useQuery();

  return (
    <>
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
      >
        {getTags.isSuccess && (
          <>
            <TagFormModal
              showTagCreateModal={showTagCreateModal}
              setShowTagCreateModal={setShowTagCreateModal}
            />
            <div className="my-4 flex w-full items-center space-x-4">
              <div className="w-4/5 ">
                <TagAutoCompletion
                  tags={getTags.data}
                  setSelectedTags={setSelectedTags}
                  selectedTags={selectedTags}
                />
              </div>

              <button
                onClick={() => setShowTagCreateModal(true)}
                className="space-x-3 whitespace-nowrap rounded border border-gray-200 px-4 py-2 text-xs transition hover:border-gray-900 hover:text-gray-900 "
              >
                Create Tag
              </button>
            </div>
            <div className="my-4 flex w-full flex-wrap items-center">
              {selectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="m-2 flex items-center whitespace-nowrap rounded-2xl bg-gray-200/50 px-5 py-3"
                >
                  {tag.name}
                  <HiXMark
                    className="cursor-pointer text-xl"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.filter((currTag) => currTag.id !== tag.id)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}
        <form
          onSubmit={handleSubmit((data) => onSubmit(data))}
          className="relative flex flex-col items-center justify-center space-y-4"
        >
          {createPost.isLoading && (
            <div className="h-fullitems-center absolute w-full justify-center">
              <AiOutlineLoading3Quarters className="animate-spin " />
            </div>
          )}
          <input
            type="text"
            id="title"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600 "
            placeholder="Title"
            {...register("title")}
          />
          <p className="flex w-full justify-start pl-4 text-sm italic text-red-500">
            {errors.title?.message}
          </p>
          <input
            type="text"
            id="description"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600 "
            placeholder="Short description"
            {...register("description")}
          />
          <p className="flex w-full justify-start pl-4 text-sm italic text-red-500">
            {errors.description?.message}
          </p>

          {/* <textarea
            id="text"
            cols={10}
            rows={10}
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600 "
            placeholder="Main body of post"
            {...register("text")}
          /> */}
          <Controller
            name="html"
            render={({ field }) => (
              <div className="w-full">
                <ReactQuill
                  {...field}
                  theme="snow"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Write your post body here..."
                />
              </div>
            )}
            control={control}
          />

          <p className="flex w-full justify-start pl-4 text-sm italic text-red-500">
            {errors.text?.message}
          </p>

          <div className="flex w-full justify-end">
            <button
              type="submit"
              className="space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default WriteModalForm;
