window.STPhone = window.STPhone || {};
window.STPhone.Apps = window.STPhone.Apps || {};

window.STPhone.Apps.Store = (function() {
    'use strict';

    const css = `
        <style>
            .st-store-app {
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%; z-index: 999;
                display: flex; flex-direction: column;
                background: var(--pt-bg-color, #f5f5f7);
                color: var(--pt-text-color, #000);
                font-family: var(--pt-font, -apple-system, sans-serif);
                box-sizing: border-box;
            }
            
            .st-store-header {
                padding: 20px 15px 10px;
                flex-shrink: 0;
            }
            .st-store-title {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            .st-store-subtitle {
                font-size: 14px;
                color: var(--pt-sub-text, #86868b);
            }
            
            .st-store-tabs {
                display: flex;
                padding: 0 15px;
                gap: 20px;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
                flex-shrink: 0;
            }
            .st-store-tab {
                padding: 12px 0;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                color: var(--pt-sub-text, #86868b);
                transition: all 0.2s;
            }
            .st-store-tab.active {
                color: var(--pt-accent, #007aff);
                border-bottom-color: var(--pt-accent, #007aff);
            }
            
            .st-store-content {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            
            /* 추천 배너 */
            .st-store-featured {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
                color: white;
            }
            .st-featured-label {
                font-size: 12px;
                opacity: 0.8;
                margin-bottom: 5px;
            }
            .st-featured-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .st-featured-desc {
                font-size: 13px;
                opacity: 0.9;
                line-height: 1.4;
            }
            
            /* 섹션 헤더 */
            .st-store-section {
                margin-bottom: 25px;
            }
            .st-section-header {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            /* 앱 카드 리스트 */
            .st-app-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .st-app-card {
                display: flex;
                align-items: center;
                padding: 12px;
                background: var(--pt-card-bg, #fff);
                border-radius: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            
            .st-app-card-icon {
                width: 60px; height: 60px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .st-app-card-info {
                flex: 1;
                min-width: 0;
            }
            .st-app-card-name {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 3px;
            }
            .st-app-card-category {
                font-size: 12px;
                color: var(--pt-sub-text, #86868b);
                margin-bottom: 4px;
            }
            .st-app-card-desc {
                font-size: 12px;
                color: var(--pt-sub-text, #86868b);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .st-app-card-action {
                flex-shrink: 0;
                margin-left: 10px;
            }
            
            .st-install-btn {
                padding: 8px 18px;
                border-radius: 20px;
                border: none;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .st-install-btn.get {
                background: var(--pt-accent, #007aff);
                color: white;
            }
            .st-install-btn.get:hover {
                background: #0066d6;
            }
            .st-install-btn.installed {
                background: var(--pt-border, #e5e5e5);
                color: var(--pt-sub-text, #86868b);
            }
            .st-install-btn.open {
                background: var(--pt-card-bg, #f0f0f0);
                color: var(--pt-accent, #007aff);
                border: 1px solid var(--pt-accent, #007aff);
            }
            .st-install-btn.uninstall {
                background: #ff3b30;
                color: white;
            }
            
            /* 앱 상세 화면 */
            .st-app-detail {
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%;
                background: var(--pt-bg-color, #f5f5f7);
                z-index: 1001;
                display: flex;
                flex-direction: column;
            }
            .st-detail-header {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
                flex-shrink: 0;
            }
            .st-detail-back {
                background: none;
                border: none;
                color: var(--pt-accent, #007aff);
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
            }
            .st-detail-title {
                flex: 1;
                text-align: center;
                font-weight: 600;
                font-size: 17px;
                margin-right: 40px;
            }
            .st-detail-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px 15px;
            }
            .st-detail-hero {
                display: flex;
                align-items: flex-start;
                margin-bottom: 20px;
            }
            .st-detail-icon {
                width: 100px; height: 100px;
                border-radius: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                margin-right: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            }
            .st-detail-meta {
                flex: 1;
            }
            .st-detail-name {
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .st-detail-category {
                font-size: 14px;
                color: var(--pt-sub-text, #86868b);
                margin-bottom: 12px;
            }
            .st-detail-actions {
                display: flex;
                gap: 10px;
            }
            .st-detail-btn {
                padding: 10px 30px;
                border-radius: 20px;
                border: none;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
            }
            .st-detail-btn.primary {
                background: var(--pt-accent, #007aff);
                color: white;
            }
            .st-detail-btn.danger {
                background: #ff3b30;
                color: white;
            }
            .st-detail-btn.secondary {
                background: var(--pt-border, #e5e5e5);
                color: var(--pt-text-color, #000);
            }
            
            .st-detail-section {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid var(--pt-border, #e5e5e5);
            }
            .st-detail-section-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .st-detail-desc {
                font-size: 15px;
                line-height: 1.6;
                color: var(--pt-text-color, #000);
            }
            .st-detail-info-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
            }
            .st-detail-info-label {
                color: var(--pt-sub-text, #86868b);
            }
            .st-detail-info-value {
                font-weight: 500;
            }
            
            /* 빈 상태 */
            .st-store-empty {
                text-align: center;
                padding: 60px 20px;
                color: var(--pt-sub-text, #86868b);
            }
            .st-store-empty-icon {
                font-size: 64px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            /* 검색창 */
            .st-store-search {
                margin: 0 15px 15px;
                padding: 12px 15px;
                border-radius: 12px;
                border: none;
                background: var(--pt-card-bg, #fff);
                color: var(--pt-text-color, #000);
                font-size: 15px;
                outline: none;
                width: calc(100% - 30px);
                box-sizing: border-box;
            }
            .st-store-search::placeholder {
                color: var(--pt-sub-text, #86868b);
            }
        </style>
    `;

    // 기본 앱 (삭제 불가)
    const DEFAULT_APPS = ['phone', 'messages', 'contacts', 'camera', 'album', 'settings', 'store'];
    
    // 스토어에서 제공하는 앱 목록
    const STORE_APPS = [
        {
            id: 'notes',
            name: '메모',
            icon: '📝',
            bg: 'linear-gradient(135deg, #f5af19, #f12711)',
            category: '생산성',
            description: '간단한 메모를 작성하고 저장할 수 있습니다. 아이디어를 빠르게 기록하세요.',
            version: '1.0.0',
            size: '0.3 MB'
        },
        {
            id: 'weather',
            name: '날씨',
            icon: '🌤️',
            bg: 'linear-gradient(135deg, #56CCF2, #2F80ED)',
            category: '날씨',
            description: '가상의 날씨 정보를 확인합니다. 롤플레이용 날씨 앱입니다.',
            version: '1.0.0',
            size: '0.4 MB'
        },
        {
            id: 'music',
            name: '음악',
            icon: '🎵',
            bg: 'linear-gradient(135deg, #fc4a1a, #f7b733)',
            category: '엔터테인먼트',
            description: '가상의 음악 플레이어입니다. 플레이리스트를 만들고 관리하세요.',
            version: '1.0.0',
            size: '1.2 MB'
        },
        {
            id: 'games',
            name: '미니게임',
            icon: '🎮',
            bg: 'linear-gradient(135deg, #11998e, #38ef7d)',
            category: '게임',
            description: '간단한 미니게임 모음입니다. 숫자 맞추기 게임을 즐겨보세요.',
            version: '1.0.0',
            size: '0.8 MB'
        }
    ];

    let installedApps = [];
    let currentTab = 'discover';

    function getStorageKey() {
        const context = window.SillyTavern?.getContext?.();
        if (!context?.chatId) return null;
        return 'st_phone_installed_apps_' + context.chatId;
    }

    function loadInstalledApps() {
        const key = getStorageKey();
        if (!key) {
            installedApps = [];
            return;
        }
        try {
            const saved = localStorage.getItem(key);
            installedApps = saved ? JSON.parse(saved) : [];
        } catch (e) {
            installedApps = [];
        }
    }

    function saveInstalledApps() {
        const key = getStorageKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(installedApps));
    }

    function isInstalled(appId) {
        loadInstalledApps();
        return installedApps.includes(appId);
    }

    function installApp(appId) {
        loadInstalledApps();
        if (!installedApps.includes(appId)) {
            installedApps.push(appId);
            saveInstalledApps();
            return true;
        }
        return false;
    }

    function uninstallApp(appId) {
        if (DEFAULT_APPS.includes(appId)) {
            toastr.warning('기본 앱은 삭제할 수 없습니다.');
            return false;
        }
        loadInstalledApps();
        const index = installedApps.indexOf(appId);
        if (index > -1) {
            installedApps.splice(index, 1);
            saveInstalledApps();
            return true;
        }
        return false;
    }

    function getInstalledStoreApps() {
        loadInstalledApps();
        return STORE_APPS.filter(app => installedApps.includes(app.id));
    }

    function getAvailableApps() {
        loadInstalledApps();
        return STORE_APPS.filter(app => !installedApps.includes(app.id));
    }

    function open() {
        loadInstalledApps();
        
        const $screen = window.STPhone.UI.getContentElement();
        if (!$screen || !$screen.length) return;
        $screen.empty();

        const html = `
            ${css}
            <div class="st-store-app">
                <div class="st-store-header">
                    <div class="st-store-title">App Store</div>
                    <div class="st-store-subtitle">나만의 폰을 꾸며보세요</div>
                </div>
                
                <input type="text" class="st-store-search" id="st-store-search" placeholder="🔍 앱 검색">
                
                <div class="st-store-tabs">
                    <div class="st-store-tab ${currentTab === 'discover' ? 'active' : ''}" data-tab="discover">발견</div>
                    <div class="st-store-tab ${currentTab === 'installed' ? 'active' : ''}" data-tab="installed">설치됨</div>
                </div>
                
                <div class="st-store-content" id="st-store-content">
                </div>
            </div>
        `;

        $screen.append(html);
        renderTab(currentTab);
        attachListeners();
    }

    function renderTab(tab) {
        currentTab = tab;
        const $content = $('#st-store-content');
        $content.empty();

        if (tab === 'discover') {
            renderDiscoverTab($content);
        } else {
            renderInstalledTab($content);
        }
    }

    function renderDiscoverTab($content) {
        const available = getAvailableApps();
        const installed = getInstalledStoreApps();
        
        let html = `
            <div class="st-store-featured">
                <div class="st-featured-label">새로운 앱</div>
                <div class="st-featured-title">폰을 더 유용하게!</div>
                <div class="st-featured-desc">다양한 앱을 설치하여 가상 폰을 꾸며보세요. 게임, 메모, 타이머 등 다양한 앱을 제공합니다.</div>
            </div>
        `;

        if (available.length > 0) {
            html += `
                <div class="st-store-section">
                    <div class="st-section-header">설치 가능한 앱</div>
                    <div class="st-app-list">
                        ${available.map(app => renderAppCard(app, false)).join('')}
                    </div>
                </div>
            `;
        }

        if (installed.length > 0) {
            html += `
                <div class="st-store-section">
                    <div class="st-section-header">설치된 앱</div>
                    <div class="st-app-list">
                        ${installed.map(app => renderAppCard(app, true)).join('')}
                    </div>
                </div>
            `;
        }

        if (available.length === 0 && installed.length === 0) {
            html += `
                <div class="st-store-empty">
                    <div class="st-store-empty-icon">📦</div>
                    <div>앱이 없습니다</div>
                </div>
            `;
        }

        $content.append(html);
    }

    function renderInstalledTab($content) {
        const installed = getInstalledStoreApps();
        
        if (installed.length === 0) {
            $content.append(`
                <div class="st-store-empty">
                    <div class="st-store-empty-icon">📱</div>
                    <div>설치된 추가 앱이 없습니다</div>
                    <div style="font-size:13px;margin-top:8px;">발견 탭에서 앱을 설치해보세요</div>
                </div>
            `);
            return;
        }

        let html = `
            <div class="st-store-section">
                <div class="st-section-header">내 앱 (${installed.length})</div>
                <div class="st-app-list">
                    ${installed.map(app => renderAppCard(app, true)).join('')}
                </div>
            </div>
        `;

        $content.append(html);
    }

    function renderAppCard(app, isInstalled) {
        const btnClass = isInstalled ? 'open' : 'get';
        const btnText = isInstalled ? '열기' : '받기';

        return `
            <div class="st-app-card" data-app-id="${app.id}">
                <div class="st-app-card-icon" style="background: ${app.bg};">${app.icon}</div>
                <div class="st-app-card-info">
                    <div class="st-app-card-name">${app.name}</div>
                    <div class="st-app-card-category">${app.category}</div>
                    <div class="st-app-card-desc">${app.description}</div>
                </div>
                <div class="st-app-card-action">
                    <button class="st-install-btn ${btnClass}" data-app-id="${app.id}" data-installed="${isInstalled}">
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    }

    function openAppDetail(appId) {
        const app = STORE_APPS.find(a => a.id === appId);
        if (!app) return;

        const installed = isInstalled(appId);

        const detailHtml = `
            <div class="st-app-detail" id="st-app-detail">
                <div class="st-detail-header">
                    <button class="st-detail-back" id="st-detail-back">‹</button>
                    <div class="st-detail-title">앱 정보</div>
                </div>
                <div class="st-detail-content">
                    <div class="st-detail-hero">
                        <div class="st-detail-icon" style="background: ${app.bg};">${app.icon}</div>
                        <div class="st-detail-meta">
                            <div class="st-detail-name">${app.name}</div>
                            <div class="st-detail-category">${app.category}</div>
                            <div class="st-detail-actions">
                                ${installed 
                                    ? `<button class="st-detail-btn primary" id="st-detail-open" data-app-id="${app.id}">열기</button>
                                       <button class="st-detail-btn danger" id="st-detail-uninstall" data-app-id="${app.id}">삭제</button>`
                                    : `<button class="st-detail-btn primary" id="st-detail-install" data-app-id="${app.id}">받기</button>`
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div class="st-detail-section">
                        <div class="st-detail-section-title">설명</div>
                        <div class="st-detail-desc">${app.description}</div>
                    </div>
                    
                    <div class="st-detail-section">
                        <div class="st-detail-section-title">정보</div>
                        <div class="st-detail-info-row">
                            <span class="st-detail-info-label">버전</span>
                            <span class="st-detail-info-value">${app.version}</span>
                        </div>
                        <div class="st-detail-info-row">
                            <span class="st-detail-info-label">크기</span>
                            <span class="st-detail-info-value">${app.size}</span>
                        </div>
                        <div class="st-detail-info-row">
                            <span class="st-detail-info-label">카테고리</span>
                            <span class="st-detail-info-value">${app.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('.st-store-app').append(detailHtml);

        $('#st-detail-back').on('click', () => {
            $('#st-app-detail').remove();
        });

        $('#st-detail-install').on('click', function() {
            const id = $(this).data('app-id');
            if (installApp(id)) {
                toastr.success(`✅ ${app.name} 설치 완료!`);
                $('#st-app-detail').remove();
                open();
            }
        });

        $('#st-detail-open').on('click', function() {
            const id = $(this).data('app-id');
            $('#st-app-detail').remove();
            openInstalledApp(id);
        });

        $('#st-detail-uninstall').on('click', function() {
            const id = $(this).data('app-id');
            if (confirm(`${app.name}을(를) 삭제하시겠습니까?`)) {
                if (uninstallApp(id)) {
                    toastr.info(`🗑️ ${app.name} 삭제됨`);
                    $('#st-app-detail').remove();
                    open();
                }
            }
        });
    }

    function openInstalledApp(appId) {
        // 스토어 앱들의 실제 기능 실행
        const Apps = window.STPhone.Apps;

        switch(appId) {
            case 'notes':
                Apps.Notes?.open();
                break;
            case 'weather':
                Apps.Weather?.open();
                break;
            case 'music':
                Apps.Music?.open();
                break;
            case 'games':
                Apps.Games?.open();
                break;
            default:
                toastr.warning('앱을 찾을 수 없습니다.');
        }
    }

    function attachListeners() {
        // 탭 전환
        $('.st-store-tab').off('click').on('click', function() {
            const tab = $(this).data('tab');
            $('.st-store-tab').removeClass('active');
            $(this).addClass('active');
            renderTab(tab);
            attachCardListeners();
        });

        // 검색
        $('#st-store-search').off('input').on('input', function() {
            const query = $(this).val().toLowerCase();
            filterApps(query);
        });

        attachCardListeners();
    }

    function attachCardListeners() {
        // 앱 카드 클릭 (상세 보기)
        $('.st-app-card').off('click').on('click', function(e) {
            if ($(e.target).hasClass('st-install-btn')) return;
            const appId = $(this).data('app-id');
            openAppDetail(appId);
        });

        // 설치/열기 버튼
        $('.st-install-btn').off('click').on('click', function(e) {
            e.stopPropagation();
            const appId = $(this).data('app-id');
            const installed = $(this).data('installed');
            const app = STORE_APPS.find(a => a.id === appId);

            if (installed) {
                openInstalledApp(appId);
            } else {
                if (installApp(appId)) {
                    toastr.success(`✅ ${app.name} 설치 완료!`);
                    renderTab(currentTab);
                    attachCardListeners();
                }
            }
        });
    }

    function filterApps(query) {
        $('.st-app-card').each(function() {
            const name = $(this).find('.st-app-card-name').text().toLowerCase();
            const category = $(this).find('.st-app-card-category').text().toLowerCase();
            const desc = $(this).find('.st-app-card-desc').text().toLowerCase();
            
            if (name.includes(query) || category.includes(query) || desc.includes(query)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // 홈 화면에서 사용할 함수들
    function getHomeScreenApps() {
        loadInstalledApps();
        return installedApps;
    }

    function getStoreAppInfo(appId) {
        return STORE_APPS.find(a => a.id === appId);
    }

    return {
        open,
        isInstalled,
        installApp,
        uninstallApp,
        getInstalledStoreApps,
        getHomeScreenApps,
        getStoreAppInfo,
        openInstalledApp,
        STORE_APPS
    };
})();
