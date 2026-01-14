# edge-tts Voice ID 问题排查报告

## 1. 问题概述

本项目前端应用已更新以集成 `edge-tts` 服务。在集成过程中，发现即使前端代码能够正确获取并显示 `edge-tts` 服务提供的朗读者列表，并且将选择的朗读者ID（如“Eric”）正确地传递给服务，但所有生成的语音均使用相同的默认女性声音。

## 2. 问题排查过程

1.  **初始集成与API响应错误**：
    *   前端代码更新以调用 `http://localhost:3001/api/tts/voices` 和 `http://localhost:3001/api/tts/speak` 接口。
    *   首次尝试获取朗读者列表时遇到 `TypeError: voices.map is not a function` 错误，表明API响应格式不符合预期。
    *   通过分析 `edge-tts --list-voices` 的命令行输出和API响应日志，调整了 `ttsService.ts` 中的 `fetchAvailableVoices` 函数，使其能正确解析朗读者数据，并能正确获取朗读者列表。

2.  **语音生成时的500错误**：
    *   在成功获取朗读者列表后，尝试生成语音时遇到 `500 Internal Server Error`。
    *   通过简化 `generateSpeech` 函数中的请求体，移除 `rate`、`volume`、`pitch` 等可选参数，解决了500错误。

3.  **所有声音听起来都一样的问题**：
    *   尽管朗读者列表显示正常，并且可以通过UI选择不同的朗读者，但所有生成的语音都使用相同的默认女性声音。
    *   为了进一步诊断，在 `generateSpeech` 函数中添加了 `console.log` 来记录实际发送的 `voice.id`。
    *   用户反馈日志显示，正确的 `voice.id`（例如“Eric”）已被成功传递给 `edge-tts` 服务。

## 3. 结论

根据上述排查过程，前端代码已能正确地：
*   从 `edge-tts` 服务获取朗读者列表。
*   将选择的朗读者ID正确传递给 `edge-tts` 服务。

然而，`edge-tts` 服务本身未能根据接收到的 `voice.id` 正确生成对应的声音，而是始终默认使用一个女性声音。

**建议**：

由于此问题源于 `edge-tts` 服务端，建议将此问题及相关日志信息反馈给 `edge-tts` 服务的提供商，以便他们进行调查和修复。
