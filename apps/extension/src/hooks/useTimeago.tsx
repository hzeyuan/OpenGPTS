import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 添加 relativeTime 插件
dayjs.extend(relativeTime);

export const useTimeAgo = (timestamp) => {
    const [timeago, setTimeago] = useState(dayjs(timestamp).fromNow());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeago(dayjs(timestamp).fromNow());
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [timestamp]);

    return timeago;
};
