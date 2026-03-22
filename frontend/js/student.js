// ===== Student Pages Logic =====

// Auth guard - runs on every student page
(function() {
  const user = getUser();
  if (!user || user.role !== 'student') {
    logout();
    return;
  }

  // Fill dashboard user info if on dashboard
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.name;

  const branchEl = document.getElementById('user-branch');
  if (branchEl) branchEl.textContent = user.branch || 'N/A';

  const semesterEl = document.getElementById('user-semester');
  if (semesterEl) semesterEl.textContent = user.semester || 'N/A';

  const idEl = document.getElementById('user-college-id');
  if (idEl) idEl.textContent = user.collegeId || 'N/A';
})();

// Detect current page and load appropriate data
(function initPage() {
  const path = window.location.pathname;

  if (path === '/grievances') {
    fetchGrievances();
  } else if (path === '/grievance-details') {
    loadGrievanceDetails();
  } else if (path === '/notes') {
    fetchNotes();
  } else if (path === '/alumni') {
    fetchAlumni();
  }
})();

// ===== GRIEVANCES =====

function toggleGrievanceForm() {
  const section = document.getElementById('grievance-form-section');
  if (!section) return;
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function submitGrievance(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-grievance');
  btn.disabled = true;
  btn.textContent = 'SUBMITTING...';

  const formData = new FormData();
  formData.append('title', document.getElementById('grievance-title').value);
  formData.append('category', document.getElementById('grievance-category').value);
  formData.append('priority', document.getElementById('grievance-priority').value);
  formData.append('description', document.getElementById('grievance-desc').value);

  const file = document.getElementById('grievance-file').files[0];
  if (file) {
    formData.append('attachment', file);
  }

  try {
    const result = await apiPostForm('/grievances', formData);
    if (result.error) {
      showAlert('grievance-form-alert', result.error, 'error');
    } else {
      showAlert('grievance-alert', 'Grievance submitted successfully!', 'success');
      document.getElementById('grievance-form').reset();
      document.getElementById('grievance-form-section').style.display = 'none';
      fetchGrievances();
    }
  } catch (err) {
    showAlert('grievance-form-alert', 'Failed to submit grievance.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'SUBMIT';
}

async function fetchGrievances() {
  const container = document.getElementById('grievance-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner"></div></div>';

  try {
    const data = await apiGet('/grievances');
    if (!data || !data.grievances || data.grievances.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">&#128203;</div>
          <p>No grievances yet. Click "New Complaint" to submit one.</p>
        </div>`;
      return;
    }

    container.innerHTML = data.grievances.map(g => {
      const badgeClass = g.status === 'Submitted' ? 'badge-submitted'
        : g.status === 'Under Review' ? 'badge-review' : 'badge-resolved';

      return `
        <div class="grievance-item" onclick="window.location.href='/grievance-details?id=${g._id}'">
          <h4>${escapeHtml(g.title)}</h4>
          <div class="meta">${formatDate(g.createdAt)} &middot; <span class="badge ${badgeClass}">${g.status}</span></div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="alert alert-error">Failed to load grievances.</div>';
  }
}

async function loadGrievanceDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = '/grievances';
    return;
  }

  const detailContainer = document.getElementById('grievance-detail');
  const repliesContainer = document.getElementById('replies-list');

  try {
    const data = await apiGet(`/grievances/${id}`);
    if (!data || !data.grievance) {
      detailContainer.innerHTML = '<div class="alert alert-error">Grievance not found.</div>';
      return;
    }

    const g = data.grievance;
    const badgeClass = g.status === 'Submitted' ? 'badge-submitted'
      : g.status === 'Under Review' ? 'badge-review' : 'badge-resolved';

    detailContainer.innerHTML = `
      <h2>${escapeHtml(g.title)}</h2>
      <div class="detail-meta">
        <span class="badge ${badgeClass}">${g.status}</span> &middot; ${formatDate(g.createdAt)}
        ${g.priority ? ` &middot; Priority: <strong>${escapeHtml(g.priority)}</strong>` : ''}
      </div>
      <div class="detail-body">${escapeHtml(g.description)}</div>
      ${g.attachmentLink ? `<a href="${escapeHtml(g.attachmentLink)}" target="_blank" class="btn btn-outline btn-sm" style="margin-top:12px;">View Attachment</a>` : ''}
    `;

    // Show reply if exists
    if (g.teacherReply) {
      repliesContainer.innerHTML = `
        <div class="reply-card">
          <div class="reply-info">
            <h4>Teacher</h4>
            <p>${escapeHtml(g.teacherReply)}</p>
          </div>
        </div>`;
    } else {
      repliesContainer.innerHTML = '<div class="empty-state"><p>No replies yet.</p></div>';
    }
  } catch (err) {
    detailContainer.innerHTML = '<div class="alert alert-error">Failed to load grievance details.</div>';
  }
}

// ===== NOTES =====

let currentSort = 'time';

function sortNotes(sortBy, el) {
  currentSort = sortBy;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  fetchNotes();
}

async function fetchNotes() {
  const container = document.getElementById('notes-container');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner"></div></div>';

  const searchEl = document.getElementById('notes-search');
  const search = searchEl ? searchEl.value.trim() : '';
  let query = `sortBy=${currentSort}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;

  try {
    const data = await apiGet(`/notes?${query}`);
    if (!data || !data.notes || data.notes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">&#128218;</div>
          <p>No notes available yet.</p>
        </div>`;
      return;
    }

    container.innerHTML = data.notes.map(n => `
      <div class="note-item">
        <h4>${escapeHtml(n.title)}</h4>
        <div class="note-meta">
          ${escapeHtml(n.subject)} &middot; ${n.uploaderName || 'Unknown'} &middot; ${formatDate(n.createdAt)}
          ${n.semester ? ` &middot; Sem ${escapeHtml(n.semester)}` : ''}
          ${n.branch ? ` &middot; ${escapeHtml(n.branch)}` : ''}
        </div>
        <div class="note-actions">
          <a href="${escapeHtml(n.fileLink)}" target="_blank" class="btn btn-primary btn-sm">View / Download</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="alert alert-error">Failed to load notes.</div>';
  }
}

async function handleUploadNote(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-upload-note');
  btn.disabled = true;
  btn.textContent = 'UPLOADING...';

  const formData = new FormData();
  formData.append('title', document.getElementById('note-title').value);
  formData.append('subject', document.getElementById('note-subject').value);
  formData.append('file', document.getElementById('note-file').files[0]);

  const semesterEl = document.getElementById('note-semester');
  const branchEl = document.getElementById('note-branch');
  const tagsEl = document.getElementById('note-tags');

  if (semesterEl) formData.append('semester', semesterEl.value);
  if (branchEl) formData.append('branch', branchEl.value);
  if (tagsEl) formData.append('tags', tagsEl.value);

  try {
    const result = await apiPostForm('/notes', formData);
    if (result.error) {
      showAlert('upload-alert', result.error, 'error');
    } else {
      showAlert('upload-alert', 'Note uploaded successfully!', 'success');
      document.getElementById('upload-form').reset();
    }
  } catch (err) {
    showAlert('upload-alert', 'Failed to upload note.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'UPLOAD';
}

// ===== ALUMNI =====

async function fetchAlumni() {
  const container = document.getElementById('alumni-grid');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;grid-column:1/-1;"><div class="spinner"></div></div>';

  const searchEl = document.getElementById('alumni-search');
  const search = searchEl ? searchEl.value.trim() : '';
  let query = '';
  if (search) query = `?search=${encodeURIComponent(search)}`;

  try {
    const data = await apiGet(`/alumni${query}`);
    if (!data || !data.alumni || data.alumni.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">&#127891;</div>
          <p>No alumni found.</p>
        </div>`;
      return;
    }

    container.innerHTML = data.alumni.map(a => `
      <div class="alumni-card">
        <h3>${escapeHtml(a.name)}</h3>
        <div class="alumni-batch">Batch: ${escapeHtml(a.batch || '')}</div>
        <div class="alumni-position">${escapeHtml(a.currentPosition || '')}</div>
        <div class="alumni-desc">${escapeHtml(a.description || '')}</div>
        <div class="alumni-contact">
          ${a.linkedin ? `<a href="${escapeHtml(a.linkedin)}" target="_blank">LinkedIn</a>` : ''}
          ${a.whatsapp ? ` Whatsapp` : ''}
          ${a.phone ? `<br>Phone: ${escapeHtml(a.phone)}` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="alert alert-error" style="grid-column:1/-1;">Failed to load alumni data.</div>';
  }
}
