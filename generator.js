function updateCard(content) {
    
    try {
        // 确保content是对象
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            } catch (e) {
                // 创建一个错误对象
                content = {
                    questionTitle: '数据格式错误',
                    authorName: '解析失败',
                    authorDesc: '请重新提取内容',
                    answerContent: '无法解析提取的内容，请返回扩展重新提取。',
                    likeCount: '0'
                };
            }
        }
        
        // 设置默认值
        const questionTitle = content?.questionTitle || '未找到问题标题';
        const authorName = content?.authorName || '知乎用户';
        const authorDesc = content?.authorDesc || '分享知识、经验和见解';
        const answerContent = content?.answerContent || '未找到回答内容';
        const likeCount = content?.likeCount || '0';

        // 更新显示
        document.getElementById('displayQuestionTitle').textContent = questionTitle;
        document.getElementById('displayAuthorName').textContent = authorName;
        document.getElementById('displayAuthorDesc').textContent = authorDesc;
        document.getElementById('displayAnswerContent').textContent = answerContent;
        document.getElementById('displayLikes').textContent = `${likeCount} 赞同`;
        
        // 更新头像
        const avatar = document.getElementById('avatar');
        avatar.textContent = (authorName && authorName.length > 0) ? authorName.charAt(0) : '知';
        

    } catch (error) {
        // 显示错误信息
        document.getElementById('displayQuestionTitle').textContent = '更新卡片失败';
        document.getElementById('displayAuthorName').textContent = '错误';
        document.getElementById('displayAuthorDesc').textContent = error.message;
        document.getElementById('displayAnswerContent').textContent = '更新卡片时发生错误，请重新提取内容。';
        document.getElementById('displayLikes').textContent = '0 赞同';
        
        // 更新头像
        const avatar = document.getElementById('avatar');
        avatar.textContent = '错';
    }
}

function isChromeExtension() {
    return typeof chrome !== 'undefined' && 
           chrome.storage && 
           chrome.storage.local && 
           typeof chrome.storage.local.get === 'function';
}

function loadFromUrlParams() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve(false);
        }, 5000);
        
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const dataParam = urlParams.get('data');
            
            if (dataParam) {
                try {
                    const content = JSON.parse(decodeURIComponent(dataParam));
                    
                    // 更新卡片
                    updateCard(content);
                    
                    // 显示自动加载提示
                    document.getElementById('autoLoadNotice').style.display = 'block';
                    
                    clearTimeout(timeout);
                    resolve(true);
                    return;
                } catch (parseError) {
                    // 尝试直接使用数据
                    try {
                        const directData = decodeURIComponent(dataParam);
                        if (directData.includes('questionTitle')) {
                            // 尝试提取数据
                            const extractedData = {};
                            const matches = {
                                questionTitle: /"questionTitle":"([^"]*)"/,
                                authorName: /"authorName":"([^"]*)"/,
                                authorDesc: /"authorDesc":"([^"]*)"/,
                                answerContent: /"answerContent":"([^"]*)"/,
                                likeCount: /"likeCount":"([^"]*)"/
                            };
                            
                            for (const [key, regex] of Object.entries(matches)) {
                                const match = directData.match(regex);
                                if (match && match[1]) {
                                    extractedData[key] = match[1];
                                }
                            }
                            
                            if (Object.keys(extractedData).length > 0) {
                                updateCard(extractedData);
                                document.getElementById('autoLoadNotice').style.display = 'block';
                                clearTimeout(timeout);
                                resolve(true);
                                return;
                            }
                        }
                    } catch (e) {
                        // 解析失败，忽略
                    }
                }
            }
        } catch (error) {
            // Chrome存储加载失败，忽略
        }
        
        clearTimeout(timeout);
        resolve(false);
    });
}

function loadFromChromeStorage() {
    return new Promise((resolve) => {
        if (!isChromeExtension()) {
            resolve(false);
            return;
        }
        
        try {
            chrome.storage.local.get(['zhihuContent'], function(result) {
                if (result.zhihuContent) {
                    const content = result.zhihuContent;
                    
                    try {
                        // 更新卡片
                        updateCard(content);
                        
                        // 显示自动加载提示
                        document.getElementById('autoLoadNotice').style.display = 'block';
                        
                        resolve(true);
                        return;
                    } catch (updateError) {
                        document.getElementById('autoLoadNotice').textContent = '加载内容时出错，请重新提取。';
                        document.getElementById('autoLoadNotice').style.display = 'block';
                    }
                } else {
                    document.getElementById('autoLoadNotice').textContent = '未找到已提取的内容，请先使用扩展提取知乎回答。';
                    document.getElementById('autoLoadNotice').style.display = 'block';
                }
                
                resolve(false);
            });
        } catch (error) {
            resolve(false);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const autoLoadNotice = document.getElementById('autoLoadNotice');
    if (autoLoadNotice) {
        autoLoadNotice.textContent = '正在加载内容...';
        autoLoadNotice.style.display = 'block';
    }
    updateCard({
        questionTitle: '加载中...',
        authorName: '知乎用户',
        authorDesc: '分享知识、经验和见解',
        answerContent: '正在加载内容，请稍候...',
        likeCount: '0',
        commentCount: '0'
    });

    let loadedSuccessfully = false;

    try {
        if (await loadFromUrlParams()) {
            loadedSuccessfully = true;
        }
    } catch (error) {
        // URL参数加载失败，忽略
    }

    if (!loadedSuccessfully && isChromeExtension()) {
        try {
            if (await loadFromChromeStorage()) {
                loadedSuccessfully = true;
            }
        } catch (error) {
            // Chrome存储加载失败，忽略
        }
    }

    if (loadedSuccessfully) {
         if (autoLoadNotice && autoLoadNotice.textContent === '正在加载内容...') {
            autoLoadNotice.style.display = 'none'; 
        }
    } else {
        updateCard({
            questionTitle: '未找到内容',
            authorName: '知乎用户',
            authorDesc: '请使用浏览器扩展提取知乎回答内容',
            answerContent: '没有找到可用的内容。请确保：\n1. 已安装并启用浏览器扩展\n2. 在知乎回答页面使用扩展提取内容\n3. 然后打开此页面查看卡片',
            likeCount: '0'
        });
        
        if (autoLoadNotice) {
            autoLoadNotice.textContent = '未找到内容，请先使用扩展提取知乎回答。';
            autoLoadNotice.style.display = 'block';
        }
    }
});

// 保存卡片功能
function saveCardAsImage() {
    const saveButton = document.getElementById('saveButton');
    const card = document.getElementById('zhihuCard');
    
    if (!card) {
        alert('未找到卡片元素');
        return;
    }
    
    // 禁用按钮并显示加载状态
    saveButton.disabled = true;
    saveButton.textContent = '生成中...';
    
    // 添加超时保护，防止卡住
    const timeout = setTimeout(() => {
        fallbackSaveMethod();
    }, 5000); // 5秒超时
    
    try {
        // 直接使用备用方法，因为SVG转图片在某些浏览器中有限制
        clearTimeout(timeout);
        fallbackSaveMethod();
        
    } catch (error) {
        clearTimeout(timeout);
        fallbackSaveMethod();
    }
}

// 保存方法：提供多种保存选项
function fallbackSaveMethod() {
    const saveButton = document.getElementById('saveButton');
    const card = document.getElementById('zhihuCard');
    
    try {
        // 询问用户保存方式
        const choice = confirm('选择保存方式：\n\n确定 - 保存为HTML文件（推荐）\n取消 - 复制卡片内容到剪贴板');
        
        if (choice) {
            // 保存为HTML文件
            const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>知乎回答卡片</title>
    <style>
        ${document.querySelector('style').textContent}
        body { padding: 20px; background: white; }
        .container { max-width: 600px; margin: 0 auto; }
        .save-button { display: none; }
    </style>
</head>
<body>
    <div class="container">
        ${card.outerHTML}
    </div>
    <p style="text-align: center; color: #666; margin-top: 20px; font-size: 14px;">
        提示：您可以使用浏览器的截图功能或打印功能保存此卡片
    </p>
</body>
</html>`;
            
            const blob = new Blob([htmlContent], {type: 'text/html;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `知乎回答卡片_${new Date().getTime()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('✅ HTML文件已保存！\n\n使用方法：\n1. 打开下载的HTML文件\n2. 使用浏览器截图或打印功能保存为图片');
        } else {
            // 复制内容到剪贴板
            const textContent = `${document.getElementById('displayQuestionTitle').textContent}\n\n${document.getElementById('displayAnswerContent').textContent}\n\n作者：${document.getElementById('displayAuthorName').textContent}\n${document.getElementById('displayAuthorDesc').textContent}\n${document.getElementById('displayLikes').textContent}`;
            
            navigator.clipboard.writeText(textContent).then(() => {
                alert('✅ 卡片内容已复制到剪贴板！');
            }).catch(() => {
                // 如果剪贴板API失败，显示内容让用户手动复制
                const textarea = document.createElement('textarea');
                textarea.value = textContent;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✅ 卡片内容已复制到剪贴板！');
            });
        }
        
    } catch (error) {
        alert('❌ 保存失败，请尝试手动截图保存。\n\n建议：\n1. 使用浏览器的截图功能\n2. 或按F12打开开发者工具，右键卡片选择"截图节点"');
    } finally {
        // 恢复按钮状态
        saveButton.disabled = false;
        saveButton.textContent = '保存卡片';
    }
}

// 添加保存按钮事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveCardAsImage);
    }
});