// 提取知乎回答内容的主函数
function extractZhihuContent() {
    try {
        // 等待页面加载完成
        if (document.readyState !== 'complete') {
            return null;
        }

        // 提取问题标题
        const questionTitle = 
            document.querySelector('h1.QuestionHeader-title')?.textContent?.trim() ||
            document.querySelector('.QuestionHeader-main .QuestionHeader-title')?.textContent?.trim() ||
            document.querySelector('h1')?.textContent?.trim() ||
            '未找到问题标题';

        // 提取回答者信息
        const authorName = 
            document.querySelector('.AuthorInfo-name a')?.textContent?.trim() ||
            document.querySelector('.AuthorInfo-name')?.textContent?.trim() ||
            document.querySelector('.UserLink-link')?.textContent?.trim() ||
            '匿名用户';

        // 提取回答者描述
        const authorDesc = 
            document.querySelector('.AuthorInfo-detail')?.textContent?.trim() ||
            document.querySelector('.AuthorInfo-badge')?.textContent?.trim() ||
            '知乎用户';

        // 提取回答内容
        let answerContent = '';
        const contentElement = 
            document.querySelector('.RichContent-inner') ||
            document.querySelector('.RichText') ||
            document.querySelector('.Post-RichText');
        
        if (contentElement) {
            // 移除图片、链接等元素，保留文本和换行
            const clonedElement = contentElement.cloneNode(true);
            const images = clonedElement.querySelectorAll('img, figure, .RichContent-image');
            const links = clonedElement.querySelectorAll('a');
            
            images.forEach(img => img.remove());
            links.forEach(link => {
                const text = document.createTextNode(link.textContent);
                link.parentNode.replaceChild(text, link);
            });
            
            // 更好地保留段落结构
            const paragraphs = clonedElement.querySelectorAll('p');
            let textParts = [];
            
            if (paragraphs.length > 0) {
                // 如果有段落标签，按段落提取
                paragraphs.forEach(p => {
                    const text = p.textContent.trim();
                    if (text) {
                        textParts.push(text);
                    }
                });
                answerContent = textParts.join('\n\n');
            } else {
                // 如果没有段落标签，尝试按div或其他块级元素提取
                const blocks = clonedElement.querySelectorAll('div, section, article');
                if (blocks.length > 0) {
                    blocks.forEach(block => {
                        const text = block.textContent.trim();
                        if (text && !text.includes('\n')) {
                            textParts.push(text);
                        }
                    });
                    if (textParts.length > 0) {
                        answerContent = textParts.join('\n\n');
                    } else {
                        answerContent = clonedElement.textContent?.trim() || '';
                    }
                } else {
                    answerContent = clonedElement.textContent?.trim() || '';
                }
            }
        }

        // 限制内容长度
        if (answerContent.length > 500) {
            answerContent = answerContent.substring(0, 500) + '...';
        }

        // 提取点赞数
        let likeCount = '0';
        const likeElement = 
            document.querySelector('.VoteButton--up .Button-label') ||
            document.querySelector('.VoteButton--up') ||
            document.querySelector('[aria-label*="赞同"]');
        
        if (likeElement) {
            const likeText = likeElement.textContent || likeElement.getAttribute('aria-label') || '';
            const numbers = likeText.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                likeCount = numbers[0];
            }
        }


        const extractedData = {
            questionTitle,
            authorName,
            authorDesc,
            answerContent,
            likeCount,
            url: window.location.href,
            extractTime: new Date().toISOString()
        };


        return extractedData;

    } catch (error) {

        return {
            error: '内容提取失败: ' + error.message,
            questionTitle: '提取失败',
            authorName: '未知',
            authorDesc: '提取失败',
            answerContent: '无法提取内容，请手动复制',
            likeCount: '0'
        };
    }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        // 延迟一下确保页面完全加载
        setTimeout(() => {
            const content = extractZhihuContent();
            sendResponse(content);
        }, 500);
        
        // 返回true表示异步响应
        return true;
    }
    
    if (request.action === 'checkPage') {
        const isZhihuAnswer = /zhihu\.com\/(question\/.*\/answer\/|answer\/)/.test(window.location.href);
        sendResponse({ isZhihuAnswer });
    }
});