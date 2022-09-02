import { jsx } from '@keystone-ui/core'
import { useEffect } from 'react';
import { css } from '@keystone-ui/core'
import React from 'react';

// 自定义logo组件
function CustomLogo() {

  useEffect(() => {
    const styleTag = document.createElement('link'); 
    styleTag.rel = 'stylesheet';
    styleTag.crossOrigin = 'anonymous'
    styleTag.href = 'https://cdnjs.cloudflare.com/ajax/libs/antd/4.22.7/antd.min.css';
    document.body.appendChild(styleTag);
  }, []);

  return (
    <a href="/" style={{ textDecoration: 'none' }}>
      <style dangerouslySetInnerHTML={{ __html: `
      h3 {
        font-weight: bold !important;
        font-size: 20px !important;
      }
      ` }}></style>
      <h3
        style={{
          color: '#1890ff',
          fontSize: 20,
          fontWeight: 700
        }}
      >
        Logo
      </h3>
    </a>
  )
}

export const components = {
  Logo: CustomLogo,
}
