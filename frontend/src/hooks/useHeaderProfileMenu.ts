import { useRef } from 'react';
import { useDisclosure } from './useDisclosure';
import { useOutsideClick } from './useOutsideClick';

export function useHeaderProfileMenu() {
    const { isOpen, open, close, toggle } = useDisclosure(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useOutsideClick(menuRef, close, isOpen);

    return {
        isOpen,
        open,
        close,
        toggle,
        menuRef,
    };
}