import React, { useState, useEffect } from 'react';
import { PlusIcon, Minus, Squircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion';

const ExpandPanel: React.FC<
  Omit<React.HTMLProps<HTMLDivElement>, 'onUpdateModelValue'> & {
    modelValue?: boolean;
    panelClass?: string;
    headerClass?: string;
    headerActiveClass?: string;
    activeClass?: string;
    hideHeaderIcon?: boolean;
    disabled?: boolean;
    appendIcon?: boolean;
    onUpdateModelValue?: (value: boolean) => void;
    header: React.ReactNode;
  }
> = ({
  modelValue = false,
  panelClass = '',
  headerClass = 'flex items-center py-2 focus:ring-0 w-full text-left text-gray-600 dark:text-gray-200',
  headerActiveClass = '',
  activeClass = '',
  hideHeaderIcon = false,
  disabled = false,
  appendIcon = false,
  onUpdateModelValue,
  header,
  children,
}) => {
    const [show, setShow] = useState(modelValue);

    const toggleExpand = () => {
      if (disabled) return;
      setShow(!show);
      if (onUpdateModelValue) {
        onUpdateModelValue(!show);
      }
    };

    useEffect(() => {
      setShow(modelValue);
    }, [modelValue]);

    useEffect(() => {
      if (disabled) setShow(false);
    }, [disabled]);


    const panelVariants = {
      open: {
        opacity: 1,
        height: 'auto',
        transition: {
          opacity: { duration: 0.1 },
          height: { duration: 0.15 }
        }
      },
      collapsed: {
        opacity: 0,
        height: 0,
        transition: {
          opacity: { duration: 0.1 },
          height: { duration: 0.15 }
        }
      }
    };

    return (
      <div aria-expanded={show} className={`ui-expand ${show ? activeClass : ''}`}>
        <button className={`${headerClass} ${show ? headerActiveClass : ''} cursor-pointer`} onClick={toggleExpand}>
          {header}
          {show ? (

            <Minus className='w-4 h-4 mr-2 -ml-1 transition-transform' />
          ) : <PlusIcon className='w-4 h-4 mr-2 -ml-1 transition-transform' />}

        </button>

        <AnimatePresence>
          {show && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={panelVariants}
              className={`ui-expand__panel ${panelClass}`}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

export default ExpandPanel;
