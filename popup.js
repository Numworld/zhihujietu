// 获取页面元素
const statusDiv = document.getElementById('status');
const statusTextDiv = document.getElementById('statusText');
const extractBtn = document.getElementById('extractBtn');
const generateBtn = document.getElementById('openGeneratorBtn');
const previewDiv = document.getElementById('contentPreview');
const viewContentBtn = document.getElementById('viewContentBtn');
const clearBtn = document.getElementById('clearBtn');

// 绑定事件
extractBtn.addEventListener('click', extractContent);
generateBtn.addEventListener('click', generateCard);
if (viewContentBtn) viewContentBtn.addEventListener('click', togglePreview);
if (clearBtn) clearBtn.addEventListener('click', clearContent);

// 检查当前页面是否为知乎回答页面
function checkCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        if (!currentTab.url.includes('zhihu.com')) {
            statusDiv.className = 'status error';
            statusTextDiv.textContent = '❌ 请在知乎回答页面使用此扩展';
            extractBtn.disabled = true;
            return;
        }
        
        // 检查是否为回答页面
        chrome.tabs.sendMessage(currentTab.id, {action: 'checkPage'}, function(response) {
            if (chrome.runtime.lastError) {
                statusDiv.className = 'status error';
                statusTextDiv.textContent = '❌ 页面未完全加载，请刷新后重试';
                extractBtn.disabled = true;
                return;
            }
            
            if (response && response.isZhihuAnswer) {
                statusDiv.className = 'status success';
                statusTextDiv.textContent = '✅ 检测到知乎回答页面，可以提取内容';
                extractBtn.disabled = false;
            } else {
                statusDiv.className = 'status warning';
                statusTextDiv.textContent = '⚠️ 请打开具体的知乎回答页面';
                extractBtn.disabled = true;
            }
        });
    });
}

// 提取内容
function extractContent() {
    statusDiv.className = 'status';
    statusTextDiv.innerHTML = '⏳ 正在提取内容...';
    extractBtn.disabled = true;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        chrome.tabs.sendMessage(currentTab.id, {action: 'extractContent'}, function(response) {
            if (chrome.runtime.lastError) {
                statusDiv.className = 'status error';
                statusTextDiv.textContent = '❌ 提取失败，请刷新页面后重试';
                extractBtn.disabled = false;
                return;
            }
            
            if (response && !response.error) {
                // 保存到本地存储
                chrome.storage.local.set({zhihuContent: response}, function() {
                    statusDiv.className = 'status success';
                    statusTextDiv.textContent = '✅ 内容提取成功！';
                    generateBtn.disabled = false;
                    
                    // 显示预览和相关按钮
                    showPreview(response);
                    if (viewContentBtn) viewContentBtn.classList.remove('hidden');
                    if (clearBtn) clearBtn.classList.remove('hidden');
                });
            } else {
                statusDiv.className = 'status error';
                statusTextDiv.textContent = `❌ ${response?.error || '提取失败'}`;
            }
            
            extractBtn.disabled = false;
        });
    });
}

// 显示预览
function showPreview(content) {
    document.getElementById('previewTitle').textContent = content.questionTitle || '未获取到标题';
    document.getElementById('previewAuthor').textContent = `${content.authorName || '未知'} - ${content.authorDesc || '无描述'}`;
    document.getElementById('previewContent').textContent = content.answerContent 
        ? (content.answerContent.length > 100 
            ? content.answerContent.substring(0, 100) + '...' 
            : content.answerContent)
        : '未获取到内容';
    document.getElementById('previewLikes').textContent = content.likeCount || '0';
    
    previewDiv.classList.remove('hidden');
}

// 生成卡片
function generateCard() {
    chrome.storage.local.get(['zhihuContent'], function(result) {
        if (result.zhihuContent) {
            // 打开生成器页面
            const generatorUrl = chrome.runtime.getURL('generator.html');
            chrome.tabs.create({url: generatorUrl});
        } else {
            statusDiv.innerHTML = '<span class="error">❌ 请先提取内容</span>';
        }
    });
}

// 切换预览显示
function togglePreview() {
    previewDiv.classList.toggle('hidden');
    if (viewContentBtn) {
        viewContentBtn.textContent = previewDiv.classList.contains('hidden') 
            ? '👀 查看提取的内容' 
            : '🙈 隐藏内容预览';
    }
}

// 清除存储的内容
function clearContent() {
    chrome.storage.local.remove(['zhihuContent'], function() {
        if (viewContentBtn) viewContentBtn.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
        previewDiv.classList.add('hidden');
        
        statusDiv.className = 'status success';
        statusTextDiv.textContent = '✅ 已清除存储的内容';
        
        generateBtn.disabled = true;
    });
}

// 页面加载时检查当前页面
document.addEventListener('DOMContentLoaded', function() {
    // 先检查是否有已保存的内容
    chrome.storage.local.get(['zhihuContent'], function(result) {
        if (result.zhihuContent) {
            generateBtn.disabled = false;
            showPreview(result.zhihuContent);
            if (viewContentBtn) viewContentBtn.classList.remove('hidden');
            if (clearBtn) clearBtn.classList.remove('hidden');
        }
    });
    
    // 然后检查当前页面
    checkCurrentPage();
});