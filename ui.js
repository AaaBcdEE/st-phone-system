window.STPhone = window.STPhone || {};

window.STPhone.UI = (function() {
    'use strict';

    let utils;
    let $phoneContainer;

    function init(dependencies) {
        utils = dependencies.utils;
        if (!utils) return;

        createPhoneElement();
        renderHomeScreen();

        if (window.STPhone.Apps && window.STPhone.Apps.Settings) {
            window.STPhone.Apps.Settings.init();
        }

        utils.log('UI Module Initialized.');
    }

    function createPhoneElement() {
        if ($('#st-phone-container').length > 0) return;

        const html = `
            <div id="st-phone-container">
                <div class="st-phone-screen">
                    <div class="st-phone-status-bar">
                        <div class="st-phone-notch"></div>
                    </div>
                    <div id="st-phone-content"></div>
                    <div class="st-phone-home-area" id="st-home-btn" style="position:absolute; bottom:10px; width:100%; height:30px; cursor:pointer; z-index:9999; display:flex; justify-content:center; align-items:center;">
                        <div class="st-phone-home-bar" style="width:130px; height:5px; background:rgba(255,255,255,0.4); border-radius:10px;"></div>
                    </div>
                </div>
            </div>
        `;
        $('body').append(html);
        $phoneContainer = $('#st-phone-container');

        // [수정됨] 스마트 홈 버튼 로직
        $('#st-home-btn').off('click').on('click', function() {
            // 현재 화면에 홈 그리드(앱 아이콘들)가 있는지 확인
            const isHomeScreen = $('#st-phone-content').find('.st-home-grid').length > 0;

            if (isHomeScreen) {
                // 이미 홈 화면이라면 -> 폰 닫기 (Toggle)
                togglePhone();
            } else {
                // 앱 실행 중이라면 -> 홈 화면으로 가기
                renderHomeScreen();
            }
        });

    }

    function renderHomeScreen() {
        const $screen = $('#st-phone-content');
        $screen.empty();

        // 기본 앱 아이콘 정의
        const defaultApps = [
            { id: 'phone', icon: '📞', name: '전화', bg: 'linear-gradient(135deg, #34c759, #30d158)' },
            { id: 'messages', icon: '💬', name: '메시지', bg: 'linear-gradient(135deg, #34c759, #30b0c7)' },
            { id: 'contacts', icon: '👤', name: '연락처', bg: 'linear-gradient(135deg, #8e8e93, #636366)' },
            { id: 'camera', icon: '📷', name: '카메라', bg: 'linear-gradient(135deg, #2c3e50, #000000)' },
            { id: 'album', icon: '🖼️', name: '앨범', bg: 'linear-gradient(135deg, #ff9500, #ff5e3a)' },
            { id: 'settings', icon: '⚙️', name: '설정', bg: 'linear-gradient(135deg, #8e8e93, #636366)' },
            { id: 'store', icon: '🛒', name: 'App Store', bg: 'linear-gradient(135deg, #007aff, #5856d6)' }
        ];

        // 설치된 추가 앱들 가져오기
        let installedApps = [];
        if (window.STPhone.Apps && window.STPhone.Apps.Store) {
            const storeApps = window.STPhone.Apps.Store.getInstalledStoreApps();
            installedApps = storeApps.map(app => ({
                id: app.id,
                icon: app.icon,
                name: app.name,
                bg: app.bg,
                isStoreApp: true
            }));
        }

        // 기본 앱 + 설치된 앱 합치기
        const allApps = [...defaultApps, ...installedApps];

        // 문자 앱 읽지 않은 메시지 수 가져오기
        let unreadCount = 0;
        if (window.STPhone.Apps && window.STPhone.Apps.Messages && window.STPhone.Apps.Messages.getTotalUnread) {
            unreadCount = window.STPhone.Apps.Messages.getTotalUnread();
        }

        let iconsHtml = '';
        allApps.forEach(app => {
            // 문자 앱에 배지 표시
            let badgeHtml = '';
            if (app.id === 'messages' && unreadCount > 0) {
                badgeHtml = `<div class="st-app-badge">${unreadCount > 99 ? '99+' : unreadCount}</div>`;
            }

            iconsHtml += `
                <div class="st-app-icon" data-app="${app.id}" ${app.isStoreApp ? 'data-store-app="true"' : ''} 
                     style="background: ${app.bg}; color: white; padding-bottom: 10px; box-sizing: border-box; position: relative;">
                    ${app.icon}
                    ${badgeHtml}
                </div>
            `;
        });

        const html = `<div class="st-home-grid">${iconsHtml}</div>`;
        $screen.append(html);

        // 이벤트 연결
        $('.st-app-icon').on('click', function() {
            const appId = $(this).data('app');
            const isStoreApp = $(this).data('store-app');
            
            if (isStoreApp) {
                openStoreApp(appId);
            } else {
                openApp(appId);
            }
        });

        // 길게 누르면 삭제 (스토어 앱만)
        let pressTimer;
        $('.st-app-icon[data-store-app="true"]').on('mousedown touchstart', function(e) {
            const $icon = $(this);
            const appId = $icon.data('app');
            
            pressTimer = setTimeout(() => {
                showDeleteConfirm(appId, $icon);
            }, 800);
        }).on('mouseup mouseleave touchend', function() {
            clearTimeout(pressTimer);
        });
    }

    function openApp(appId) {
        const Apps = window.STPhone.Apps;
        if (!Apps) {
            toastr.error('앱을 불러올 수 없습니다.');
            return;
        }

        switch(appId) {
            case 'phone':
                Apps.Phone?.open();
                break;
            case 'messages':
                Apps.Messages?.open();
                break;
            case 'contacts':
                Apps.Contacts?.open();
                break;
            case 'camera':
                Apps.Camera?.open();
                break;
            case 'album':
                Apps.Album?.open();
                break;
            case 'settings':
                Apps.Settings?.open();
                break;
            case 'store':
                Apps.Store?.open();
                break;
            default:
                toastr.warning('앱을 찾을 수 없습니다.');
        }
    }

    function openStoreApp(appId) {
        const Apps = window.STPhone.Apps;
        if (!Apps) return;

        // 스토어에서 설치한 앱들 실행
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


    function showDeleteConfirm(appId, $icon) {
        const Apps = window.STPhone.Apps;
        const appInfo = Apps.Store?.getStoreAppInfo(appId);
        
        if (!appInfo) return;

        // 삭제 확인 모달 표시
        const confirmHtml = `
            <div id="st-delete-confirm" style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 30000;
            ">
                <div style="
                    background: var(--pt-card-bg, #fff);
                    border-radius: 14px;
                    padding: 20px;
                    width: 280px;
                    text-align: center;
                    color: var(--pt-text-color, #000);
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">${appInfo.icon}</div>
                    <div style="font-size: 17px; font-weight: 600; margin-bottom: 5px;">"${appInfo.name}" 삭제</div>
                    <div style="font-size: 13px; color: var(--pt-sub-text, #86868b); margin-bottom: 20px;">
                        이 앱을 삭제하시겠습니까?
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="st-delete-cancel" style="
                            flex: 1;
                            padding: 12px;
                            border: none;
                            border-radius: 10px;
                            background: var(--pt-border, #e5e5e5);
                            color: var(--pt-text-color, #000);
                            font-size: 15px;
                            cursor: pointer;
                        ">취소</button>
                        <button id="st-delete-confirm-btn" style="
                            flex: 1;
                            padding: 12px;
                            border: none;
                            border-radius: 10px;
                            background: #ff3b30;
                            color: white;
                            font-size: 15px;
                            cursor: pointer;
                        ">삭제</button>
                    </div>
                </div>
            </div>
        `;

        $('body').append(confirmHtml);

        $('#st-delete-cancel').on('click', () => {
            $('#st-delete-confirm').remove();
        });

        $('#st-delete-confirm-btn').on('click', () => {
            if (Apps.Store?.uninstallApp(appId)) {
                toastr.info(`🗑️ ${appInfo.name} 삭제됨`);
                $('#st-delete-confirm').remove();
                renderHomeScreen();
            }
        });

        // 배경 클릭시 닫기
        $('#st-delete-confirm').on('click', function(e) {
            if (e.target === this) {
                $(this).remove();
            }
        });
    }

    function togglePhone() {
        if (!$phoneContainer) return;

        // 폰을 화면에 띄우기 직전에 홈 화면(아이콘)을 최신 상태로 새로고침
        // 이렇게 해야 새로고침 직후에도 설치된 앱들이 보입니다.
        if (!$phoneContainer.hasClass('active')) {
            renderHomeScreen();
        }

        $phoneContainer.toggleClass('active');
    }


    function getContentElement() {
        return $('#st-phone-content');
    }

    // 앱 아이콘에 배지 설정
    function setAppBadge(appId, count) {
        const $icon = $(`.st-app-icon[data-app="${appId}"]`);
        $icon.find('.st-app-badge').remove();
        if (count > 0) {
            $icon.append(`<div class="st-app-badge">${count > 99 ? '99+' : count}</div>`);
        }
    }

    return {
        init,
        togglePhone,
        getContentElement,
        renderHomeScreen,
        openApp,
        openStoreApp,
        setAppBadge
    };
})();
