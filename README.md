# SketchAvatar 集成指南 (Integration Guide)

`SketchAvatar` 是一个独立的、可重用的 React 组件，用于在您的项目中快速集成一个可爱的简笔画风格的数字人。它封装了所有视觉逻辑，包括面部表情、模拟口型动画和头部视差效果。

## 特点 (Features)

*   **简笔画风格**: 独特的手绘艺术风格。
*   **情感表达**: 通过 `emotion` prop 控制多种面部表情。
*   **口型同步**: 通过 `isSpeaking` prop 触发模拟的口型动画。
*   **头部视差**: 头部会跟随用户的鼠标移动，创造出自然的凝视效果。
*   **零依赖**: 除了 `react` 和 `react-dom`，没有其他外部依赖。
*   **易于集成**: 只需两个 props 即可完全控制，轻松对接任何大语言模型。

## 快速开始 (Quick Start)

### 1. 复制组件文件

将 `components/SketchAvatar.tsx` 文件复制到您项目的组件目录中（例如 `src/components/`)。

### 2. 引入组件

在您想要使用数字人的父组件中，像这样导入 `SketchAvatar`：

```javascript
import React from 'react';
import SketchAvatar from './components/SketchAvatar'; // 路径可能需要根据您的项目结构调整
```

### 3. 添加必要的 CSS 动画

为了使数字人具有呼吸动画效果，请将以下 CSS 添加到您的全局样式文件中：

```css
@keyframes breathe {
  0% { transform: scaleY(1) translateY(0px); }
  50% { transform: scaleY(1.02) translateY(-2px); }
  100% { transform: scaleY(1) translateY(0px); }
}

.animate-breathe {
    animation: breathe 3s ease-in-out infinite;
    transform-origin: bottom;
}
```

## 使用方法 (Usage)

`SketchAvatar` 组件通过两个简单的 props 进行控制：

| Prop         | 类型 (Type) | 描述 (Description)                                                                                             |
|--------------|-------------|----------------------------------------------------------------------------------------------------------------|
| `emotion`    | `string`    | 控制数字人的面部表情。必须是预设的情感之一。                                                                     |
| `isSpeaking` | `boolean`   | 控制数字人是否正在“说话”。当为 `true` 时，会触发模拟的口型动画；为 `false` 时，嘴巴会根据 `emotion` 显示静态表情。 |

### 可用的情感 (Available Emotions)

`emotion` prop 接受以下字符串值：

*   `'neutral'` (默认)
*   `'happy'`
*   `'surprised'`
*   `'confused'`
*   `'angry'`
*   `'shy'`
*   `'sad'`
*   `'helpless'`
*   `'excited'`
*   `'focused'`

### 示例代码 (Example)

这是一个如何在父组件中使用 `SketchAvatar` 的基本示例。

```javascript
import React, { useState, useEffect } from 'react';
import SketchAvatar from './components/SketchAvatar';

function MyLLMApp() {
  const [llmReply, setLlmReply] = useState("你好！我是 SketchBot。");
  const [emotion, setEmotion] = useState('happy');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 模拟从 LLM 获取数据并播放语音
  const handlePlay = () => {
    // 1. 从你的 LLM API 获取回复和情感
    // const { reply, emotion } = await getLlmResponse("用户的输入");
    // setLlmReply(reply);
    // setEmotion(emotion);

    // 2. 使用语音合成 (TTS) 服务播放回复
    const utterance = new SpeechSynthesisUtterance(llmReply);
    
    // 3. 同步 Avatar 状态
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };
  
  // 初始播放欢迎语
  useEffect(() => {
    // 在组件加载后延迟一点播放，确保语音系统准备就绪
    setTimeout(handlePlay, 500);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '300px', height: '300px' }}>
        <SketchAvatar emotion={emotion} isSpeaking={isSpeaking} />
      </div>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>{llmReply}</p>
      <button onClick={handlePlay} style={{ marginTop: '10px', padding: '10px 20px' }}>
        再次播放
      </button>
    </div>
  );
}

export default MyLLMApp;
```

在这个例子中：
1.  我们使用 `useState` 来管理 `emotion` 和 `isSpeaking` 状态。
2.  当 `handlePlay` 函数被调用时，我们模拟了与 LLM 和语音合成服务的交互。
3.  通过语音合成 API (`SpeechSynthesisUtterance`) 的 `onstart` 和 `onend` 事件，我们可以精确地将 `isSpeaking` 状态与音频的播放同步。
4.  这些状态被直接传递给 `SketchAvatar` 组件，从而驱动其视觉表现。
