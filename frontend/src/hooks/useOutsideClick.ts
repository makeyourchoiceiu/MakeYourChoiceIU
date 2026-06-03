import {useEffect} from "react";
import type {RefObject} from "react";

export function useOutsideClick<T extends HTMLElement>(
    ref: RefObject<T | null>,
    onOutsideClick: () => void,
    enabled = true
) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        function handleMouseDown(event: MouseEvent) {
            const target = event.target as Node;

            if (!ref.current) {
                return;
            }

            if (target && ref.current.contains(target)) {
                return;
            }
            onOutsideClick();
        }

        window.addEventListener('mousedown', handleMouseDown);
        return () => window.removeEventListener('mousedown', handleMouseDown);
    }, [ref, onOutsideClick, enabled]);
}