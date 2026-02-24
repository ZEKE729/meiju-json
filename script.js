document.addEventListener('DOMContentLoaded', () => {
    let appData = [];
    let currentItem = null;
    let originalJsonContent = '';

    // DOM 元素
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
    const backFromDetail = document.getElementById('back-from-detail');

    // 加载 data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            appData = data;
            renderList();
        })
        .catch(err => {
            console.error('加载 data.json 失败', err);
            listContainer.innerHTML = '<p style="color:red;">列表加载失败，请刷新重试。</p>';
        });

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

    function showView(viewName) {
        [homeView, feedbackView, aboutView, detailView].forEach(v => v.classList.remove('active'));
        if (viewName === 'home') homeView.classList.add('active');
        else if (viewName === 'feedback') feedbackView.classList.add('active');
        else if (viewName === 'about') aboutView.classList.add('active');
        else if (viewName === 'detail') detailView.classList.add('active');
    }

    homeTitle.addEventListener('click', () => showView('home'));
    feedbackBtn.addEventListener('click', () => showView('feedback'));
    aboutBtn.addEventListener('click', () => showView('about'));

    // 返回按钮
    backFromDetail.addEventListener('click', () => showView('home'));

    async function showDetail(item) {
        currentItem = item;
        detailName.textContent = item.name;
        downloadBtn.href = `files/${item.file}`;
        downloadBtn.download = item.file;

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

    function displayJson(content) {
        jsonCodeElement.textContent = content;
        if (window.hljs) {
            hljs.highlightElement(jsonCodeElement);
        }
    }

    // 确保 highlight.js 已加载（本地文件，理论上已存在）
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
});