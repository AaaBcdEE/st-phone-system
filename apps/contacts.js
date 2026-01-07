window.STPhone = window.STPhone || {};
window.STPhone.Apps = window.STPhone.Apps || {};

window.STPhone.Apps.Contacts = (function() {
    'use strict';

    const css = `
        <style>
            .st-contacts-app {
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%; z-index: 999;
                display: flex; flex-direction: column;
                background: var(--pt-bg-color, #f5f5f7);
                color: var(--pt-text-color, #000);
                font-family: var(--pt-font, -apple-system, sans-serif);
            }
            .st-contacts-header {
                padding: 20px 15px 10px;
                font-size: 28px;
                font-weight: 700;
                flex-shrink: 0;
            }
            .st-contacts-search {
                margin: 0 15px 10px;
                padding: 10px 15px;
                border-radius: 10px;
                border: none;
                background: var(--pt-card-bg, #fff);
                color: var(--pt-text-color, #000);
                font-size: 14px;
                outline: none;
            }
            .st-contacts-list {
                flex: 1;
                overflow-y: auto;
                padding: 0 15px 80px;
            }
            .st-contact-item {
                display: flex;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
                cursor: pointer;
            }
            .st-contact-avatar {
                width: 45px; height: 45px;
                border-radius: 50%;
                background: #ddd;
                object-fit: cover;
                margin-right: 12px;
            }
            .st-contact-info { flex: 1; min-width: 0; }
            .st-contact-name {
                font-size: 16px;
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .st-contact-preview {
                font-size: 13px;
                color: var(--pt-sub-text, #86868b);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .st-contact-actions { display: flex; gap: 8px; }
            .st-contact-action-btn {
                width: 32px; height: 32px;
                border-radius: 50%;
                border: none;
                color: white;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .st-contact-action-btn.msg { background: #34c759; }
            .st-contact-action-btn.call { background: #007aff; }
            .st-contacts-fab {
                position: absolute;
                bottom: 25px; right: 20px;
                width: 56px; height: 56px;
                border-radius: 50%;
                background: var(--pt-accent, #007aff);
                color: white;
                border: none;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }
            .st-contacts-empty {
                text-align: center;
                padding: 60px 20px;
                color: var(--pt-sub-text, #86868b);
            }
            .st-contact-edit {
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%;
                background: var(--pt-bg-color, #f5f5f7);
                display: flex; flex-direction: column;
                z-index: 1001;
            }
            .st-contact-edit-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
            }
            .st-contact-edit-btn {
                background: none;
                border: none;
                color: var(--pt-accent, #007aff);
                font-size: 16px;
                cursor: pointer;
            }
            .st-contact-edit-btn.delete { color: #ff3b30; }
            .st-contact-edit-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px 15px;
            }
            .st-contact-edit-avatar-wrap {
                text-align: center;
                margin-bottom: 25px;
            }
            .st-contact-edit-avatar {
                width: 100px; height: 100px;
                border-radius: 50%;
                background: #ddd;
                object-fit: cover;
                cursor: pointer;
            }
            .st-contact-edit-avatar-label {
                display: block;
                margin-top: 8px;
                color: var(--pt-accent, #007aff);
                font-size: 14px;
                cursor: pointer;
            }
            .st-contact-edit-group {
                background: var(--pt-card-bg, #fff);
                border-radius: 12px;
                margin-bottom: 20px;
                overflow: hidden;
            }
            .st-contact-edit-row {
                padding: 12px 15px;
                border-bottom: 1px solid var(--pt-border, #e5e5e5);
            }
            .st-contact-edit-row:last-child { border-bottom: none; }
            .st-contact-edit-label {
                font-size: 12px;
                color: var(--pt-sub-text, #86868b);
                margin-bottom: 5px;
            }
            .st-contact-edit-input {
                width: 100%;
                border: none;
                background: transparent;
                color: var(--pt-text-color, #000);
                font-size: 16px;
                outline: none;
            }
            .st-contact-edit-textarea {
                width: 100%;
                border: none;
                background: transparent;
                color: var(--pt-text-color, #000);
                font-size: 14px;
                outline: none;
                resize: none;
                min-height: 80px;
            }
        </style>
    `;

    let contacts = [];
    const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

    function getStorageKey() {
        const context = window.SillyTavern?.getContext?.();
        if (!context?.chatId) return null;
        return 'st_phone_contacts_' + context.chatId;
    }

    function loadContacts() {
        const key = getStorageKey();
        if (!key) { contacts = []; return; }
        try {
            contacts = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) { contacts = []; }
    }

    function saveContacts() {
        const key = getStorageKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(contacts));
    }

    function generateId() {
        return 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function getContact(id) {
        loadContacts();
        return contacts.find(c => c.id === id);
    }

    function getAllContacts() {
        loadContacts();
        return [...contacts];
    }

    function addContact(data) {
        loadContacts();
        const c = {
            id: generateId(),
            name: data.name || '새 연락처',
            avatar: data.avatar || '',
            persona: data.persona || '',
            tags: data.tags || '',
            createdAt: Date.now()
        };
        contacts.push(c);
        saveContacts();
        return c;
    }

    function updateContact(id, data) {
        loadContacts();
        const i = contacts.findIndex(c => c.id === id);
        if (i >= 0) {
            contacts[i] = { ...contacts[i], ...data };
            saveContacts();
            return contacts[i];
        }
        return null;
    }

    function deleteContactById(id) {
        loadContacts();
        const i = contacts.findIndex(c => c.id === id);
        if (i >= 0) {
            contacts.splice(i, 1);
            saveContacts();
            return true;
        }
        return false;
    }

    function open() {
        loadContacts();
        const $screen = window.STPhone.UI.getContentElement();
        if (!$screen?.length) return;
        $screen.empty();

        let listHtml = '';
        if (contacts.length === 0) {
            listHtml = `<div class="st-contacts-empty"><div style="font-size:48px;opacity:0.5;margin-bottom:15px;">👤</div><div>연락처가 없습니다</div></div>`;
        } else {
            contacts.forEach(c => {
                listHtml += `
                    <div class="st-contact-item" data-id="${c.id}">
                        <img class="st-contact-avatar" src="${c.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'">
                        <div class="st-contact-info">
                            <div class="st-contact-name">${c.name}</div>
                            <div class="st-contact-preview">${c.persona?.substring(0, 30) || ''}</div>
                        </div>
                        <div class="st-contact-actions">
                            <button class="st-contact-action-btn msg" data-action="msg" data-id="${c.id}">💬</button>
                            <button class="st-contact-action-btn call" data-action="call" data-id="${c.id}">📞</button>
                        </div>
                    </div>`;
            });
        }

        $screen.append(`
            ${css}
            <div class="st-contacts-app">
                <div class="st-contacts-header">연락처</div>
                <input class="st-contacts-search" id="st-contacts-search" placeholder="검색">
                <div class="st-contacts-list">${listHtml}</div>
                <button class="st-contacts-fab" id="st-contacts-add">+</button>
            </div>
        `);

        $('.st-contact-item').on('click', function(e) {
            if ($(e.target).closest('.st-contact-action-btn').length) return;
            openEdit($(this).data('id'));
        });
        $('.st-contact-action-btn[data-action="msg"]').on('click', function(e) {
            e.stopPropagation();
            window.STPhone.Apps?.Messages?.openChat($(this).data('id'));
        });
        $('.st-contact-action-btn[data-action="call"]').on('click', function(e) {
            e.stopPropagation();
            window.STPhone.Apps?.Phone?.makeCall($(this).data('id'));
        });
        $('#st-contacts-add').on('click', () => openEdit(null));
        $('#st-contacts-search').on('input', function() {
            const q = $(this).val().toLowerCase();
            $('.st-contact-item').each(function() {
                $(this).toggle($(this).find('.st-contact-name').text().toLowerCase().includes(q));
            });
        });
    }

    function openEdit(id) {
        const c = id ? getContact(id) : null;
        const html = `
            <div class="st-contact-edit" id="st-contact-edit">
                <div class="st-contact-edit-header">
                    <button class="st-contact-edit-btn" id="st-edit-cancel">취소</button>
                    <span style="font-weight:600;">${c ? '편집' : '새 연락처'}</span>
                    <button class="st-contact-edit-btn delete" id="st-edit-delete" style="visibility:${c ? 'visible' : 'hidden'}">삭제</button>
                </div>
                <div class="st-contact-edit-content">
                    <div class="st-contact-edit-avatar-wrap">
                        <img class="st-contact-edit-avatar" id="st-edit-avatar" src="${c?.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'">
                        <label class="st-contact-edit-avatar-label" for="st-edit-avatar-file">사진 변경</label>
                        <input type="file" id="st-edit-avatar-file" accept="image/*" style="display:none;">
                    </div>
                    <div class="st-contact-edit-group">
                        <div class="st-contact-edit-row">
                            <div class="st-contact-edit-label">이름</div>
                            <input class="st-contact-edit-input" id="st-edit-name" value="${c?.name || ''}" placeholder="이름">
                        </div>
                    </div>
                    <div class="st-contact-edit-group">
                        <div class="st-contact-edit-row">
                            <div class="st-contact-edit-label">성격 (AI 응답용)</div>
                            <textarea class="st-contact-edit-textarea" id="st-edit-persona" placeholder="예: 친절하고 유머러스...">${c?.persona || ''}</textarea>
                        </div>
                    </div>
                    <div class="st-contact-edit-group">
                        <div class="st-contact-edit-row">
                            <div class="st-contact-edit-label">외모 태그 (이미지 생성용)</div>
                            <textarea class="st-contact-edit-textarea" id="st-edit-tags" placeholder="예: 1girl, long hair...">${c?.tags || ''}</textarea>
                        </div>
                    </div>
                    <button id="st-edit-save" style="width:100%;padding:15px;border:none;border-radius:12px;background:var(--pt-accent,#007aff);color:white;font-size:16px;cursor:pointer;">저장</button>
                </div>
            </div>`;
        $('.st-contacts-app').append(html);

        $('#st-edit-cancel').on('click', () => $('#st-contact-edit').remove());
        $('#st-edit-delete').on('click', () => {
            if (c && confirm('삭제하시겠습니까?')) {
                deleteContactById(c.id);
                $('#st-contact-edit').remove();
                open();
            }
        });
        $('#st-edit-avatar-file').on('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => $('#st-edit-avatar').attr('src', ev.target.result);
            reader.readAsDataURL(file);
        });
        $('#st-edit-save').on('click', () => {
            const name = $('#st-edit-name').val().trim();
            if (!name) { toastr.warning('이름을 입력하세요'); return; }
            const data = {
                name,
                avatar: $('#st-edit-avatar').attr('src'),
                persona: $('#st-edit-persona').val().trim(),
                tags: $('#st-edit-tags').val().trim()
            };
            if (c) updateContact(c.id, data);
            else addContact(data);
            $('#st-contact-edit').remove();
            open();
            toastr.success('저장되었습니다');
        });
    }

    return { open, getContact, getAllContacts, addContact, updateContact, deleteContact: deleteContactById, loadContacts };
})();
