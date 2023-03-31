import Image from "next/image";
import React from "react";

interface AvatarProps {
  src: string;
  alt: string;
}

const index = ({ src, alt }: AvatarProps) => {
  return <Image src={src} alt={alt} fill className="rounded-full border-2"/>;
};

export default index;
