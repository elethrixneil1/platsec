// Checklist progress
const boxes = document.querySelectorAll('.checklist input[type="checkbox"]');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressBar = document.querySelector('.progress');

function updateProgress() {
  const done = [...boxes].filter(b => b.checked).length;
  progressFill.style.width = (done / boxes.length) * 100 + '%';
  progressText.textContent = done === boxes.length
    ? 'All done. Nice work.'
    : done + ' of ' + boxes.length + ' done';
  progressBar.setAttribute('aria-valuenow', done);
}

boxes.forEach(b => b.addEventListener('change', updateProgress));
updateProgress();

// Scroll reveal: alternate swipe directions (up, left, down, right)
document.documentElement.classList.add('js');

const directions = ['up', 'left', 'down', 'right'];
const targets = document.querySelectorAll(
  'main h2, main .sub, .section-intro, .note, .habits article, .threats article, .table-wrap, .progress, .progress-text, .checklist li, .compare, .quiz, .site-footer .wrap > *'
);

targets.forEach((el, i) => {
  el.setAttribute('data-reveal', directions[i % directions.length]);
});

// On refresh, start from the top so the whole site animates in from the beginning
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

if ('IntersectionObserver' in window) {
  // Wait for the load panel to swipe away before revealing anything on screen
  const startDelay = 900;
  const t0 = performance.now();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        const wait = Math.max(0, startDelay - (performance.now() - t0));
        setTimeout(() => el.classList.add('in'), wait);
      } else if (entry.boundingClientRect.top > 0) {
        // Scrolled back up past it: hide it again so it re-reveals on the way down
        el.classList.remove('in');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
} else {
  targets.forEach(el => el.classList.add('in'));
}


// Quiz
const questions = [
  { q: 'Which layer of a computing platform includes BIOS/UEFI?', o: ['Hardware', 'Firmware', 'Applications', 'Operating system'], a: 1, e: 'Firmware covers BIOS/UEFI, device firmware, and initialization processes.' },
  { q: 'What is true of mobile platforms such as Android and iOS?', o: ['They have a larger attack surface than desktops', 'They use no sandboxing', 'They use app sandboxing and stricter permissions', 'They are not tied to specific hardware'], a: 2, e: 'Mobile platforms are optimized for portability and battery life and sandbox apps with stricter permissions.' },
  { q: 'How do cloud computing and virtualization relate?', o: ['Cloud is the core technology; virtualization is the service model', 'Virtualization is the core technology; cloud is the service model built on it', 'They are unrelated', 'Cloud replaces hypervisors'], a: 1, e: 'Virtualization is the core technology, while cloud computing is the service model built on top of it.' },
  { q: 'What is a TPM?', o: ['A hardware-based security chip providing a Root of Trust', 'A type of hypervisor', 'A Windows antivirus program', 'A network firewall'], a: 0, e: 'The TPM is a hardware security chip that works independently of the main CPU and OS.' },
  { q: 'Which TPM version is required for Windows 11?', o: ['TPM 1.0', 'TPM 1.2', 'TPM 2.0', 'No TPM is needed'], a: 2, e: 'TPM 2.0 is required for Windows 11 and modern enterprise-grade security solutions.' },
  { q: 'Which hashing algorithm is TPM 1.2 strictly limited to?', o: ['SHA-1', 'SHA-256', 'SHA-384', 'SM3'], a: 0, e: 'TPM 1.2 supports only SHA-1. TPM 2.0 adds SHA-256, SHA-384, SM3, and more.' },
  { q: 'In the chain of trust, what checks the bootloader?', o: ['The applications', 'The OS kernel', 'The firmware (bootloader must be signed)', 'The hypervisor'], a: 2, e: 'The root of trust starts the system, then firmware checks the signed bootloader, which checks the kernel.' },
  { q: 'Which is an example of a Type 1 (bare-metal) hypervisor?', o: ['Oracle VirtualBox', 'VMware Workstation', 'Parallels Desktop', 'VMware ESXi'], a: 3, e: 'Type 1 hypervisors like VMware ESXi and Hyper-V run directly on hardware.' },
  { q: 'What is a VM escape?', o: ['Malicious code in a VM breaks isolation and reaches the host', 'Deleting a VM', 'Moving a VM between servers', 'A VM running out of memory'], a: 0, e: 'VM escape violates the core promise of virtualization: isolation.' },
  { q: 'Which is a risky virtualization misconfiguration?', o: ['Encrypting VM images', 'Segmenting networks with VLANs', 'Patching the hypervisor', 'Leaving default management console credentials'], a: 3, e: 'Weak or default management console credentials are a classic misconfiguration.' }
];

const box = document.getElementById('quiz-box');
let qi = 0, score = 0;

function renderQuestion() {
  const item = questions[qi];
  box.innerHTML = '';
  const meta = document.createElement('p');
  meta.className = 'quiz-meta';
  meta.textContent = 'Question ' + (qi + 1) + ' of ' + questions.length + '  •  Score: ' + score;
  const h = document.createElement('h3');
  h.textContent = item.q;
  const list = document.createElement('div');
  list.className = 'quiz-options';
  const fb = document.createElement('p');
  fb.className = 'quiz-feedback';
  const next = document.createElement('button');
  next.className = 'button quiz-next';
  next.textContent = qi === questions.length - 1 ? 'See my score' : 'Next question';
  next.hidden = true;

  item.o.forEach((text, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', () => {
      const buttons = list.querySelectorAll('button');
      buttons.forEach(x => x.disabled = true);
      buttons[item.a].classList.add('correct');
      if (idx === item.a) { score++; fb.textContent = 'Correct. ' + item.e; }
      else { b.classList.add('wrong'); fb.textContent = 'Not quite. ' + item.e; }
      meta.textContent = 'Question ' + (qi + 1) + ' of ' + questions.length + '  •  Score: ' + score;
      next.hidden = false;
      next.focus();
    });
    list.appendChild(b);
  });

  next.addEventListener('click', () => {
    qi++;
    qi < questions.length ? renderQuestion() : renderResult();
  });
  box.append(meta, h, list, fb, next);
}

function renderResult() {
  box.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = 'You scored ' + score + ' out of ' + questions.length;
  const p = document.createElement('p');
  p.className = 'quiz-feedback';
  p.textContent = score >= 8 ? 'Excellent. You know your platform security.'
    : score >= 5 ? 'Good effort. Review the sections above and try again.'
    : 'Keep studying. Read the guide again and retry.';
  const again = document.createElement('button');
  again.className = 'button quiz-next';
  again.textContent = 'Try again';
  again.addEventListener('click', () => { qi = 0; score = 0; renderQuestion(); });
  box.append(h, p, again);
}

renderQuestion();
