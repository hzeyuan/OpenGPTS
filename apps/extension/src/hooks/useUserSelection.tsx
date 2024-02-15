import { useEffect, useState } from 'react';

const useUserSelection = () => {
    const [selection, setSelection] = useState('');
    const [copiedText, setCopiedText] = useState('');

    useEffect(() => {
        const handleMouseUp = () => {
            const selectedText = window.getSelection()?.toString();
            if (selectedText) {
                setSelection(selectedText);
            }
        };

        const handleCopy = (e: any) => {
            setCopiedText(e.clipboardData.getData('text/plain'));
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('copy', handleCopy);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('copy', handleCopy);
        };
    }, []);

    return { selection, copiedText };
};

export default useUserSelection;
