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