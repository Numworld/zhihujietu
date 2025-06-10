# 知乎回答卡片生成器

一个Chrome浏览器扩展，可以一键提取知乎回答内容并生成精美的分享卡片。

## 功能特性

- 🎯 **智能提取**：自动识别知乎回答页面，提取问题标题、回答者信息和回答内容
- 🎨 **精美卡片**：生成具有知乎风格的精美回答卡片
- 📱 **响应式设计**：支持不同尺寸的卡片生成
- 💾 **本地存储**：提取的内容会自动保存，方便重复使用
- 🖼️ **图片导出**：支持将生成的卡片导出为PNG图片
- 🔄 **实时预览**：提取内容后可实时预览效果

## 安装方法

1. 下载此项目到本地的项目文件夹

2. 打开Chrome浏览器，进入扩展管理页面
   - 在地址栏输入 `chrome://extensions/`
   - 或者点击右上角菜单 → 更多工具 → 扩展程序

3. 开启「开发者模式」（页面右上角的开关）

4. 点击「加载已解压的扩展程序」，

5. 选择项目文件夹

6. 扩展安装完成！

## 使用方法

1. **打开知乎回答页面**
   - 访问任意知乎问题的具体回答页面
   - 确保URL格式为：`https://www.zhihu.com/question/*/answer/*` 或 `https://www.zhihu.com/answer/*`

2. **提取内容**
   - 点击浏览器工具栏中的扩展图标
   - 点击「提取当前回答」按钮
   - 等待内容提取完成

3. **生成卡片**
   - 提取成功后，点击「生成卡片」按钮
   - 在新打开的页面中查看生成的卡片

4. **导出图片**
   - 在卡片生成页面，点击「下载卡片」按钮
   - 卡片将以PNG格式保存到本地

## 项目结构

```
zhihujietu-extension/
├── manifest.json          # 扩展配置文件
├── popup.html            # 扩展弹窗页面
├── popup.js              # 弹窗逻辑
├── content.js            # 内容脚本，负责提取页面内容
├── generator.html        # 卡片生成页面
├── generator.js          # 卡片生成逻辑
├── icon.svg              # 扩展图标
├── LICENSE               # 许可证文件
├── .gitignore            # Git忽略文件
└── README.md             # 项目说明文档
```

## 技术实现

- **Manifest V3**：使用最新的Chrome扩展API
- **Content Scripts**：在知乎页面中注入脚本提取内容
- **Storage API**：本地存储提取的内容
- **HTML5 Canvas**：生成和导出卡片图片
- **CSS3**：现代化的界面设计

## 支持的页面

- 知乎问题回答页面：`https://www.zhihu.com/question/*/answer/*`
- 知乎回答直链页面：`https://www.zhihu.com/answer/*`

## 提取的内容

- ✅ 问题标题
- ✅ 回答者姓名
- ✅ 回答者描述/签名
- ✅ 回答内容（纯文本，自动过滤图片和链接）
- ✅ 点赞数

## 开发说明

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/username/zhihujietu-extension.git
cd zhihujietu-extension
```

2. 在Chrome中加载扩展（参考安装方法）

3. 修改代码后，在扩展管理页面点击刷新按钮重新加载

### 文件说明

- `manifest.json`：扩展的配置文件，定义权限、脚本等
- `popup.html/js`：扩展图标点击后显示的弹窗
- `content.js`：注入到知乎页面的脚本，负责内容提取
- `generator.html/js`：卡片生成和预览页面

## 常见问题

**Q: 为什么提取不到内容？**
A: 请确保：
- 当前页面是知乎的回答页面
- 页面已完全加载
- 没有被其他扩展或脚本干扰

**Q: 生成的卡片样式可以自定义吗？**
A: 目前版本提供固定的知乎风格样式，后续版本会考虑添加自定义选项。

**Q: 支持其他网站吗？**
A: 目前只支持知乎，后续可能会扩展到其他问答平台。

## 更新日志

### v1.0.0
- 🎉 首次发布
- ✨ 支持知乎回答内容提取
- ✨ 支持生成精美分享卡片
- ✨ 支持卡片图片导出

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue 反馈问题和建议

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
