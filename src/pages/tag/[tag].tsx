// import { useRouter } from "next/router";
// import React from "react";
// import Post from "../../components/Post";
// import MainLayout from "../../layouts/MainLayout";
// import { trpc } from "../../utils/trpc";

// const TagPage = () => {
//   const router = useRouter();
//   const getPostsByTag = trpc.tag.getPostsByTag.useQuery(
//     {
//       slug: router.query.slug as string,
//     },
//     // {
//     //   enabled: !!router.query.slug,
//     // }
    
//   );
//   return (
//     <MainLayout>
//       {getPostsByTag.isSuccess &&
//         getPostsByTag.data.map((post) => <Post key={post.id} {...post} />)}
//     </MainLayout>
//   );
// };

// export default TagPage;
