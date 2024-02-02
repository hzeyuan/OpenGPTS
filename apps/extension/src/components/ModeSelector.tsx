import React, { useState } from 'react';
import { Radio, Space, Card, Input, Switch, message } from 'antd';
import { Storage } from "@plasmohq/storage"
import { useStorage } from '@plasmohq/storage/hook';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from "use-debounce";
import { DEFAULT_CONFIG } from '@opengpts/core/constant';


const ModeSelector = () => {
  const { t, i18n } = useTranslation();

  const [generalConfig, setGeneralConfig] = useStorage({
    key: "opengptsConfig",
    instance: new Storage({
      area: "local"
    }),
  }, DEFAULT_CONFIG)

  const checkApiKey = useDebouncedCallback((e) => {
    const key = e.target.value;
    setGeneralConfig({
      ...generalConfig,
      apiKey: key
    })
  })

  const [showApiKey, setShowApiKey] = useState(generalConfig.isProxy);



  const handleChangeBaseUrl = (e) => {
    setGeneralConfig({
      ...generalConfig,
      baseUrl: e.target.value
    })
  }

  const handleChangeMode = (e) => {
    setGeneralConfig(
      {
        ...generalConfig,
        mode: e.target.value
      }
    )
  }


  // 处理 Switch 状态变化
  const handleSwitchChange = (checked) => {
    setShowApiKey(checked);
    setGeneralConfig({
      ...generalConfig,
      isProxy: checked
    })
  };

  return (
    <Radio.Group value={generalConfig.mode} onChange={handleChangeMode}>
      <Space direction="vertical">
        <Radio value={'OpenGPTs'}>
          <div className='text-base font-bold'>{t('mode.title.opengpts')}</div>
          <span className='text-sm font-semibold'>{t('mode.desc.opengpts')}</span>
        </Radio>
        <Radio value={'ChatGPT webapp'}>
          <div className='text-base font-bold'>{t('mode.title.web')}</div>
          <span className='text-sm font-semibold'>{t('mode.desc.web')}</span></Radio>
        <Radio value={'OpenAI API'}>
          <div className='text-base font-bold'>{t('mode.title.apikey')}</div>
          <span className='text-sm font-semibold'>{t('mode.desc.apikey')}</span>
          {generalConfig.mode === 'OpenAI API' && (
            <Card className="my-1">
              <div className="tip text-[12px]">
                <span className="opacity-50">{t('mode.apikeyPolicy')}</span>
                <span className="text-red-500 "> {t('mode.useGPT4Tip')}</span>
              </div>
              <Input.Password value={generalConfig.apiKey} onChange={checkApiKey} className="my-2" addonBefore={'APIKey'} type='password' />
              <span className='pr-2 text-sm'>{t('mode.useProxy')}</span><Switch value={generalConfig.isProxy} size="small" onChange={handleSwitchChange} />
              {generalConfig.isProxy && (
                <Input value={generalConfig.baseUrl} onChange={handleChangeBaseUrl} className="my-2" addonBefore={'URL'} />
              )}
            </Card>
          )}
        </Radio>
      </Space>
    </Radio.Group>
  );
};

export default ModeSelector;
