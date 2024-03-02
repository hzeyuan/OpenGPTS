import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { useState, useEffect } from 'react';
import { categories, getBlocks } from '~src/utils/workflow';

function useEditorBlock(name: string) {
  const [block, setBlock] = useState<{
    details?: PRAWorkflow.Block;
    category?: PRAWorkflow.Category;
  }>({
    details: undefined,
    category: undefined,
  });

  useEffect(() => {
    if (!name) return;

    const blocks = getBlocks();
    const details = blocks?.[name];
    console.log("details",details,blocks,name)
    if (!details) return;

    setBlock({
      details: { id: name, ...details },
      category: categories[details.category],
    });
  }, [name]);

  return block;
}

export default useEditorBlock;
