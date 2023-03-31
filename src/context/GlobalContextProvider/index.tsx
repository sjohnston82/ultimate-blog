import React, { createContext, type SetStateAction, useState } from "react";

type GlobalContextType = {
  isWriteModalOpen: boolean;
  showCommentSidebar: boolean;
  setIsWriteModalOpen: React.Dispatch<SetStateAction<boolean>>;
  setShowCommentSidebar: React.Dispatch<SetStateAction<boolean>>;
};

export const GlobalContext = createContext<GlobalContextType>(
  null as unknown as GlobalContextType
);

const GlobalContextProvider = ({ children }: React.PropsWithChildren) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        isWriteModalOpen,
        setIsWriteModalOpen,
        showCommentSidebar,
        setShowCommentSidebar,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
