interface ToastMessageProps {
  title: string;
  description?: string;
}

const ToastMessage = ({ title, description }: ToastMessageProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-sm">{title}</div>
      {description && <div className="text-xs text-slate-300">{description}</div>}
    </div>
  );
};

export default ToastMessage;
