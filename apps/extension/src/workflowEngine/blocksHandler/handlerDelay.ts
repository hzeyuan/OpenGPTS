type handlerDelay = (block: any) => void;

const delay: handlerDelay = function (block) {
  console.log('Delay block', block)
  return new Promise((resolve) => {
    const delayTime = +block.data.time || 500;
    setTimeout(() => {
      resolve({
        data: '',
        nextBlockId: this.getBlockConnections(block.id),
      });
    }, delayTime);
  });
}

export default delay;
