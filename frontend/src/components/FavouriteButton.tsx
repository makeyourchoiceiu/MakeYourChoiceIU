import buttonStyles from '../styles/button.module.css';

interface FavouriteButtonProps {
    active: boolean;
    onClick?: () => void;
    addLabel: string;
    removeLabel: string;
}

export function FavouriteButton({
                                    active,
                                    onClick,
                                    addLabel,
                                    removeLabel,
                                }: FavouriteButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            aria-label={active ? removeLabel : addLabel}
            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantSecondary}`}
        >
            {active ? removeLabel : addLabel}
        </button>
    );
}
