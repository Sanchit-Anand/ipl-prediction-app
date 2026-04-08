import clsx from "clsx";

interface PredictionButtonProps {
  team: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const PredictionButton = ({
  team,
  selected,
  disabled,
  onClick
}: PredictionButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "w-full px-4 py-3 rounded-2xl font-semibold text-sm uppercase tracking-wide transition",
        selected
          ? "bg-accent-gradient text-ink shadow-glow"
          : "bg-white/5 text-white hover:bg-white/10",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      {team}
    </button>
  );
};

export default PredictionButton;
