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
const resetAppBtn = document.getElementById('resetApp');
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
  document.getElementById('exportDOCX').addEventListener('click', exportDOCX);
  resetAppBtn.addEventListener('click', resetApp);
  
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
  arrow.innerHTML = `<svg width="50" height="50" viewBox="0 0 50 50"><g transform="translate(25, 25) rotate(-135)"><path d="M0,-20 L0,15 M0,15 L-8,7 M0,15 L8,7" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g></svg><span class="arrow-letter">${letter}</span>`;
  
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

  console.log('=== MERGE FOTO + TAG ===' );
  console.log('Merging photo with', visibleTags.length, 'visible tags');
  
  // Convert currentTags object to array format for storage (reference data)
  const tags = convertTagsToArray(currentTags);
  const activeColors = Object.keys(currentTags).filter(letter => currentTags[letter].visible);
  
  // MERGE: Generate single combined image (photo + tags with letters) - ASYNC
  generatePhotoWithArrows(currentPhoto, currentTags)
    .then(mergedPhoto => {
      console.log('Merged image created:', mergedPhoto.length, 'chars');
      
      const report = {
        id: generateReportId(),
        foto: mergedPhoto,  // COMBINED IMAGE: photo + tags with letters
        fotoOriginal: currentPhoto,  // Keep original for re-editing
        fotoOriginalWidth: window.currentPhotoWidth || 800,
        fotoOriginalHeight: window.currentPhotoHeight || 600,
        tags: tags,  // Reference data
        activeColors: activeColors,  // Reference data
        note: note,
        dataCreazione: new Date().toISOString(),
        stato: 'Pendente',
        noteElaborazione: ''
      };
      reports.push(report);

      console.log('Report added with merged photo');

      // reset
      reportForm.reset();
      currentPhoto = null;
      currentTags = {};
      photoPreviewContainer.style.display = 'none';
      arrowsContainer.innerHTML = '';
      photoPreview.src = '';
      tagToggleButtons.forEach(btn => btn.classList.remove('active'));

      showToast('Report aggiunto con foto combinata');
      updateMiniReportsList();
    })
    .catch(error => {
      console.error('Error creating merged photo:', error);
      showToast('Errore nella creazione della foto combinata');
    });
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
  
  console.log('=== EDIT: RE-MERGE FOTO + TAG ===' );
  console.log('Re-merging with', visibleTags.length, 'visible tags');
  
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
  
  // RE-MERGE: Generate new combined image with updated tags - ASYNC
  generatePhotoWithArrows(report.fotoOriginal, editCurrentTags)
    .then(mergedPhoto => {
      report.foto = mergedPhoto;
      
      console.log('Report re-merged with new tags');
      
      renderReportsList();
      updateMiniReportsList();
      closeModal(editModal);
      editOriginalState = null;
      showToast('Report aggiornato con foto combinata');
    })
    .catch(error => {
      console.error('Error re-merging photo:', error);
      showToast('Errore nell\'aggiornamento della foto');
    });
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

function resetApp() {
  const confirmed = confirm('Questo eliminerà TUTTI i report e ricomincia da capo. Continuare?');
  if (!confirmed) return;
  
  try {
    console.log('=== COMPLETE APP RESET ===' );
    
    // Reset ALL in-memory data
    reports = [];
    reportCounter = 0;
    listTitle = '';
    currentPhoto = null;
    currentTags = {};
    currentResolveId = null;
    currentDeleteId = null;
    currentEditId = null;
    editCurrentTags = {};
    editOriginalState = null;
    pendingImportData = null;
    
    // Reset global photo dimensions
    if (window.currentPhotoWidth) delete window.currentPhotoWidth;
    if (window.currentPhotoHeight) delete window.currentPhotoHeight;
    
    // Clear mini reports list
    miniReportsList.style.display = 'none';
    miniReportsTableBody.innerHTML = '';
    
    // Clear and reset form completely
    reportForm.reset();
    photoPreviewContainer.style.display = 'none';
    arrowsContainer.innerHTML = '';
    photoPreview.src = '';
    fotoInput.value = '';
    document.getElementById('note').value = '';
    tagToggleButtons.forEach(btn => btn.classList.remove('active'));
    
    // Clear reports list
    reportsList.innerHTML = '';
    
    // Reset list title display
    listTitleDisplay.textContent = 'Report Fotografico';
    
    // Close any open modals
    closeModal(resolveModal);
    closeModal(deleteModal);
    closeModal(editModal);
    closeModal(importModal);
    closeModal(editTitleModal);
    
    // Reset tab to "Aggiungi Report"
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    const nuovoTab = Array.from(tabButtons).find(btn => btn.dataset.tab === 'nuovo');
    if (nuovoTab) {
      nuovoTab.classList.add('active');
      document.getElementById('tab-nuovo').classList.add('active');
    }
    
    // Show list title screen for new list name
    mainApp.style.display = 'none';
    listTitleScreen.style.display = 'flex';
    listTitleInput.value = '';
    listTitleInput.focus();
    
    console.log('Reset completed successfully');
    console.log('Memory cleared: reports, tags, photos, all states');
    showToast('✓ App completamente resettata! Inserisci il nome della nuova lista');
    
  } catch (error) {
    console.error('Error during reset:', error);
    alert('Errore durante il reset: ' + error.message);
  }
}

// Make functions available globally for onclick handlers
window.openResolveModal = openResolveModal;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.undoLastEdit = undoLastEdit;
window.revertToPendente = revertToPendente;

function generatePhotoWithArrows(photoSrc, tagsObj) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    
    img.onload = function() {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Draw all visible arrows with letters
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
    
    // Draw arrow shaft
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize);
    ctx.lineTo(0, arrowSize * 0.75);
    ctx.stroke();
    
    // Draw arrow head
    const headSize = arrowSize * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, arrowSize * 0.75);
    ctx.lineTo(-headSize, arrowSize * 0.75 - headSize);
    ctx.lineTo(headSize, arrowSize * 0.75 - headSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Draw letter next to arrow (bottom-right position)
    // RADDOPPIATO: da ~18px a ~36px (100% più grande)
    const letterSize = Math.max(36, canvas.width * 0.05);
    const letterOffsetX = arrowSize * 0.4;
    const letterOffsetY = arrowSize * 0.4;
    
    ctx.save();
    ctx.font = `bold ${letterSize}px Arial, sans-serif`;
    // STESSO COLORE della freccia (non più bianco con bordo nero)
    ctx.fillStyle = tag.color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = Math.max(4, letterSize * 0.12);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position letter at bottom-right of arrow
    const letterX = x + letterOffsetX;
    const letterY = y + letterOffsetY;
    
    // Draw text outline (stroke) for better visibility
    ctx.strokeText(letter, letterX, letterY);
    // Draw text fill with same color as arrow
    ctx.fillText(letter, letterX, letterY);
    
    ctx.restore();
  });
  
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = function(error) {
      console.error('Error loading image for merge:', error);
      reject(error);
    };
    
    img.src = photoSrc;
  });
}

function exportToJSON() {
  if (reports.length === 0) {
    showToast('Nessun report da esportare');
    return;
  }
  
  console.log('=== STARTING EXPORT ===' );
  console.log('Total reports to export:', reports.length);
  
  // Create export data structure with COMPLETE photo validation
  const exportData = {
    listTitle: listTitle,
    exportDate: new Date().toISOString(),
    reports: reports.map((report, index) => {
      // Use fotoOriginal (base64 without arrows) for export
      const photoToExport = report.fotoOriginal || report.foto;
      
      // CRITICAL VALIDATION: Verify photo data is complete and valid
      if (!photoToExport) {
        console.error(`Report ${report.id}: NO PHOTO DATA FOUND!`);
        if (!confirm(`Report ${report.id} non ha foto. Vuoi comunque esportare?`)) {
          throw new Error('Export cancelled by user');
        }
      } else if (!photoToExport.startsWith('data:image/')) {
        console.error(`Report ${report.id}: Invalid photo format - does not start with data:image/`);
        console.error('Photo preview:', photoToExport.substring(0, 50));
      } else if (photoToExport.length < 1000) {
        console.warn(`Report ${report.id}: Photo data seems too short (${photoToExport.length} chars)`);
      } else {
        console.log(`Report ${report.id}: Photo OK - ${photoToExport.length} chars`);
      }
      
      // Convert tags array to complete object format with all 5 positions (A-E)
      const tagsObject = {
        A: null,
        B: null,
        C: null,
        D: null,
        E: null
      };
      
      // Fill in positions from stored tags
      if (report.tags && Array.isArray(report.tags)) {
        report.tags.forEach(tag => {
          if (tag.letter && tag.x !== undefined && tag.y !== undefined) {
            tagsObject[tag.letter] = {x: tag.x, y: tag.y};
          }
        });
      }
      
      console.log(`Export report ${report.id}:`);
      console.log('Tags:', tagsObject);
      console.log('Active colors:', report.activeColors || []);
      
      return {
        id: report.id,
        dataCreazione: report.dataCreazione,
        stato: report.stato,
        note: report.note || '',
        noteElaborazione: report.noteElaborazione || '',
        tags: tagsObject,
        activeColors: report.activeColors || [],
        fotoDataUrl: photoToExport,
        fotoOriginalWidth: report.fotoOriginalWidth || 800,
        fotoOriginalHeight: report.fotoOriginalHeight || 600,
        previousVersion: report.previousVersion || null,
        lastEditTimestamp: report.lastEditTimestamp || null
      };
    })
  };
  
  console.log('Export structure created with', exportData.reports.length, 'reports');
  
  // Validate each report in export data
  exportData.reports.forEach((r, i) => {
    if (r.fotoDataUrl) {
      console.log(`Export Report ${i + 1}: Photo length = ${r.fotoDataUrl.length} chars`);
    } else {
      console.error(`Export Report ${i + 1}: MISSING PHOTO!`);
    }
  });
  
  // Convert to JSON string with formatting
  const jsonString = JSON.stringify(exportData, null, 2);
  console.log('JSON size:', (jsonString.length / 1024).toFixed(2), 'KB');
  
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
  
  console.log('=== EXPORT COMPLETED ===' );
  showToast(`Esportati ${reports.length} report con foto combinate (tag+lettere)`);
  console.log('Note: Exported photos contain merged tags with letters');
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Verifica che sia un file JSON
  if (!file.name.endsWith('.json')) {
    alert('Errore: seleziona un file .json');
    importFileInput.value = '';
    return;
  }
  
  console.log('=== STARTING IMPORT ===' );
  console.log('Reading file:', file.name);
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      // Leggi il contenuto del file
      const fileContent = e.target.result;
      
      if (!fileContent || typeof fileContent !== 'string') {
        throw new Error('File non valido');
      }
      
      // Parse JSON con validazione
      let parsedData = null;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('File JSON non valido: ' + parseError.message);
      }
      
      if (!parsedData) {
        throw new Error('Impossibile leggere il file');
      }
      
      console.log('JSON parsed successfully');
      console.log('Parsed data type:', typeof parsedData);
      console.log('Parsed data:', parsedData);
      
      // Store imported data and show confirmation modal
      pendingImportData = parsedData;
      
      // Validate before proceeding
      if (!parsedData.reports || !Array.isArray(parsedData.reports)) {
        throw new Error('Nessun report trovato nel file');
      }
      
      document.getElementById('importCount').textContent = parsedData.reports.length;
      
      if (reports.length === 0) {
        // No existing reports, just import directly
        console.log('No existing reports, importing directly...');
        confirmImport(true);
      } else {
        // Ask user what to do
        console.log('Existing reports found, showing modal...');
        openModal(importModal);
      }
      
    } catch (error) {
      console.error('Errore lettura file:', error);
      console.error('Error stack:', error.stack);
      alert('Errore nell\'import del file: ' + error.message);
      showToast('Errore: ' + error.message);
    }
    
    // Reset file input
    importFileInput.value = '';
  };
  
  reader.onerror = function(error) {
    console.error('Errore FileReader:', error);
    alert('Errore nella lettura del file');
    importFileInput.value = '';
  };
  
  // Leggi file come testo
  reader.readAsText(file);
}

function confirmImport(replace) {
  try {
    // VALIDAZIONE CRITICA: Verifica che importedData NON sia null
    if (!pendingImportData || typeof pendingImportData !== 'object') {
      throw new Error('Dati import non validi (null o non object)');
    }
    
    // VALIDAZIONE: Verifica che reports esista ed sia un array
    if (!Array.isArray(pendingImportData.reports)) {
      throw new Error('Nessun report trovato nel file');
    }
    
    console.log('\n=== PROCESSING IMPORT (COMBINED IMAGES) ===' );
    console.log('Mode:', replace ? 'REPLACE' : 'ADD');
    console.log('Reports to process:', pendingImportData.reports.length);
    console.log('Dati import ricevuti:', pendingImportData);
    console.log('Numero report:', pendingImportData.reports.length);
    
    // Carica reports con validazione
    const importedReports = pendingImportData.reports
      .filter(r => r && typeof r === 'object') // Filtra solo report validi
      .map((r, index) => {
      console.log(`\n--- Processing Report ${index + 1}/${pendingImportData.reports.length}: ${r.id || 'unknown'} ---`);
      
      // VALIDAZIONE: Verifica campi obbligatori
      if (!r.id || !r.dataCreazione) {
        console.warn('WARNING: Report missing required fields, using defaults');
      }
      
      // Load photo DIRECTLY from fotoDataUrl (already contains merged tags+letters)
      const photoData = r.fotoDataUrl || r.fotoBase64;
      
      if (!photoData) {
        console.warn('WARNING: No photo data found for report', r.id, '- continuing import');
      } else if (!photoData.startsWith('data:image/')) {
        console.warn('WARNING: Invalid photo format for report', r.id, '- continuing anyway');
      } else {
        console.log('Combined photo loaded (foto+tags+letters):', photoData.length, 'chars');
      }
      
      // Convert tags from object format {A: {x, y}, B: null, ...} to array format
      let tagsArray = [];
      let activeColorsArray = r.activeColors || [];
      
      if (r.tags) {
        if (typeof r.tags === 'object' && !Array.isArray(r.tags)) {
          // New format: object with A-E keys
          console.log('Loading tags from object format');
          const tagColors = {A: '#FF0000', B: '#FFA500', C: '#FFFF00', D: '#0000FF', E: '#00FF00'};
          
          Object.keys(r.tags).forEach(letter => {
            const tagData = r.tags[letter];
            if (tagData && tagData.x !== undefined && tagData.y !== undefined) {
              tagsArray.push({
                letter: letter,
                x: tagData.x,
                y: tagData.y,
                color: tagColors[letter]
              });
              console.log(`  Tag ${letter}: x=${tagData.x}, y=${tagData.y}`);
            } else {
              console.log(`  Tag ${letter}: null (not active)`);
            }
          });
        } else if (Array.isArray(r.tags)) {
          // Legacy format: already array
          console.log('Loading tags from array format (legacy)');
          tagsArray = r.tags;
        }
      }
      
      console.log('Tags loaded:', tagsArray.length);
      console.log('Active colors:', activeColorsArray);
      
      // DIRECT ASSIGNMENT - Photo already contains arrows+letters merged from export
      return {
        id: r.id || 'unknown',
        foto: photoData || '',
        fotoOriginal: photoData || '',
        fotoOriginalWidth: r.fotoOriginalWidth || 800,
        fotoOriginalHeight: r.fotoOriginalHeight || 600,
        tags: tagsArray,
        activeColors: activeColorsArray,
        note: r.note || '',
        dataCreazione: r.dataCreazione || new Date().toISOString(),
        stato: r.stato || 'Pendente',
        noteElaborazione: r.noteElaborazione || '',
        previousVersion: r.previousVersion || null,
        lastEditTimestamp: r.lastEditTimestamp || null
      };
    });
    
    if (importedReports.length === 0) {
      throw new Error('Nessun report valido nel file');
    }
    
    console.log('\n=== ALL REPORTS LOADED SUCCESSFULLY ===' );
    console.log('Total imported:', importedReports.length);
    
    // Aggiorna list title (CON CONTROLLO NULL)
    if (pendingImportData.listTitle && typeof pendingImportData.listTitle === 'string') {
      listTitle = pendingImportData.listTitle;
      listTitleDisplay.textContent = listTitle;
    }
    
    // Rigenerazione foto SEMPLIFICATA
    console.log('\n=== REGENERATING PHOTOS WITH VISIBLE TAGS ===' );
    
    const regenerationPromises = importedReports.map((report, idx) => {
      return new Promise((resolve) => {
        try {
          // Skip se non ha foto o tag
          if (!report.fotoOriginal || !report.tags || !report.activeColors || report.activeColors.length === 0) {
            console.log(`Skipping regeneration for report ${idx + 1}: no photo/tags/active colors`);
            resolve();
            return;
          }
          
          // Converti tags array in object format per generatePhotoWithArrows
          const tagsObj = {};
          report.tags.forEach(tag => {
            tagsObj[tag.letter] = {
              x: tag.x,
              y: tag.y,
              color: tag.color,
              visible: (report.activeColors || []).includes(tag.letter)
            };
          });
          
          console.log(`Regenerating photo for report ${idx + 1}: ${report.id}`);
          
          // Merge foto con tag
          generatePhotoWithArrows(report.fotoOriginal, tagsObj)
            .then(mergedImage => {
              if (mergedImage) {
                report.foto = mergedImage;
                console.log(`  ✓ Photo regenerated successfully`);
              }
              resolve();
            })
            .catch(error => {
              console.warn('Merge failed for report ' + report.id, error);
              resolve(); // Continua comunque
            });
        } catch (error) {
          console.warn('Error processing report', error);
          resolve();
        }
      });
    });
    
    // Attendi tutti i merge
    Promise.all(regenerationPromises)
      .then(() => {
        console.log('Import completo');
        
        if (replace) {
          // Replace entire list
          reports = importedReports;
          
          // Update counter to avoid ID conflicts
          reportCounter = Math.max(...reports.map(r => {
            const num = parseInt(r.id.split('-')[0]);
            return isNaN(num) ? 0 : num;
          }), 0);
          
          console.log('List REPLACED - New list has', reports.length, 'reports');
          showToast(`Lista sostituita: ${importedReports.length} report caricati`);
        } else {
          // Add to existing reports
          const previousCount = reports.length;
          reports.push(...importedReports);
          
          // Update counter
          reportCounter = Math.max(...reports.map(r => {
            const num = parseInt(r.id.split('-')[0]);
            return isNaN(num) ? 0 : num;
          }), reportCounter);
          
          console.log('Reports ADDED - Previous:', previousCount, 'New total:', reports.length);
          showToast(`Aggiunti ${importedReports.length} report`);
        }
        
        // Update UI
        renderReportsList();
        updateMiniReportsList();
        
        // Switch to reports list tab
        const listaTab = Array.from(tabButtons).find(btn => btn.dataset.tab === 'lista');
        if (listaTab) {
          handleTabSwitch(listaTab);
        }
        
        console.log('=== IMPORT COMPLETED SUCCESSFULLY ===' );
      })
      .catch(error => {
        console.error('Error during photo regeneration:', error);
        console.error('Error stack:', error.stack);
        renderReportsList();
        updateMiniReportsList();
        showToast('Import completato (con alcuni avvisi)');
      });
    
  } catch (error) {
    console.error('Errore in confirmImport:', error);
    console.error('Stack:', error.stack);
    alert('Errore nell\'import: ' + error.message);
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

function exportDOCX() {
  if (reports.length === 0) {
    showToast('Nessun report da esportare');
    return;
  }
  
  // Verifica caricamento libreria
  if (typeof htmlDocx === 'undefined') {
    showToast('Errore: libreria DOCX non disponibile. Verifica la connessione internet.');
    console.error('html-docx library not loaded');
    return;
  }
  
  console.log('=== STARTING DOCX EXPORT (8CM HEIGHT = 302PX) ===' );
  console.log('Total reports to export:', reports.length);
  console.log('Using HTML width/height attributes (pixels) instead of CSS cm units');
  
  // Conversion factor: 1cm = 37.795 pixels
  function convertCmToPixels(cm) {
    return Math.round(cm * 37.795);
  }
  
  // Genera HTML strutturato con dimensioni foto usando attributi HTML nativi
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { text-align: center; color: #333; font-size: 24px; margin-bottom: 10px; }
        .export-date { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }
        h2 { color: #1f8090; font-size: 18px; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #1f8090; padding-bottom: 5px; }
        .metadata { margin-bottom: 15px; font-size: 14px; }
        .metadata strong { color: #333; }
        img { display: block; margin: 15px 0; border: 1px solid #ddd; }
        .notes { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1f8090; margin: 15px 0; }
        .notes-title { font-weight: bold; color: #333; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; }
        .notes-text { color: #555; white-space: pre-wrap; line-height: 1.6; }
        hr { border: none; border-top: 1px solid #ccc; margin: 30px 0; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(listTitle)}</h1>
      <div class="export-date">Documento generato il: ${new Date().toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
  `;
  
  // Photo dimensions: 8cm height
  const photoHeightCm = 8;
  const photoHeightPx = convertCmToPixels(photoHeightCm); // ~302px
  
  reports.forEach((report, index) => {
    const date = new Date(report.dataCreazione).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
    const colorLetters = (report.activeColors || []).join(', ');
    
    htmlContent += `
      <h2>Report #${index + 1} - ID: ${escapeHtml(report.id)}</h2>
      <div class="metadata">
        <p><strong>Data:</strong> ${date}</p>
        <p><strong>Stato:</strong> ${escapeHtml(report.stato)}</p>
        ${colorLetters ? `<p><strong>Tag:</strong> ${escapeHtml(colorLetters)}</p>` : ''}
      </div>
    `;
    
    // Add image with native HTML width/height attributes (in pixels)
    if (report.foto) {
      // Calculate proportional width based on original aspect ratio
      const imgOriginalWidth = report.fotoOriginalWidth || 800;
      const imgOriginalHeight = report.fotoOriginalHeight || 600;
      const aspectRatio = imgOriginalWidth / imgOriginalHeight;
      
      // Calculate width in pixels to maintain aspect ratio
      const photoWidthPx = Math.round(photoHeightPx * aspectRatio);
      
      console.log(`Report ${index + 1}: Image dimensions ${photoWidthPx}px x ${photoHeightPx}px (aspect ratio: ${aspectRatio.toFixed(3)})`);
      
      // USE HTML ATTRIBUTES width/height (NOT CSS style with cm units)
      htmlContent += `<img src="${report.foto}" width="${photoWidthPx}" height="${photoHeightPx}" alt="Foto report" />`;
    }
    
    // Add notes
    htmlContent += `
      <div class="notes">
        <div class="notes-title">Note:</div>
        <div class="notes-text">${escapeHtml(report.note || '(vuoto)')}</div>
      </div>
    `;
    
    // Add intervention notes if resolved
    if (report.stato === 'Risolto' && report.noteElaborazione) {
      htmlContent += `
        <div class="notes">
          <div class="notes-title">Note intervento:</div>
          <div class="notes-text">${escapeHtml(report.noteElaborazione || '(vuoto)')}</div>
        </div>
      `;
    }
    
    // Add separator between reports
    if (index < reports.length - 1) {
      htmlContent += '<hr />';
    }
  });
  
  htmlContent += `
    </body>
    </html>
  `;
  
  console.log('HTML content generated, length:', htmlContent.length);
  
  try {
    // Converti HTML in DOCX usando html-docx-js
    const converted = htmlDocx.asBlob(htmlContent);
    
    console.log('DOCX blob created, size:', converted.size);
    
    // Scarica file
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `report_${listTitle.replace(/[^a-z0-9]/gi, '_')}_${dateStr}.docx`;
    
    saveAs(converted, fileName);
    
    console.log('=== DOCX EXPORT COMPLETED ===' );
    console.log('File name:', fileName);
    console.log('Photo dimensions: 8cm height (~302px) with proportional width');
    showToast(`DOCX esportato: ${reports.length} report con foto corrette (8cm)`);
    
  } catch (error) {
    console.error('Error generating DOCX:', error);
    console.error('Error stack:', error.stack);
    showToast('Errore nella generazione del DOCX: ' + error.message);
  }
}