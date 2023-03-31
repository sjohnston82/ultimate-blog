import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { trpc } from '../../utils/trpc';
import Modal from '../Modal';

interface TagFormModalProps {
  showTagCreateModal: boolean;
  setShowTagCreateModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const tagCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
});


const TagFormModal = ({showTagCreateModal, setShowTagCreateModal}: TagFormModalProps) => {

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    name: string;
    description: string;
  }>({
    resolver: zodResolver(tagCreateSchema),
  });

    const createTag = trpc.tag.createTag.useMutation({
      onSuccess: () => {
        toast.success(`Tag created successfully!`);
        reset();
        setShowTagCreateModal(false);
      },
    });


  return (
    <Modal
      isOpen={showTagCreateModal}
      onClose={() => setShowTagCreateModal(false)}
      title="Create a Tag"
    >
      <form
        onSubmit={handleSubmit((data) => createTag.mutate(data))}
        className="relative my-2 flex flex-col items-center justify-center space-y-4"
      >
        <input
          type="text"
          id="name"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600 "
          placeholder="Name"
          {...register("name")}
        />
        <p className="flex w-full justify-start pl-4 text-sm italic text-red-500">
          {errors.name?.message}
        </p>
        <input
          type="text"
          id="description"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600 "
          placeholder="Tag description"
          {...register("description")}
        />
        <p className="flex w-full justify-start pl-4 text-sm italic text-red-500">
          {errors.description?.message}
        </p>
        <div className="flex w-full justify-end">
        <button
          type="submit"
          className="space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
        >
          Create Tag
        </button>

        </div>
      </form>
    </Modal>
  );
}

export default TagFormModal