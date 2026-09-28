# Phase 8C — Connected Studies Layout Refinement

## 修改

采用方案 A：将 FIG-LOW-02 从 LowAlt-MD 左栏移至双栏介绍之后，形成跨双栏的证据模块。细线与自适应间距区分概念介绍和证据图件；图片保持原始比例，图注限制行长。

移动端顺序为 LowAlt-MD、EM-Trace、证据图件及来源。FIG-LOW-02 的归属、图注、原图链接、数字、证据边界及项目内容均保持原样。所有样式仅作用于首页新增的 study-evidence 容器。

代码文件：src/pages/index.astro。新增 3 条局部 CSS 规则；无新增 JavaScript、依赖、图片或网络请求。

## 截图与预览

截图位于本机 .screenshots/phase8c/（该目录按项目原规则不纳入 Git）：

| 视口 | 修改前 | 修改后 |
| --- | --- | --- |
| 桌面 1440px | before-1440.png | after-1440.png |
| 手机 390px | before-390.png | after-390.png |

另有 after-320.png、after-768.png、after-1024.png。截图仅隐藏固定导航以免覆盖长区域截图，页面导航代码未更改。

本地交互预览：http://127.0.0.1:4321/#studies-heading（需要预览服务运行）。

## 验证

- Chromium：320、390、768、1024、1440px 的页面横向溢出均为 0px。
- 五个宽度下，证据模块与内容区等宽，位于双栏内容之后，图像比例与原始文件一致。
- 五个宽度下，键盘打开图件查看器、Escape 关闭、焦点返回图件链接均通过。
- 桌面与手机截图已查看；原图路径与修改前一致。
- 静态生产构建、科研内容及图件 hash 校验、源文件与构建产物隐私校验、完整发布内容检查通过。
- Impeccable 变更文件扫描无发现。
- npm run typecheck 未通过：原有未跟踪文件 patch_intro.cjs 第 4、33 行存在语法错误。另有 ResearchMap.astro 未使用变量 i 的既有提示。修改的首页文件无诊断错误。本轮未修改这些文件。

## Git 与范围

本轮仅本地提交，未 push、未部署。提交信息：`style(site): balance connected studies evidence layout`。本报告随代码一同提交，可用该提交查看准确 hash。
