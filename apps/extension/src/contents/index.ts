import type { PlasmoCSConfig } from "plasmo"
// import Browser from "webextension-polyfill";

import { sendToBackground } from "@plasmohq/messaging"
import $ from 'jquery'
import { Storage } from "@plasmohq/storage";
import _ from "lodash";
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end",
  world: "MAIN"
}


const storage = new Storage({
  area: "local",
  allCopied: true,
});

const triggerInputEvent = (element, text) => {
  // 创建一个输入事件
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    data: text,
  });

  // 设置输入框的值
  element.value = text;

  // 触发输入事件
  element.dispatchEvent(inputEvent);
};

const fillField = (selector, text) => {
  const element = $(selector)[0];
  if (element) {
    triggerInputEvent(element, text);
    console.log(`填写字段: ${text}`);
  } else {
    console.error("找不到元素: ", selector);
  }
};


const fillName = async (name) =>
  fillField("input[placeholder='Name your GPT']", name);
const fillDescription = async (description) =>
  fillField(
    "input[placeholder='Add a short description about what this GPT does']",
    description,
  );
const fillIntroduction = async (introduction) =>
  fillField(
    "textarea[placeholder='What does this GPT do? How does it behave? What should it avoid doing?']",
    introduction,
  );

const randomWait = async (min, max) => {
  const waitTime = Math.floor(Math.random() * (max - min + 1) + min);
  await new Promise((resolve) => setTimeout(resolve, waitTime));
};


const addLog = async (
  tabId,
  action,
  description,
  status = "creating",
  gptInfoParam?: Partial<GPTInfo>,
) => {
  const logEntry = {
    time: new Date().toLocaleString(),
    action,
    description,
  };
  const gptsStats = await storage.getItem<GPTsStats>('GPTsStats');
  const gptInfo = _.get(gptsStats, `gpts.${tabId}`, {})
  const logs: Log[] = _.get(gptInfo, 'logs', []);

  console.log('addLog gptInfo', gptInfo)

  logs.push(logEntry)
  _.assign(gptInfo, {
    ...gptInfo,
    logs,
    status,
    ...gptInfoParam,
  })

  //找到对应的gpt
  console.log('gptsStats', gptInfo, tabId)

  // gptsStats.gpts[tabId] = gptInfo;
  _.set(gptsStats, `gpts.${tabId}`, gptInfo)

  await storage.setItem(`${tabId}`, gptInfo);
  await storage.setItem('GPTsStats', gptsStats)

};

/**
   * 检测 URL 变化直到满足特定条件
   * @param {string} expectedPattern - 预期的 URL 正则表达式模式
   * @param {number} timeout - 超时时间（毫秒）
   */
const waitForUrlChange = async (expectedPattern, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const pattern = new RegExp(expectedPattern);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      if (pattern.test(window.location.href)) {
        clearInterval(intervalId);
        console.log("URL变化符合预期")
        resolve("URL变化符合预期");
      } else if (currentTime - startTime > timeout) {
        clearInterval(intervalId);
        console.log("等待URL变化超时")
        reject("等待URL变化超时");
      }
    }, 1000);
  });
};


const textFunc = async () => {
  const configureButton = await checkElementStatusAsync(
    "button:contains('Configure')",
    (element) => !element.is(":disabled"),
  );
  configureButton.click();
  await randomWait(300, 800);
}

window['textFunc'] = textFunc

const createGPTsFlow = async (
  tabId,
  gptInfo,
  options = {
    closeTab: true
  }
) => {
  const { title, intro, prompts, start_text, prompt, image_url } = gptInfo
  console.log("创建GPTs", gptInfo);

  // 先点击一下Configure按钮

  // 1. 点击Configure按钮
  await addLog(tabId, "检查:点击Configure按钮", "正在检查Configure按钮是否可点击", "running");
  const configureButton = await checkElementStatusAsync(
    "button:contains('Configure')",
    (element) => !element.is(":disabled"),
  );
  configureButton.click();
  await randomWait(300, 800);

  try {
    // 2. 填写名称
    await fillName(title);
    await addLog(tabId, "填写名称...", title, "running");

    // 3. 填写描述
    await fillDescription(intro);
    await addLog(tabId, "填写intro...", intro, "running");

    // 4. 填写介绍
    await fillIntroduction(prompt);
    await addLog(tabId, "填写prompt...", prompt, "running");

    await randomWait(300, 800);

    await waitForUrlChange("https://chat.openai.com/gpts/editor/g-*");


    await addLog(tabId, "跳转到gpt应用页面", "跳转到gpt应用页面", "running");
    const gptId = window.location.href.split('/').pop()
    console.log('当前的gptId', gptId)

    // // 点击 Save 按钮
    await addLog(
      tabId,
      "检查:点击Save按钮",
      "正在检查Save按钮是否可点击",
      "running",
    );
    const buttonElement = await checkElementStatusAsync(
      "button:contains('Save')",
      (element) => !element.is(":disabled"),
    );
    await randomWait(300, 800);
    buttonElement.click();
    await addLog(tabId, "点击Save按钮", "检查Confirm是否可以点击,检查Confirm是否可以点击", "running");

    await randomWait(300, 800);
    const confirmButton = await checkElementStatusAsync(
      "div:contains('Confirm')",
      (element) => !element.is(":disabled"),
    );
    await randomWait(300, 800);
    confirmButton.click();
    await addLog(
      tabId,
      "点击Confirm按钮,等待页面跳转",
      "已点击Confirm按钮,等待页面跳转",
      "running",
    );

    await addLog(tabId, "页面跳转到gpt应用页面，准备上传图片", "页面跳转到gpt应用页面，准备上传图片", "running");

    const imgInfo = await uploadImg({
      imageUrl: image_url,
      name: `${title}.png`
    })

    console.log('上传图片数据', imgInfo)

    await addLog(
      tabId,
      "上传图片完成，开始更新GPTs信息",
      "上传图片完成，上传图片完成，开始更新GPTs信息",
    );



    //获取当前的gpt信息
    const currentGPTInfo = await getGPTInfo(gptId)

    await updateGPTInfo({
      instructions: prompt,
      display: {
        name: title,
        description: intro,
        profile_pic_id: imgInfo?.file_id,
        profile_picture_url: imgInfo?.download_url,
        welcome_message: start_text,
        prompt_starters: prompts || [],
      },
      tools: currentGPTInfo?.tools || [],
      "files": [],
      "training_disabled": false
    }, gptId)

    // 获取最新的url
    const link = window.location.href;

    addLog(
      tabId,
      "更新GPTs信息完成，开始发布GPTs",
      "更新GPTs信息完成，开始发布GPTs",
    );
    await publishGPT(gptId)

    await addLog(
      tabId,
      `GPTs${gptId}创建完成`,
      "GPTs流程创建完成,即将关闭页面",
      "finished",
      { link }
    );

  } catch (error) {
    console.error("创建GPTs过程中发生错误:", error);
    await addLog(
      tabId,
      "错误" + error,
      "创建GPTs过程中发生错误: " + error.message,
      "error",
    );
  } finally {
    await storage.remove(tabId);
    await storage.remove(`page_${tabId}`)
    if (options.closeTab) {
      await sendToBackground({
        name: "closeTab",
        body: {
          tabId,
        },
        // extensionId: Browser.runtime.id,
      });
    }
  }
};

/**
   * 通用函数，定时检查元素的某个状态是否改变
   * @param {string} selector - 目标元素的选择器
   * @param {Function} statusCheck - 状态检查函数，返回布尔值
   */
const checkElementStatusAsync: any = async (selector, statusCheck) => {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const element = $(selector);
      if (statusCheck(element)) {
        console.log("目标状态已改变，可以执行操作");
        clearInterval(intervalId);
        try {
          resolve(element);
        } catch (error) {
          reject("执行操作时出错：" + error);
        }
      } else {
        console.log("目标状态未改变");
      }
    }, 1000);
  });
};


const uploadImg = async ({
  name = '编程入门1.png',
  imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJvEn_0UonJoouxIa4AEtcPnRVRyMmdfXx6A&usqp=CAU'
}) => {

  const authorization = await storage.getItem('Authorization')
  let fileId = null;
  let downloadUrl = null;
  let blob

  // 预创建url
  blob = await fetch(imageUrl, {
    headers: {
      // 设置跨域
      mode: 'no-cors'
    }
  }).then(response => response.blob()).catch(error => {
    console.error('抓图图片信息出错:', error.message);
  })

  if (!blob) return;


  await fetch("https://chat.openai.com/backend-api/files", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US",
      "authorization": `${authorization}`,
      "content-type": "application/json",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },

    body: JSON.stringify({
      "file_name": name,
      "file_size": blob?.size,
      "use_case": "profile_picture"
    }),
    credentials: "include"
  })
    .then(async response => {
      // 上传的url
      const { file_id, upload_url } = await response.json()
      // 请求upload_url
      fileId = file_id;
      console.log('打印预创建的url', upload_url, file_id)

      console.log('当前的url', window.location.href)

      await fetch(upload_url, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
          // "content-type": "image/png",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-ms-blob-type": "BlockBlob",
          "x-ms-version": "2020-04-08"
        },
        "referrer": "https://chat.openai.com/gpts/editor/g-hm6VLuE7f",
        "referrerPolicy": "strict-origin-when-cross-origin",
        body: blob,
        "method": "PUT",
        "mode": "cors",
        "credentials": "omit"
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error('上传失败');
          }
          console.log('上传的response', response.text())

          await fetch(`https://chat.openai.com/backend-api/files/${file_id}/uploaded`, {
            headers: {
              "authorization": `${authorization}`,
              "accept": "*/*",
              "accept-language": "en-US",
              "content-type": "application/json",
              "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              'referer': window.location.href,
              referrerPolicy: "strict-origin-when-cross-origin",
            },
            "method": "POST",
          }).then(response => response.json())
            .then(data => {
              console.log('uploaded', data, data.download_url)
              downloadUrl = data.download_url
              return

            })

        })
        .catch(error => console.error('上传出错:', error));

    })

  return {
    file_id: fileId,
    download_url: downloadUrl,
  }



}

const getGPTInfo = async (gptId) => {
  const authorization = await storage.getItem('Authorization')

  // API URL
  const apiUrl = `https://chat.openai.com/backend-api/gizmos/${gptId}`;

  console.log('获取的网站url', apiUrl)

  // 请求头
  const headers = {
    "accept": "*/*",
    "accept-language": "en-US",
    "authorization": `${authorization}`,
    "content-type": "application/json",
    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };

  // 请求体

  return fetch(apiUrl, {
    method: "GET",
    headers: headers,
    referrerPolicy: "strict-origin-when-cross-origin",
    mode: "cors",
    credentials: "include"
  })
    .then(async response => await response.json())
    .then(data => {
      console.log('获取当前的GPT数据成功:', data);
      return data;
    })
    .catch(error => {
      console.error('获取出错:', error);
    });
}


const updateGPTInfo = async (gptInfo, gptId) => {
  const authorization = await storage.getItem('Authorization')

  // API URL
  const apiUrl = `https://chat.openai.com/backend-api/gizmos?gizmo_id=${gptId}`;

  console.log('更新的网站url', apiUrl)

  // 请求头
  const headers = {
    "accept": "*/*",
    "accept-language": "en-US",
    "authorization": `${authorization}`,
    "content-type": "application/json",
    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };

  // 请求体
  const body = JSON.stringify(gptInfo);


  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body,
      referrerPolicy: "strict-origin-when-cross-origin",
      mode: "cors",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error('请求失败: ' + response.status);
    }

    const data = await response.json();
    console.log('更新成功:', data);
    return data;
  } catch (error) {
    console.error('更新出错:', error);
  }


};


const publishGPT = async (gptId) => {
  const authorization = await storage.getItem('Authorization')

  // API URL
  const apiUrl = `https://chat.openai.com/backend-api/gizmos/${gptId}/promote`;

  console.log('发布的网站url', apiUrl)

  return fetch(apiUrl, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US",
      "authorization": `${authorization}`,
      "content-type": "application/json",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    body: JSON.stringify({
      "sharing": {
        "recipient": "marketplace"
      },
      "categories": [
        "productivity"
      ]
    }),
    referrerPolicy: "strict-origin-when-cross-origin",
    mode: "cors",
    credentials: "include"
  })
    .then(async response => await response.json())
    .then(data => {
      console.log('发布成功:', data);
      return data;
    })
    .catch(error => {
      console.error('发布出错:', error);
    });

}




export {
  fillField,
  triggerInputEvent,
  fillName,
  fillDescription,
  fillIntroduction,
  randomWait,
  addLog,
  waitForUrlChange,
  createGPTsFlow,
  checkElementStatusAsync,
  uploadImg,
  publishGPT
}
