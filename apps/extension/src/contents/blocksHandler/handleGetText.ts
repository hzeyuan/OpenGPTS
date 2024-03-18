import handleSelector from "../handleSelector";

const getText = (block) => {
  return new Promise((resolve, reject) => {
    let texts = []; // 用于收集文本的数组

    handleSelector(block, {
      onSelected: (element) => {
        console.log('element',element)
        // 假设我们只关心元素的可见文本，使用innerText
        let text = element.innerText;
        console.log('text',text);
        texts.push(text);
      },
      onError: (error) => {
        // 如果在选择过程中遇到错误，拒绝这个Promise
        reject(error);
      },
      onSuccess: () => {
        // 成功处理所有元素后，解析收集到的文本数组
        resolve({
          texts
        });
      },
    });
  });
};

export default getText;
