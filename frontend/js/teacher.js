// ===== Teacher Pages Logic =====

// Auth guard - runs on every teacher page
(function() {
  const user = getUser();
  if (!user || user.role !== 'teacher') {
    logout();
    return;
  }

  // Fill dashboard user info if on dashboard
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.name;

  const branchEl = document.getElementById('user-branch');
  if (branchEl) branchEl.textContent = user.branch || 'INFT';

  const positionEl = document.getElementById('user-position');
  if (positionEl) positionEl.textContent = 'Professor';
})();

// Detect current page and load appropriate data
(function initPage() {
  const path = window.location.pathname;

  if (path === '/teacher-grievances') {
    fetchTeacherGrievances();
  }
})();

// ===== GRIEVANCES =====

async function fetchTeacherGrievances() {
  const container = document.getElementById('grievance-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner"></div></div>';

  try {
    const data = await apiGet('/grievances');
    if (!data || !data.grievances || data.grievances.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">&#128203;</div>
          <p>No grievances submitted yet.</p>
        </div>`;
      return;
    }

    let grievances = data.grievances;

    // Apply client-side filters
    const statusFilter = document.getElementById('filter-status');
    const categoryFilter = document.getElementById('filter-category');
    const priorityFilter = document.getElementById('filter-priority');

    if (statusFilter && statusFilter.value) {
      grievances = grievances.filter(g => g.status === statusFilter.value);
    }
    if (categoryFilter && categoryFilter.value) {
      grievances = grievances.filter(g => g.category === categoryFilter.value);
    }
    if (priorityFilter && priorityFilter.value) {
      grievances = grievances.filter(g => g.priority === priorityFilter.value);
    }

    if (grievances.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">&#128203;</div>
          <p>No grievances match the selected filters.</p>
        </div>`;
      return;
    }

    container.innerHTML = grievances.map(g => {
      const badgeClass = g.status === 'Submitted' ? 'badge-submitted'
        : g.status === 'Under Review' ? 'badge-review' : 'badge-resolved';

      let replyHtml = '';
      if (g.teacherReply) {
        replyHtml = `<div style="margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.5);border-radius:8px;font-size:13px;">
          <strong>Your Reply:</strong> ${escapeHtml(g.teacherReply)}
        </div>`;
      }

      return `
        <div class="grievance-item">
          <h4>${escapeHtml(g.title)}</h4>
          <div class="meta">
            <span class="badge ${badgeClass}">${g.status}</span> &middot;
            ${formatDate(g.createdAt)} &middot;
            Priority: <strong>${escapeHtml(g.priority || 'Medium')}</strong>
          </div>
          ${replyHtml}
          <div style="margin-top:12px;">
            <button class="btn btn-primary btn-sm" onclick="openReplyModal('${g._id}', '${escapeHtml(g.title).replace(/'/g, "\\'")}')">REPLY</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="alert alert-error">Failed to load grievances.</div>';
  }
}

function openReplyModal(id, title) {
  document.getElementById('reply-modal').classList.add('active');
  document.getElementById('reply-grievance-id').value = id;
  document.getElementById('reply-grievance-info').innerHTML = `<strong>Grievance:</strong> ${title}`;
  document.getElementById('reply-text').value = '';
  document.getElementById('reply-form-alert').innerHTML = '';
}

function closeReplyModal() {
  document.getElementById('reply-modal').classList.remove('active');
}

async function submitReply(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-reply');
  btn.disabled = true;
  btn.textContent = 'SUBMITTING...';

  const id = document.getElementById('reply-grievance-id').value;
  const reply = document.getElementById('reply-text').value.trim();
  const status = document.getElementById('reply-status').value;

  if (!reply) {
    showAlert('reply-form-alert', 'Please enter a reply.', 'error');
    btn.disabled = false;
    btn.textContent = 'REPLY';
    return;
  }

  try {
    const result = await apiPut(`/grievances/${id}/reply`, { reply, status });
    if (result.error) {
      showAlert('reply-form-alert', result.error, 'error');
    } else {
      closeReplyModal();
      showAlert('grievance-alert', 'Reply submitted successfully!', 'success');
      fetchTeacherGrievances();
    }
  } catch (err) {
    showAlert('reply-form-alert', 'Failed to submit reply.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'REPLY';
}

// ===== NOTES =====

async function handleTeacherUploadNote(e) {
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
