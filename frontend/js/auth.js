// ===== Auth Logic (Login, Register, OTP) =====

let selectedRole = 'student';

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-toggle button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`role-${role}`).classList.add('active');
}

// ===== LOGIN PAGE =====
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('login-alert', 'Please fill in all fields.', 'error');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'LOGGING IN...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: selectedRole })
    });

    const data = await response.json();

    if (response.ok) {
      setAuth(data.token, data.user);
      if (data.user.role === 'student') {
        window.location.href = '/student-dashboard';
      } else {
        window.location.href = '/teacher-dashboard';
      }
    } else {
      showAlert('login-alert', data.error || 'Login failed', 'error');
    }
  } catch (err) {
    showAlert('login-alert', 'Network error. Please try again.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'LOGIN';
}

// ===== REGISTER PAGE =====
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const collegeId = document.getElementById('collegeId').value.trim();
  const semester = document.getElementById('semester').value;
  const branch = document.getElementById('branch').value;
  const phone = document.getElementById('phone').value.trim();

  if (!name || !email || !password) {
    showAlert('register-alert', 'Please fill in all required fields.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('register-alert', 'Passwords do not match.', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('register-alert', 'Password must be at least 6 characters.', 'error');
    return;
  }

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'REGISTERING...';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password,
        role: selectedRole,
        collegeId, semester, branch, phone
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store email for OTP page
      localStorage.setItem('pendingEmail', email);
      window.location.href = '/otp';
    } else {
      showAlert('register-alert', data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    showAlert('register-alert', 'Network error. Please try again.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'REGISTER';
}

// ===== OTP PAGE =====
function initOTPPage() {
  const otpInputs = document.querySelectorAll('.otp-digit');
  if (!otpInputs.length) return;

  // Auto-focus and auto-advance
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    // Allow paste
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      pastedData.split('').forEach((char, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = char;
        }
      });
      if (pastedData.length > 0) {
        const focusIdx = Math.min(pastedData.length, otpInputs.length - 1);
        otpInputs[focusIdx].focus();
      }
    });
  });

  // Countdown timer
  startCountdown();
}

let countdownInterval;
function startCountdown() {
  let seconds = 30;
  const countdownEl = document.getElementById('countdown');
  const timerEl = document.getElementById('otp-timer');
  if (!countdownEl) return;

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(countdownInterval);
      timerEl.innerHTML = `Didn't receive OTP? <a onclick="resendOTP()" style="cursor:pointer;text-decoration:underline;">Request again</a>`;
    }
  }, 1000);
}

async function resendOTP() {
  const email = localStorage.getItem('pendingEmail');
  if (!email) {
    showAlert('otp-alert', 'Session expired. Please register again.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (response.ok) {
      showAlert('otp-alert', 'OTP resent successfully!', 'success');
      startCountdown();
    } else {
      showAlert('otp-alert', data.error || 'Failed to resend OTP', 'error');
    }
  } catch (err) {
    showAlert('otp-alert', 'Network error.', 'error');
  }
}

async function handleVerifyOTP() {
  const otpInputs = document.querySelectorAll('.otp-digit');
  const otp = Array.from(otpInputs).map(i => i.value).join('');
  const email = localStorage.getItem('pendingEmail');

  if (!email) {
    showAlert('otp-alert', 'Session expired. Please register again.', 'error');
    setTimeout(() => window.location.href = '/register', 2000);
    return;
  }

  if (otp.length !== 6) {
    showAlert('otp-alert', 'Please enter a valid 6-digit OTP.', 'error');
    return;
  }

  const btn = document.getElementById('btn-verify');
  btn.disabled = true;
  btn.textContent = 'VERIFYING...';

  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem('pendingEmail');
      setAuth(data.token, data.user);
      if (data.user.role === 'student') {
        window.location.href = '/student-dashboard';
      } else {
        window.location.href = '/teacher-dashboard';
      }
    } else {
      showAlert('otp-alert', data.error || 'Invalid OTP', 'error');
    }
  } catch (err) {
    showAlert('otp-alert', 'Network error. Please try again.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'VERIFY';
}

// ===== Auto-redirect if already logged in =====
(function checkAuth() {
  const currentPage = window.location.pathname;
  const token = getToken();
  const user = getUser();

  // If on auth pages and already logged in, redirect to dashboard
  if (token && user && ['/', '/register', '/otp'].includes(currentPage)) {
    if (user.role === 'student') {
      window.location.href = '/student-dashboard';
    } else {
      window.location.href = '/teacher-dashboard';
    }
    return;
  }

  // Init OTP page if applicable
  if (currentPage === '/otp') {
    setTimeout(initOTPPage, 100);
  }
})();
