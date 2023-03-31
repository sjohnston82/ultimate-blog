import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useCallback, useContext } from "react";
import { GlobalContext } from "../../context/GlobalContextProvider";
import { HiXMark } from "react-icons/hi2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type CommentSidebarProps = {
  postId: string;
};

export const commentFormSchema = z.object({
  text: z.string().min(3),
});

type CommentFormType = {
  text: string;
};

const CommentSidebar = ({ postId }: CommentSidebarProps) => {
  const { showCommentSidebar, setShowCommentSidebar } =
    useContext(GlobalContext);

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<CommentFormType>({
    resolver: zodResolver(commentFormSchema),
  });

  // threw a hook error when i didn't do this before adding to trpc route
  const postRoute = trpc.useContext().posts;

  const createComment = trpc.posts.createComment.useMutation({
    onSuccess: () => {
      toast.success("Comment successfully created.");
      reset();
      postRoute.getComments.invalidate({
        postId,
      });
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        toast.error("You must log in to comment.");
      } else {
        toast.error("There was a problem creating your comment.");
      }
    },
  });

  const getComments = trpc.posts.getComments.useQuery({
    postId,
  });

  return (
    <Transition.Root show={showCommentSidebar} as={Fragment}>
      <Dialog as="div" onClose={() => setShowCommentSidebar(false)}>
        <div className="fixed right-0 top-0">
          <Transition.Child
            enter="transition duration-1000"
            leave="transition duration-500"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative h-screen w-[200px] bg-white shadow-md sm:w-[400px]">
              <div className="flex h-full w-full flex-col overflow-scroll px-6">
                <div className="mt-10 mb-5 flex items-center justify-between text-xl">
                  <h2 className=" font-medium">
                    Responses ({getComments.data?.length || 0})
                  </h2>
                  <div className="">
                    <HiXMark
                      className="cursor-pointer text-2xl"
                      onClick={() => setShowCommentSidebar(false)}
                    />
                  </div>
                </div>
                <div className="">
                  <form
                    className=" my-6 flex flex-col items-end space-y-5 p-5"
                    onSubmit={handleSubmit((data) => {
                      createComment.mutate({
                        ...data,
                        postId,
                      });
                    })}
                  >
                    <textarea
                      id="comment"
                      rows={3}
                      className=" h-full w-full rounded-xl border border-gray-300 p-4 shadow-lg outline-none focus:border-gray-600 "
                      placeholder="Write your comment here..."
                      {...register("text")}
                    />
                    {isValid && (
                      <button
                        type="submit"
                        className="space-x-3 rounded border border-gray-300 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
                      >
                        Comment
                      </button>
                    )}
                  </form>
                  <div className="flex flex-col items-center justify-center space-y-6 ">
                    {getComments.isSuccess &&
                      getComments.data?.map((comment) => (
                        <div
                          className="flex w-full flex-col space-y-2 border-b border-b-gray-300 pb-4 last:border-none "
                          key={comment.id}
                        >
                          <div className="flex w-full items-center space-x-2 text-xs">
                            <div className="relative h-8 w-8 rounded-full bg-gray-400"></div>
                            <div className="">
                              <p className="font-semibold">
                                {comment.author.name}
                              </p>
                              <p className="mx-1">
                                {dayjs(comment.createdDate).fromNow()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {comment.text}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CommentSidebar;
