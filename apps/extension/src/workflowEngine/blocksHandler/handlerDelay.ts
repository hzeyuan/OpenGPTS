function delay(block) {
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
