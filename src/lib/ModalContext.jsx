'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Lets the navigation bar know when a detail page modal is open. The modal
 * overlay is fixed and covers the viewport at the same z-index as the
 * navigation bar, and comes later in the DOM, so it paints on top: clicks
 * already cannot reach the navigation while a modal is open. Without this,
 * keyboard focus still could, landing on links behind the overlay.
 *
 * @type {React.Context<{isModalOpen: boolean, registerModal: () => (() => void)}>}
 */
const ModalContext = createContext({ isModalOpen: false, registerModal: () => () => {} });

/** @param {{ children: React.ReactNode }} props */
export const ModalProvider = ({ children }) => {
  // A count rather than a boolean: moving between detail pages with the arrow
  // keys mounts the incoming modal before the outgoing one unmounts, and a
  // boolean would be left false.
  const [openModalCount, setOpenModalCount] = useState(0);

  const registerModal = useCallback(() => {
    setOpenModalCount((count) => count + 1);
    return () => setOpenModalCount((count) => count - 1);
  }, []);

  const value = useMemo(
    () => ({ isModalOpen: openModalCount > 0, registerModal }),
    [openModalCount, registerModal]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

/** @returns {{ isModalOpen: boolean, registerModal: () => (() => void) }} */
export const useModalState = () => useContext(ModalContext);
