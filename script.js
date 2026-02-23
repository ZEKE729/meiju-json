// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 全局变量
    let appData = [];                // 从 data.json 加载的列表数据
    let currentItem = null;          // 当前查看的详情条目
    let originalJsonContent = '';    // 当前详情原始内容（用于重置）
    
    // 获取 DOM 元素
    const homeView = document.getElementById('home-view');
    const feedbackView = document.getElementById('feedback-view');
    const aboutView = document.getElementById('about-view');
    const detailView = document.getElementById('detail-view');
    const listContainer = document.getElementById('list-container');
    const detailName = document.getElementById('detail-name');
    const downloadBtn = document.getElementById('download-btn');
    const jsonCodeElement = document.getElementById('json-code');
    const homeTitle = document.getElementById('home-title');
    const feedbackBtn = document.getElementById('feedback-btn');
    const aboutBtn = document.getElementById('about-btn');
    
    // 管理员工具元素
    const toggleAdmin = document.getElementById('toggle-admin');
    const adminPanel = document.getElementById('admin-panel');
    const uploadJson = document.getElementById('upload-json');
    const pasteJson = document.getElementById('paste-json');
    const previewPasted = document.getElementById('preview-pasted');
    const resetOriginal = document.getElementById('reset-original');

    // 初始化：加载 data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            appData = data;
            renderList();  // 渲染首页列表
        })
        .catch(err => {
            console.error('加载 data.json 失败', err);
            listContainer.innerHTML = '<p style="color:red;">列表加载失败，请刷新重试。</p>';
        });

    // 渲染列表
    function renderList() {
        listContainer.innerHTML = '';
        appData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.dataset.id = item.id;
            div.innerHTML = `<div class="item-name">${item.name}</div>
                              <div class="item-author">${item.author}</div>`;
            div.addEventListener('click', () => showDetail(item));
            listContainer.appendChild(div);
        });
    }

    // 视图切换函数
    function showView(viewName) {
        // 隐藏所有视图
        [homeView, feedbackView, aboutView, detailView].forEach(v => v.classList.remove('active'));
        if (viewName === 'home') homeView.classList.add('active');
        else if (viewName === 'feedback') feedbackView.classList.add('active');
        else if (viewName === 'about') aboutView.classList.add('active');
        else if (viewName === 'detail') detailView.classList.add('active');
    }

    // 点击标题返回首页
    homeTitle.addEventListener('click', () => {
        showView('home');
    });

    // 电话图标 -> 反馈页
    feedbackBtn.addEventListener('click', () => {
        showView('feedback');
    });

    // 关于图标 -> 关于页
    aboutBtn.addEventListener('click', () => {
        showView('about');
    });

    // 显示详情页
    async function showDetail(item) {
        currentItem = item;
        detailName.textContent = item.name;
        // 设置下载链接
        downloadBtn.href = `files/${item.file}`;
        downloadBtn.download = item.file;  // 建议下载时使用原文件名
        
        // 加载 JSON 文件内容
        try {
            const response = await fetch(`files/${item.file}`);
            const jsonText = await response.text();
            originalJsonContent = jsonText;
            displayJson(jsonText);
            showView('detail');
        } catch (error) {
            console.error('加载 JSON 失败', error);
            jsonCodeElement.textContent = '// 文件加载失败，请检查文件是否存在';
            showView('detail');
        }
    }

    // 显示 JSON 到代码框并高亮
    function displayJson(content) {
        jsonCodeElement.textContent = content;
        // 使用 highlight.js 高亮
        if (window.hljs) {
            hljs.highlightElement(jsonCodeElement);
        } else {
            // 如果 highlight.js 未加载，手动简单格式化（但保留字体）
        }
    }

    // 确保 highlight.js 已加载，动态加载备用
    if (typeof hljs === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
        script.onload = () => {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        };
        document.head.appendChild(script);
    }

    // ----- 管理员工具逻辑 -----
    toggleAdmin.addEventListener('click', () => {
        adminPanel.classList.toggle('hidden');
    });

    // 预览粘贴内容
    previewPasted.addEventListener('click', () => {
        const pasted = pasteJson.value.trim();
        if (pasted) {
            displayJson(pasted);
        } else {
            alert('请在文本框中粘贴 JSON 内容');
        }
    });

    // 重置为原始文件内容
    resetOriginal.addEventListener('click', () => {
        if (originalJsonContent) {
            displayJson(originalJsonContent);
            pasteJson.value = '';  // 清空粘贴区
            uploadJson.value = ''; // 清空文件选择
        } else {
            alert('没有原始内容，请先查看一个条目');
        }
    });

    // 上传文件预览
    uploadJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            displayJson(content);
            pasteJson.value = content; // 可选同步到粘贴框
        };
        reader.readAsText(file);
    });

    // 可选：同步粘贴框内容（不做自动预览，保留按钮触发）
});