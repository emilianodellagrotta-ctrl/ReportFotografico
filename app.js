// GLOBAL STATE (in-memory ONLY, no persistence)
let listTitle = 'Titolo Lista Report';
let reports = [];
let reportCounter = 0;
let currentPhoto = null;
let currentTags = {}; // Object: {A: {x, y, element, visible}, B: {...}, ...}
let currentResolveId = null;
let currentDeleteId = null;
let currentEditId = null;
let editCurrentTags = {}; // Object: {A: {x, y, element, visible}, B: {...}, ...}
let editOriginalState = null;

// DRAG variables (no longer needed - handled per arrow)

// DOM Elements
const listTitleScreen = document.getElementById('listTitleScreen');
const listTitleInput = document.getElementById('listTitleInput');
const saveListTitleBtn = document.getElementById('saveListTitle');
const mainApp = document.getElementById('mainApp');
const listTitleDisplay = document.getElementById('listTitleDisplay');
const editListTitleBtn = document.getElementById('editListTitle');
const editTitleModal = document.getElementById('editTitleModal');
const editTitleInput = document.getElementById('editListTitleInput');
const cancelEditTitleBtn = document.getElementById('cancelEditTitle');
const confirmEditTitleBtn = document.getElementById('confirmEditTitle');

const reportForm = document.getElementById('reportForm');
const fotoInput = document.getElementById('fotoInput');
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const photoPreview = document.getElementById('photoPreview');
const photoOverlay = document.getElementById('photoOverlay');
const arrowsContainer = document.getElementById('arrowsContainer');
const tagToggleButtons = document.querySelectorAll('.tag-toggle-btn:not(.edit-tag-btn)');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const reportsList = document.getElementById('reportsList');
const exportJSONBtn = document.getElementById('exportJSON');
const importJSONBtn = document.getElementById('importJSON');
const importFileInput = document.getElementById('importFileInput');
const exportPDFBtn = document.getElementById('exportPDF');
const importModal = document.getElementById('importModal');
let pendingImportData = null;
const resolveModal = document.getElementById('resolveModal');
const deleteModal = document.getElementById('deleteModal');
const editModal = document.getElementById('editModal');
const toast = document.getElementById('toast');

// Elements for edit modal
const editPhotoPreview = document.getElementById('editPhotoPreview');
const editPhotoOverlay = document.getElementById('editPhotoOverlay');
const editArrowsContainer = document.getElementById('editArrowsContainer');
const editTagToggleButtons = document.querySelectorAll('.edit-tag-btn');
const editNoteField = document.getElementById('editNote');
const editNoteElaborazioneField = document.getElementById('editNoteElaborazione');
const editNoteElaborazioneGroup = document.getElementById('editNoteElaborazioneGroup');
const cancelEditBtn = document.getElementById('cancelEdit');
const confirmEditBtn = document.getElementById('confirmEdit');
const miniReportsList = document.getElementById('miniReportsList');
const miniReportsTableBody = document.getElementById('miniReportsTableBody');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
});

function initializeEventListeners() {
  // List title first screen
  saveListTitleBtn.addEventListener('click', saveListTitle);
  editListTitleBtn.addEventListener('click', () => openModal(editTitleModal));
  cancelEditTitleBtn.addEventListener('click', () => closeModal(editTitleModal));
  confirmEditTitleBtn.addEventListener('click', changeListTitle);

  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => handleTabSwitch(button));
  });

  // Photo input
  fotoInput.addEventListener('change', handlePhotoUpload);

  // Tag toggle buttons
  tagToggleButtons.forEach(button => {
    button.addEventListener('click', () => handleTagToggle(button));
  });
  
  editTagToggleButtons.forEach(button => {
    button.addEventListener('click', () => handleEditTagToggle(button));
  });

  // Overlay click for arrow positioning
  photoOverlay.addEventListener('click', handleOverlayClick);
  photoOverlay.addEventListener('touchend', handleOverlayTouchEnd);

  // Edit overlay - allow adding new arrows
  editPhotoOverlay.addEventListener('click', handleEditOverlayClick);
  editPhotoOverlay.addEventListener('touchend', handleEditOverlayTouchEnd);

  // Form submit
  reportForm.addEventListener('submit', handleFormSubmit);

  // Export/Import buttons
  exportJSONBtn.addEventListener('click', exportToJSON);
  importJSONBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleImportFile);
  exportPDFBtn.addEventListener('click', exportToPDF);
  
  // Import modal actions
  document.getElementById('cancelImport').addEventListener('click', () => {
    closeModal(importModal);
    pendingImportData = null;
  });
  document.getElementById('confirmImportAdd').addEventListener('click', () => confirmImport(false));
  document.getElementById('confirmImportReplace').addEventListener('click', () => confirmImport(true));

  // Modal actions
  document.getElementById('confirmResolve').addEventListener('click', confirmResolve);
  document.getElementById('cancelResolve').addEventListener('click', () => closeModal(resolveModal));

  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
  document.getElementById('cancelDelete').addEventListener('click', () => closeModal(deleteModal));

  // Edit modal actions
  cancelEditBtn.addEventListener('click', handleCancelEdit);
  confirmEditBtn.addEventListener('click', confirmEditReport);

  // Drag listeners will be added dynamically to each arrow
}

function saveListTitle() {
  const title = listTitleInput.value.trim();
  if (!title) {
    showToast('Inserisci un titolo per la lista');
    return;
  }
  listTitle = title;
  listTitleDisplay.textContent = title;
  listTitleScreen.style.display = 'none';
  mainApp.style.display = 'block';
  showToast('Lista creata! Ora aggiungi report');
}

function changeListTitle() {
  const newTitle = editTitleInput.value.trim();
  if (!newTitle) {
    showToast('Inserisci un titolo valido');
    return;
  }
  listTitle = newTitle;
  listTitleDisplay.textContent = newTitle;
  closeModal(editTitleModal);
  showToast('Titolo lista aggiornato');
  if (tabButtons[1].classList.contains('active')) {
    renderReportsList();
  }
}

function handleTabSwitch(button) {
  const targetTab = button.dataset.tab;
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  
  tabPanes.forEach(pane => pane.classList.remove('active'));
  document.getElementById(`tab-${targetTab}`).classList.add('active');
  
  if (targetTab === 'lista') {
    renderReportsList();
  }
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    currentPhoto = e.target.result;
    const img = new Image();
    img.onload = () => {
      window.currentPhotoWidth = img.width;
      window.currentPhotoHeight = img.height;
      photoPreview.src = currentPhoto;
      photoPreviewContainer.style.display = 'block';
      currentTags = [];
      arrowsContainer.innerHTML = '';
      showToast('Foto caricata! Seleziona tag e clicca sulla foto');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleTagToggle(button) {
  const color = button.dataset.color;
  const letter = button.dataset.letter;
  
  if (!currentPhoto) {
    showToast('Carica prima una foto');
    return;
  }
  
  button.classList.toggle('active');
  const isActive = button.classList.contains('active');
  
  if (isActive) {
    // Toggle ON: Show or create tag
    if (!currentTags[letter]) {
      // Create new tag at center position
      const centerPos = {x: 50, y: 50};
      const arrowEl = createSingleArrowElement(centerPos, color, letter, arrowsContainer, false);
      arrowsContainer.appendChild(arrowEl);
      currentTags[letter] = {x: centerPos.x, y: centerPos.y, color: color, element: arrowEl, visible: true};
      showToast(`Tag ${letter} creato - trascinalo per posizionarlo`);
    } else {
      // Show existing tag
      currentTags[letter].visible = true;
      currentTags[letter].element.style.display = 'block';
      showToast(`Tag ${letter} mostrato`);
    }
  } else {
    // Toggle OFF: Hide tag
    if (currentTags[letter]) {
      currentTags[letter].visible = false;
      currentTags[letter].element.style.display = 'none';
      showToast(`Tag ${letter} nascosto`);
    }
  }
}

function handleEditTagToggle(button) {
  const color = button.dataset.color;
  const letter = button.dataset.letter;
  
  button.classList.toggle('active');
  const isActive = button.classList.contains('active');
  
  if (isActive) {
    // Toggle ON: Show or create tag
    if (!editCurrentTags[letter]) {
      // Create new tag at center position
      const centerPos = {x: 50, y: 50};
      const arrowEl = createSingleArrowElement(centerPos, color, letter, document.getElementById('editArrowsContainer'), true);
      document.getElementById('editArrowsContainer').appendChild(arrowEl);
      editCurrentTags[letter] = {x: centerPos.x, y: centerPos.y, color: color, element: arrowEl, visible: true};
      showToast(`Tag ${letter} creato`);
    } else {
      // Show existing tag
      editCurrentTags[letter].visible = true;
      editCurrentTags[letter].element.style.display = 'block';
      showToast(`Tag ${letter} mostrato`);
    }
  } else {
    // Toggle OFF: Hide tag
    if (editCurrentTags[letter]) {
      editCurrentTags[letter].visible = false;
      editCurrentTags[letter].element.style.display = 'none';
      showToast(`Tag ${letter} nascosto`);
    }
  }
}

function handleOverlayClick(event) {
  // Clicking on photo now does nothing - tags are created by toggle buttons
  // This prevents accidental creation of duplicate tags
  return;
}

function handleOverlayTouchEnd(event) {
  // Touching photo now does nothing - tags are created by toggle buttons
  event.preventDefault();
  return;
}

function handleEditOverlayClick(event) {
  // Clicking on photo now does nothing - tags are created by toggle buttons
  return;
}

function handleEditOverlayTouchEnd(event) {
  // Touching photo now does nothing - tags are created by toggle buttons
  event.preventDefault();
  return;
}

function createSingleArrowElement(position, color, letter, container, isEdit = false) {
  const arrow = document.createElement('div');
  arrow.className = 'arrow-marker draggable';
  arrow.style.left = position.x + '%';
  arrow.style.top = position.y + '%';
  arrow.style.color = color;
  arrow.dataset.letter = letter;
  arrow.innerHTML = `<svg width="50" height="50" viewBox="0 0 50 50"><g transform="translate(25, 25) rotate(-135)"><path d="M0,-20 L0,15 M0,15 L-8,7 M0,15 L8,7" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g></svg>`;
  
  addArrowDragListeners(arrow, letter, isEdit);
  return arrow;
}



function addArrowDragListeners(arrow, letter, isEdit = false) {
  let isDragging = false;
  const tagsObj = isEdit ? editCurrentTags : currentTags;
  
  const onStart = (e) => {
    isDragging = true;
    arrow.classList.add('dragging');
  };
  
  const onMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const container = arrow.parentElement;
    const img = container.previousElementSibling;
    const rect = img.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    
    if (tagsObj[letter]) {
      tagsObj[letter].x = xPercent;
      tagsObj[letter].y = yPercent;
      arrow.style.left = xPercent + '%';
      arrow.style.top = yPercent + '%';
    }
  };
  
  const onEnd = () => {
    if (isDragging) {
      arrow.classList.remove('dragging');
      isDragging = false;
    }
  };
  
  arrow.addEventListener('mousedown', onStart);
  arrow.addEventListener('touchstart', onStart, {passive: false});
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, {passive: false});
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

// Old drag functions removed - now handled per-arrow in addArrowDragListeners

function generateReportId() {
  reportCounter++;
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${reportCounter}-${month}-${year}`;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const note = document.getElementById('note').value.trim();

  if (!currentPhoto) {
    showToast('Carica una foto prima di aggiungere il report');
    return;
  }
  
  // Check if at least one tag is visible
  const visibleTags = Object.values(currentTags).filter(tag => tag.visible);
  if (visibleTags.length === 0) {
    showToast('Attiva almeno un tag prima di aggiungere');
    return;
  }

  const finalPhoto = generatePhotoWithArrows(currentPhoto, currentTags);
  
  // Convert currentTags object to array format for storage
  const tags = convertTagsToArray(currentTags);
  const activeColors = Object.keys(currentTags).filter(letter => currentTags[letter].visible);

  const report = {
    id: generateReportId(),
    foto: finalPhoto,
    fotoOriginal: currentPhoto,
    fotoOriginalWidth: window.currentPhotoWidth || 800,
    fotoOriginalHeight: window.currentPhotoHeight || 600,
    tags: tags,
    activeColors: activeColors,
    note: note,
    dataCreazione: new Date().toISOString(),
    stato: 'Pendente',
    noteElaborazione: ''
  };
  reports.push(report);

  // reset
  reportForm.reset();
  currentPhoto = null;
  currentTags = {};
  photoPreviewContainer.style.display = 'none';
  arrowsContainer.innerHTML = '';
  photoPreview.src = '';
  tagToggleButtons.forEach(btn => btn.classList.remove('active'));

  showToast('Report aggiunto');
  updateMiniReportsList();
}

function convertTagsToArray(tagsObj) {
  // Convert tags object to array format: [{letter, x, y, color}]
  const tagsArray = [];
  Object.keys(tagsObj).forEach(letter => {
    if (tagsObj[letter] && tagsObj[letter].visible) {
      tagsArray.push({
        letter: letter,
        x: tagsObj[letter].x,
        y: tagsObj[letter].y,
        color: tagsObj[letter].color
      });
    }
  });
  return tagsArray;
}

function renderReportsList() {
  if (reports.length === 0) {
    reportsList.innerHTML = `<div class="empty-state"> <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg><p>Nessun report disponibile</p><p class="text-secondary">Aggiungi il tuo primo report dalla scheda "Nuovo Report"</p></div>`;
    return;
  }
  reportsList.innerHTML = reports.map(r => renderReportCard(r)).join('');
}

function renderReportCard(report) {
  const date = new Date(report.dataCreazione).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
  const statusClass = report.stato === 'Risolto' ? 'risolto' : 'pendente';
  let imgHtml = '';
  if (report.foto && typeof report.foto === 'string' && report.foto.startsWith('data:image/')) {
    imgHtml = '<img src="' + report.foto + '" class="report-photo" alt="foto">';
  } else {
    imgHtml = '<div class="report-photo" style="height:200px;display:flex;align-items:center;justify-content:center;background:#EEE;border-radius:12px;color:#999;font-size:18px">Nessuna foto</div>';
  }
  const colorLetters = (report.activeColors || []).join(', ');
  let actionButtons = '';
  if (report.stato === 'Pendente') {
    if (report.previousVersion) {
      actionButtons = '<button class="btn btn--secondary btn--sm" onclick="undoLastEdit(\'' + report.id + '\')">Annulla</button>';
    } else {
      actionButtons = '<button class="btn btn--primary btn--sm" onclick="openResolveModal(\'' + report.id + '\')">Risolto</button>';
    }
  } else if (report.stato === 'Risolto') {
    actionButtons = '<button class="btn btn--secondary btn--sm" onclick="revertToPendente(\'' + report.id + '\')">Annulla</button>';
  }
  const editButtonDisabled = report.stato === 'Pendente' ? 'disabled' : '';
  const editButtonClass = report.stato === 'Pendente' ? 'btn btn--secondary btn--sm btn--disabled' : 'btn btn--secondary btn--sm';
  const editButtonTitle = report.stato === 'Pendente' ? 'Disponibile dopo aver risolto il report' : 'Modifica report';
  const editButtonHtml = '<button class="' + editButtonClass + '" onclick="openEditModal(\'' + report.id + '\')" ' + editButtonDisabled + ' title="' + editButtonTitle + '">Edita</button>';
  return '<div class="report-card"><div class="report-header"><div><div class="report-id">' + report.id + '</div><h3 class="report-title">' + escapeHtml(listTitle) + '</h3><div class="report-date">' + date + '</div></div><span class="report-status ' + statusClass + '">' + report.stato + '</span></div><div class="report-body"><div class="report-photo-container">' + imgHtml + '</div><div class="report-notes"><div class="report-notes-title">Note</div><div class="report-notes-text">' + (report.note ? escapeHtml(report.note) : '(vuoto)') + '</div></div>' + (report.noteElaborazione ? '<div class="report-notes"><div class="report-notes-title">Note intervento</div><div class="report-notes-text">' + escapeHtml(report.noteElaborazione) + '</div></div>' : '') + '</div><div class="report-actions">' + actionButtons + editButtonHtml + '<button class="btn btn--outline btn--sm" onclick="openDeleteModal(\'' + report.id + '\')">Elimina</button></div></div>';
}
  const date = new Date(report.dataCreazione).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
  const statusClass = report.stato === 'Risolto' ? 'risolto' : 'pendente';
  
  // Build color badges for display
  const colorLetters = (report.activeColors || []).join(', ');
  
  let actionButtons = '';
  if (report.stato === 'Pendente') {
    if (report.previousVersion) {
      actionButtons = `<button class="btn btn--secondary btn--sm" onclick="undoLastEdit('${report.id}')">Annulla</button>`;
    } else {
      actionButtons = `<button class="btn btn--primary btn--sm" onclick="openResolveModal('${report.id}')">Risolto</button>`;
    }
  } else if (report.stato === 'Risolto') {
    actionButtons = `<button class="btn btn--secondary btn--sm" onclick="revertToPendente('${report.id}')">Annulla</button>`;
  }
  
  const editButtonDisabled = report.stato === 'Pendente' ? 'disabled' : '';
  const editButtonClass = report.stato === 'Pendente' ? 'btn btn--secondary btn--sm btn--disabled' : 'btn btn--secondary btn--sm';
  const editButtonTitle = report.stato === 'Pendente' ? 'Disponibile dopo aver risolto il report' : 'Modifica report';
  const editButtonHtml = `<button class="${editButtonClass}" onclick="openEditModal('${report.id}')" ${editButtonDisabled} title="${editButtonTitle}">Edita</button>`;
  
  return `<div class="report-card"><div class="report-header"><div><div class="report-id">${report.id}</div><h3 class="report-title">${escapeHtml(listTitle)}</h3><div class="report-date">${date}</div></div><span class="report-status ${statusClass}">${report.stato}</span></div><div class="report-body"><div class="report-photo-container"><img src="${report.foto}" class="report-photo" alt="foto"></div><div class="report-notes"><div class="report-notes-title">Note</div><div class="report-notes-text">${report.note ? escapeHtml(report.note) : '(vuoto)'}</div></div>${report.noteElaborazione ? `<div class="report-notes"><div class="report-notes-title">Note intervento</div><div class="report-notes-text">${escapeHtml(report.noteElaborazione)}</div></div>` : ''}</div><div class="report-actions">${actionButtons}${editButtonHtml}<button class="btn btn--outline btn--sm" onclick="openDeleteModal('${report.id}')">Elimina</button></div></div>`;
}

function openResolveModal(id) {
  currentResolveId = id;
  document.getElementById('noteElaborazione').value = '';
  openModal(resolveModal);
}

function confirmResolve() {
  const noteElaborazione = document.getElementById('noteElaborazione').value.trim();
  const report = reports.find(r => r.id === currentResolveId);
  if (report) {
    report.stato = 'Risolto';
    report.noteElaborazione = noteElaborazione;
    renderReportsList();
    showToast('Report marcato come risolto');
    closeModal(resolveModal);
  }
}

function openEditModal(id) {
  const report = reports.find(r => r.id === id);
  if (!report) return;
  currentEditId = id;
  
  editOriginalState = {
    note: report.note,
    tags: JSON.parse(JSON.stringify(report.tags)),
    activeColors: [...(report.activeColors || [])],
    noteElaborazione: report.noteElaborazione,
    stato: report.stato,
    foto: report.foto
  };
  
  editPhotoPreview.src = report.fotoOriginal || report.foto;
  editCurrentTags = {};
  const editArrowsContainer = document.getElementById('editArrowsContainer');
  editArrowsContainer.innerHTML = '';
  
  // Reset toggle buttons
  editTagToggleButtons.forEach(btn => btn.classList.remove('active'));
  
  // Recreate tags from stored data
  if (report.tags && report.tags.length > 0) {
    report.tags.forEach(tag => {
      const letter = tag.letter;
      const position = {x: tag.x, y: tag.y};
      const arrowEl = createSingleArrowElement(position, tag.color, letter, editArrowsContainer, true);
      editArrowsContainer.appendChild(arrowEl);
      editCurrentTags[letter] = {
        x: tag.x,
        y: tag.y,
        color: tag.color,
        element: arrowEl,
        visible: (report.activeColors || []).includes(letter)
      };
      
      // Set toggle button state and visibility
      const btn = Array.from(editTagToggleButtons).find(b => b.dataset.letter === letter);
      if (btn && editCurrentTags[letter].visible) {
        btn.classList.add('active');
        arrowEl.style.display = 'block';
      } else if (arrowEl) {
        arrowEl.style.display = 'none';
      }
    });
  }
  
  editNoteField.value = report.note || '';
  
  if (report.stato === 'Risolto') {
    editNoteElaborazioneGroup.style.display = 'block';
    editNoteElaborazioneField.value = report.noteElaborazione || '';
  } else {
    editNoteElaborazioneGroup.style.display = 'none';
    editNoteElaborazioneField.value = '';
  }
  
  openModal(editModal);
}

function confirmEditReport() {
  const report = reports.find(r => r.id === currentEditId);
  if (!report) return;
  
  // Check if at least one tag is visible
  const visibleTags = Object.values(editCurrentTags).filter(tag => tag.visible);
  if (visibleTags.length === 0) {
    showToast('Attiva almeno un tag');
    return;
  }
  
  if (report.stato === 'Pendente') {
    report.previousVersion = {
      note: report.note,
      tags: JSON.parse(JSON.stringify(report.tags)),
      activeColors: [...(report.activeColors || [])],
      foto: report.foto,
      fotoOriginal: report.fotoOriginal
    };
    report.lastEditTimestamp = new Date().toISOString();
  }
  
  report.note = editNoteField.value || '';
  report.tags = convertTagsToArray(editCurrentTags);
  report.activeColors = Object.keys(editCurrentTags).filter(letter => editCurrentTags[letter].visible);
  
  if (report.stato === 'Risolto') {
    report.noteElaborazione = editNoteElaborazioneField.value || '';
  }
  
  report.foto = generatePhotoWithArrows(report.fotoOriginal, editCurrentTags);
  
  renderReportsList();
  updateMiniReportsList();
  closeModal(editModal);
  editOriginalState = null;
  showToast('Report aggiornato');
}

function openDeleteModal(id) {
  currentDeleteId = id;
  openModal(deleteModal);
}

function confirmDelete() {
  reports = reports.filter(r => r.id !== currentDeleteId);
  renderReportsList();
  showToast('Report eliminato');
  closeModal(deleteModal);
  currentDeleteId = null;
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleCancelEdit() {
  // Simply close modal without saving changes
  // Report state remains unchanged (Pendente stays Pendente, Risolto stays Risolto)
  closeModal(editModal);
  editOriginalState = null;
  showToast('Modifiche annullate');
}

function updateMiniReportsList() {
  if (reports.length === 0) {
    miniReportsList.style.display = 'none';
    return;
  }
  
  miniReportsList.style.display = 'block';
  
  miniReportsTableBody.innerHTML = reports.map(report => {
    const notePreview = (report.note || '').substring(0, 50) + ((report.note || '').length > 50 ? '...' : '');
    
    // Get active colors from report
    const activeColors = report.activeColors || [];
    
    const colorBadges = activeColors.map(letter => {
      const tag = report.tags.find(t => t.letter === letter);
      const color = tag ? tag.color : '#999999';
      return `<span class="mini-color-badge" style="background-color: ${color};">${letter}</span>`;
    }).join('');
    
    return `
      <tr>
        <td><span class="mini-table-id">${report.id}</span></td>
        <td><span class="mini-table-color">${colorBadges || '(nessuno)'}</span></td>
        <td><span class="mini-table-note">${escapeHtml(notePreview || '(vuoto)')}</span></td>
      </tr>
    `;
  }).join('');
}

function getColorLetter(color) {
  const colorMap = {
    '#FF0000': 'A',
    '#FFA500': 'B',
    '#FFFF00': 'C',
    '#0000FF': 'D',
    '#00FF00': 'E'
  };
  return colorMap[color.toUpperCase()] || '?';
}

function undoLastEdit(id) {
  const report = reports.find(r => r.id === id);
  if (!report || !report.previousVersion) return;
  
  report.note = report.previousVersion.note;
  report.tags = report.previousVersion.tags;
  report.activeColors = report.previousVersion.activeColors || [];
  report.foto = report.previousVersion.foto;
  if (report.previousVersion.fotoOriginal) {
    report.fotoOriginal = report.previousVersion.fotoOriginal;
  }
  
  delete report.previousVersion;
  delete report.lastEditTimestamp;
  
  renderReportsList();
  updateMiniReportsList();
  showToast('Modifiche annullate, report ripristinato');
}

// Revert Risolto report back to Pendente
function revertToPendente(id) {
  const report = reports.find(r => r.id === id);
  if (!report || report.stato !== 'Risolto') return;
  
  report.stato = 'Pendente';
  report.noteElaborazione = '';
  
  renderReportsList();
  updateMiniReportsList();
  showToast('Report tornato a Pendente');
}

// Make functions available globally for onclick handlers
window.openResolveModal = openResolveModal;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.undoLastEdit = undoLastEdit;
window.revertToPendente = revertToPendente;

function generatePhotoWithArrows(photoSrc, tagsObj) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.src = photoSrc;
  
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Draw all visible arrows
  Object.keys(tagsObj).forEach(letter => {
    const tag = tagsObj[letter];
    if (!tag.visible) return;
    
    const x = (tag.x / 100) * canvas.width;
    const y = (tag.y / 100) * canvas.height;
    
    const arrowSize = Math.max(40, canvas.width * 0.06);
    const arrowWidth = Math.max(6, canvas.width * 0.01);
    
    ctx.save();
    ctx.strokeStyle = tag.color;
    ctx.fillStyle = tag.color;
    ctx.lineWidth = arrowWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.translate(x, y);
    ctx.rotate(-135 * Math.PI / 180);
    
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize);
    ctx.lineTo(0, arrowSize * 0.75);
    ctx.stroke();
    
    const headSize = arrowSize * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, arrowSize * 0.75);
    ctx.lineTo(-headSize, arrowSize * 0.75 - headSize);
    ctx.lineTo(headSize, arrowSize * 0.75 - headSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  });
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

// ====================== EXPORT JSON ===========================
// Nuovo sistema robusto con foto base64, metadati e struttura validata
function exportToJSON() {
  if (reports.length === 0) {
    showToast('Nessun report da esportare');
    return;
  }

  // Estrai i dati dei report secondo il nuovo schema richiesto (vedi istruzioni)
  const exportReports = reports.map(report => {
    // Usare la foto originale caricata (base64) con frecce
    const fotoDataUrl = report.fotoOriginal || report.foto;
    // Verifica che sia in formato base64 "data:image/"
    let fotoWidth = report.fotoOriginalWidth || window.currentPhotoWidth || 800;
    let fotoHeight = report.fotoOriginalHeight || window.currentPhotoHeight || 600;
    const validFoto = fotoDataUrl && fotoDataUrl.startsWith('data:image/');
    return {
      id: report.id,
      dataCreazione: report.dataCreazione,
      stato: report.stato,
      note: report.note || '',
      noteIntervento: report.noteElaborazione || '',
      activeColors: report.activeColors || [],
      tags: buildExportTagsObject(report.tags, report.activeColors),
      fotoDataUrl: validFoto ? fotoDataUrl : null,
      fotoWidth: fotoWidth,
      fotoHeight: fotoHeight
    };
  });

  const exportObj = {
    version: "1.0",
    listTitle: listTitle,
    exportDate: new Date().toISOString(),
    totalReports: reports.length,
    reports: exportReports
  };

  // Genera e scarica il file
  const jsonString = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_report_${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`Esportati ${reports.length} report con foto`);
}

// Trasforma array tags [{letter,x,y,color}] + activeColors in oggetto richiesto
function buildExportTagsObject(tagsArray, activeColors) {
  // Richiesto formato: {A: {x, y}, B: null, ...}
  const out = {A: null, B: null, C: null, D: null, E: null};
  if (!Array.isArray(tagsArray)) return out;
  tagsArray.forEach(tag => {
    if (activeColors && activeColors.includes(tag.letter)) {
      out[tag.letter] = {x: tag.x, y: tag.y};
    }
  });
  return out;
}
  if (reports.length === 0) {
    showToast('Nessun report da esportare');
    return;
  }
  
  // Create export data structure
  const exportData = {
    listTitle: listTitle,
    exportDate: new Date().toISOString(),
    reports: reports.map(report => {
      // Use fotoOriginal (base64 without arrows) or fall back to foto
      const photoToExport = report.fotoOriginal || report.foto;
      
      // Verify photo has proper base64 format
      if (!photoToExport || !photoToExport.startsWith('data:image/')) {
        console.warn('Report', report.id, 'has invalid photo format');
      }
      
      return {
        id: report.id,
        dataCreazione: report.dataCreazione,
        stato: report.stato,
        note: report.note || '',
        noteElaborazione: report.noteElaborazione || '',
        tags: report.tags || [],
        activeColors: report.activeColors || [],
        fotoBase64: photoToExport,
        fotoOriginalWidth: report.fotoOriginalWidth || 800,
        fotoOriginalHeight: report.fotoOriginalHeight || 600,
        previousVersion: report.previousVersion || null,
        lastEditTimestamp: report.lastEditTimestamp || null
      };
    })
  };
  
  // Convert to JSON string with formatting
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create and download file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date();
  const dateStr = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
  link.href = url;
  link.download = `report_export_${dateStr}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showToast(`Esportati ${reports.length} report con foto`);
}

// ====================== IMPORT JSON ===========================
// Sistema robusto per import con validazione, errori e foto base64
function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Solo file .json
  if (!file.name.endsWith('.json')) {
    alert('Seleziona un file JSON valido');
    importFileInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedText = e.target.result;
      let importedData;
      try {
        importedData = JSON.parse(importedText);
      } catch (err) {
        alert('File JSON non valido');
        importFileInput.value = '';
        return;
      }
      if (!importedData.reports || !Array.isArray(importedData.reports)) {
        alert('Formato file non riconosciuto');
        importFileInput.value = '';
        return;
      }
      // Step: verifica (e log) ogni foto
      importedData.reports.forEach((report, i) => {
        if (report.fotoDataUrl && typeof report.fotoDataUrl === 'string') {
          if (!report.fotoDataUrl.startsWith('data:image/')) {
            console.warn('Foto nel report', report.id, 'non valida:', report.fotoDataUrl.slice(0,50));
          } else {
            console.log('Foto del report', report.id, 'lunghezza:', report.fotoDataUrl.length);
          }
        } else {
          console.warn('Report', report.id, 'senza foto base64 valida');
        }
      });
      // Store dati temporaneamente per conferma aggiunta/sostituzione lista
      pendingImportData = importedData;
      document.getElementById('importCount').textContent = importedData.reports.length;
      if (reports.length === 0) {
        confirmImport(true); // import diretto
      } else {
        openModal(importModal); // chiedi conferma all'utente
      }
    } catch (error) {
      alert('Errore lettura file: ' + error.message);
      console.error(error);
      importFileInput.value = '';
    }
    importFileInput.value = '';
  };
  reader.readAsText(file);
}
  const file = event.target.files[0];
  if (!file) return;
  
  // Verify it's a JSON file
  if (!file.name.endsWith('.json')) {
    showToast('Seleziona un file JSON valido');
    importFileInput.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      
      console.log('Import data loaded:', importedData);
      
      // Validate data structure
      if (!importedData.listTitle || !Array.isArray(importedData.reports)) {
        showToast('File JSON non valido: struttura mancante');
        importFileInput.value = '';
        return;
      }
      
      // Validate each report has required fields and log photo data
      const isValid = importedData.reports.every((r, index) => {
        const hasRequiredFields = r.id && r.dataCreazione && r.stato && r.fotoBase64;
        
        if (!hasRequiredFields) {
          console.error('Report', index, 'missing required fields:', r);
        } else {
          // Check photo format
          const photoPreview = r.fotoBase64.substring(0, 50);
          console.log('Report', r.id, 'photo preview:', photoPreview);
        }
        
        return hasRequiredFields;
      });
      
      if (!isValid) {
        showToast('File JSON non valido: dati report incompleti');
        importFileInput.value = '';
        return;
      }
      
      // Store imported data and show confirmation modal
      pendingImportData = importedData;
      document.getElementById('importCount').textContent = importedData.reports.length;
      
      if (reports.length === 0) {
        // No existing reports, just import directly
        confirmImport(true);
      } else {
        // Ask user what to do
        openModal(importModal);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      showToast('Errore nella lettura del file JSON');
    }
    
    // Reset file input
    importFileInput.value = '';
  };
  
  reader.readAsText(file);
}

// ====================== IMPORT LOGICA e RICOSTRUZIONE ================
function confirmImport(replace) {
  if (!pendingImportData) return;
  try {
    const imported = pendingImportData;
    const importedReports = (imported.reports || []).map((r, i) => {
      let fotoBase64 = (typeof r.fotoDataUrl === 'string' && r.fotoDataUrl.startsWith('data:image/')) ? r.fotoDataUrl : null;
      let tagsObj = r.tags || {A: null, B: null, C: null, D: null, E: null};
      // Ricostruisci array tag {letter, x, y, color}
      const tagsArray = Object.keys(tagsObj).map(letter => {
        if (tagsObj[letter]) {
          // Default color per letter (come nell'app)
          const colorMap = {A:'#FF0000',B:'#FFA500',C:'#FFFF00',D:'#0000FF',E:'#00FF00'};
          return {
            letter,
            x: tagsObj[letter].x,
            y: tagsObj[letter].y,
            color: colorMap[letter]
          };
        }
        return null;
      }).filter(Boolean);
      // Ricostruisci foto con frecce
      let activeColors = Array.isArray(r.activeColors) ? r.activeColors : [];
      // Genera foto con frecce a partire dalla base64
      let tagsForDraw = {};
      tagsArray.forEach(tag => {
        tagsForDraw[tag.letter] = {x: tag.x, y: tag.y, color: tag.color, visible: activeColors.includes(tag.letter)};
      });
      let fotoWithArrows = fotoBase64 ? generatePhotoWithArrows(fotoBase64, tagsForDraw) : null;
      return {
        id: r.id,
        foto: fotoWithArrows,
        fotoOriginal: fotoBase64,
        fotoOriginalWidth: r.fotoWidth || 800,
        fotoOriginalHeight: r.fotoHeight || 600,
        tags: tagsArray,
        activeColors: activeColors,
        note: r.note || '',
        dataCreazione: r.dataCreazione,
        stato: r.stato,
        noteElaborazione: r.noteIntervento || '',
        previousVersion: null,
        lastEditTimestamp: null
      };
    });
    if (replace) {
      reports = importedReports;
      listTitle = pendingImportData.listTitle;
      listTitleDisplay.textContent = listTitle;
      reportCounter = Math.max(...reports.map(r => {const num = parseInt(r.id.split('-')[0]);return isNaN(num)?0:num;}),0);
      showToast(`Importati ${reports.length} report con foto`);
    } else {
      reports.push(...importedReports);
      reportCounter = Math.max(...reports.map(r => {const num = parseInt(r.id.split('-')[0]);return isNaN(num)?0:num;}),reportCounter);
      showToast(`Aggiunti ${importedReports.length} report con foto`);
    }
    renderReportsList();
    updateMiniReportsList();
    // Switch tab
    const listaTab = Array.from(tabButtons).find(btn => btn.dataset.tab === 'lista');
    if (listaTab) handleTabSwitch(listaTab);
  } catch (error) {
    alert("Errore lettura file: " + error.message);
    console.error(error);
  }
  closeModal(importModal);
  pendingImportData = null;
}
  if (!pendingImportData) return;
  
  try {
    console.log('Starting import processing for', pendingImportData.reports.length, 'reports');
    
    // Process imported reports
    const importedReports = pendingImportData.reports.map((r, index) => {
      console.log(`Processing report ${index + 1}/${pendingImportData.reports.length}:`, r.id);
      
      // CRITICAL: Restore the original photo from fotoBase64
      const originalPhoto = r.fotoBase64;
      
      if (!originalPhoto) {
        console.error('Missing fotoBase64 for report:', r.id);
        throw new Error('Photo data missing in imported report');
      }
      
      // Verify it's a valid base64 image string
      if (!originalPhoto.startsWith('data:image/')) {
        console.error('Invalid photo format for report:', r.id, '- Photo starts with:', originalPhoto.substring(0, 30));
        throw new Error('Invalid photo format in imported report');
      }
      
      console.log('Photo restored for', r.id, '- Length:', originalPhoto.length, 'chars');
      
      // Regenerate photo with arrows from base64 and tags
      const tagsObj = {};
      (r.tags || []).forEach(tag => {
        tagsObj[tag.letter] = {
          x: tag.x,
          y: tag.y,
          color: tag.color,
          visible: (r.activeColors || []).includes(tag.letter)
        };
      });
      
      // Generate the display photo (with arrows)
      console.log('Generating photo with arrows for', r.id, '- Tags:', Object.keys(tagsObj).length);
      const photoWithArrows = generatePhotoWithArrows(originalPhoto, tagsObj);
      console.log('Photo with arrows generated for', r.id, '- Length:', photoWithArrows.length, 'chars');
      
      return {
        id: r.id,
        foto: photoWithArrows,
        fotoOriginal: originalPhoto,
        fotoOriginalWidth: r.fotoOriginalWidth || 800,
        fotoOriginalHeight: r.fotoOriginalHeight || 600,
        tags: r.tags || [],
        activeColors: r.activeColors || [],
        note: r.note || '',
        dataCreazione: r.dataCreazione,
        stato: r.stato,
        noteElaborazione: r.noteElaborazione || '',
        previousVersion: r.previousVersion || null,
        lastEditTimestamp: r.lastEditTimestamp || null
      };
    });
    
    console.log('Successfully processed', importedReports.length, 'reports');
    
    if (replace) {
      // Replace entire list
      reports = importedReports;
      listTitle = pendingImportData.listTitle;
      listTitleDisplay.textContent = listTitle;
      
      // Update counter to avoid ID conflicts
      reportCounter = Math.max(...reports.map(r => {
        const num = parseInt(r.id.split('-')[0]);
        return isNaN(num) ? 0 : num;
      }), 0);
      
      console.log('List replaced with', reports.length, 'reports');
      showToast(`Lista sostituita: ${importedReports.length} report caricati con foto`);
    } else {
      // Add to existing reports
      reports.push(...importedReports);
      
      // Update counter
      reportCounter = Math.max(...reports.map(r => {
        const num = parseInt(r.id.split('-')[0]);
        return isNaN(num) ? 0 : num;
      }), reportCounter);
      
      console.log('Added reports, total now:', reports.length);
      showToast(`Aggiunti ${importedReports.length} report con foto`);
    }
    
    // Update UI
    console.log('Updating UI with', reports.length, 'total reports');
    renderReportsList();
    updateMiniReportsList();
    
    // Switch to reports list tab
    const listaTab = Array.from(tabButtons).find(btn => btn.dataset.tab === 'lista');
    if (listaTab) {
      handleTabSwitch(listaTab);
    }
    
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Import processing error:', error);
    showToast('Errore nell\'importazione dei dati');
  }
  
  closeModal(importModal);
  pendingImportData = null;
}

function exportToPDF() {
  if (reports.length === 0) {
    showToast('Nessun report da esportare');
    return;
  }
  
  if (typeof window.jspdf === 'undefined') {
    showToast('Errore: libreria PDF non caricata');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 25;
  const maxContentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Helper function to add text with wrapping
  const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };
  
  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  // HEADER
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(listTitle, margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const generatedDate = new Date().toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
  doc.text(`Generato il: ${generatedDate}`, margin, yPosition);
  yPosition += 8;
  
  // Separator line after header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;
  
  // REPORTS
  reports.forEach((report, index) => {
    // Check if we need a new page for this report (estimate ~100 units needed)
    checkPageBreak(100);
    
    // Report title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Report #${index + 1} - ID: ${report.id}`, margin, yPosition);
    yPosition += 8;
    
    // Report metadata
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const date = new Date(report.dataCreazione).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
    doc.text(`Data: ${date}`, margin, yPosition);
    yPosition += 6;
    
    doc.text(`Stato: ${report.stato}`, margin, yPosition);
    yPosition += 6;
    
    // Tag colors
    const colorLetters = (report.activeColors || []).join(', ');
    if (colorLetters) {
      doc.text(`Tag Colorati: ${colorLetters}`, margin, yPosition);
      yPosition += 6;
    }
    
    yPosition += 6; // Space before image
    
    // IMAGE - Maintain EXACT aspect ratio from original photo dimensions
    try {
      // Use stored original dimensions for accurate aspect ratio
      const imgOriginalWidth = report.fotoOriginalWidth || 800;
      const imgOriginalHeight = report.fotoOriginalHeight || 600;
      const aspectRatio = imgOriginalHeight / imgOriginalWidth;
      
      // Max width in PDF units (500px equivalent is about 130 units at 72dpi)
      const maxImgWidth = Math.min(130, maxContentWidth);
      let imgWidth = maxImgWidth;
      let imgHeight = imgWidth * aspectRatio;
      
      // If image is too tall, scale it down proportionally
      const maxImgHeight = 100;
      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = imgHeight / aspectRatio;
      }
      
      // Check if image fits on current page
      if (checkPageBreak(imgHeight + 20)) {
        // New page was added
      }
      
      doc.addImage(report.foto, 'JPEG', margin, yPosition, imgWidth, imgHeight, undefined, 'FAST');
      yPosition += imgHeight + 8;
      
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      doc.setFontSize(10);
      doc.text('[Immagine non disponibile]', margin, yPosition);
      yPosition += 8;
    }
    
    // Space after image
    yPosition += 4;
    
    // Check page break before notes section
    checkPageBreak(30);
    
    // NOTES SECTION - Label on separate line
    if (report.note) {
      checkPageBreak(20);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Note:', margin, yPosition);
      yPosition += 6;
      
      doc.setFont(undefined, 'normal');
      const noteText = report.note || '(vuoto)';
      yPosition = addWrappedText(noteText, margin, yPosition, maxContentWidth, 6);
      yPosition += 8;
    }
    
    // NOTE INTERVENTO SECTION - Label on separate line (only if Risolto)
    if (report.stato === 'Risolto' && report.noteElaborazione) {
      checkPageBreak(20);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Note intervento:', margin, yPosition);
      yPosition += 6;
      
      doc.setFont(undefined, 'normal');
      const noteElabText = report.noteElaborazione || '(vuoto)';
      yPosition = addWrappedText(noteElabText, margin, yPosition, maxContentWidth, 6);
      yPosition += 8;
    }
    
    // Separator line between reports
    yPosition += 4;
    checkPageBreak(10);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;
  });
  
  doc.save(`${listTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`);
  showToast('PDF esportato con successo');
}