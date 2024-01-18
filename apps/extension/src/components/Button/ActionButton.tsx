import React from 'react';
import { motion } from 'framer-motion';



const ActionButton = ({ label, icon, onClick }) => {
    return (
        <motion.div
            className="bg-[var(--gptreat-sidebar-image-action-btn-bg-color)] text-[var(--gptreat-primary-color)] py-[4px] pl-[8px] max-w-[100%] pr-[8px] cursor-pointer inline-flex items-center text-xs image-quick-action-btn rounded-[6px]"
            whileHover={{ scale: 1.1 }} // 悬浮时放大效果
            whileTap={{ scale: 0.9 }} // 点击时缩小效果
            onClick={onClick}
        >
            <span className="ellipsis-text" style={{ maxWidth: "100%" }}>
                {label}
            </span>
            {icon}
        </motion.div>
    );
};

export default ActionButton;
