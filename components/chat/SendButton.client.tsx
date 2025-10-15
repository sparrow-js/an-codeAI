import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { CornerDownRight, StopCircleIcon } from 'lucide-react';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export const SendButton = ({ show, isStreaming, disabled, onClick }: SendButtonProps) => {
  return (
    <AnimatePresence>
       <motion.button
          className="absolute flex justify-center items-center bottom-[18px] right-[22px] p-1 bg-neutral-500 hover:brightness-94 color-white rounded-md w-[34px] h-[34px] transition-theme disabled:opacity-50 disabled:cursor-not-allowed"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabled || !show}
          onClick={(event) => {
            event.preventDefault();

            if (!disabled) {
              onClick?.(event);
            }
          }}
        >
          <div className="text-lg">
            {!isStreaming ? <CornerDownRight className="w-4 h-4" /> : <StopCircleIcon className="w-4 h-4" />}
          </div>
        </motion.button>
    </AnimatePresence>
  );
};
