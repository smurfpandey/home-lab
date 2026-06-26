import './app.css'
import { createIcons, icons } from 'lucide'

// Application State
const state = {
  userState: 1,
  role: 'friend',
  user: {
    email: '',
    name: ''
  }
}

// Application Catalog
const applications = [
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Stream movies, TV shows, and live channels',
    icon: 'film',
    url: 'https://jellyfin.smurfpandey.me',
    roles: ['friend', 'family', 'admin'],
    multiDevice: true,
    tvClient: 'Swiftfin or native Jellyfin TV app',
    mobileClient: 'Jellyfin mobile app'
  },
  {
    id: 'iptv',
    name: 'IPTV',
    description: 'Live television streaming service',
    icon: 'tv',
    url: 'https://iptv.smurfpandey.me',
    roles: ['friend', 'family', 'admin'],
    multiDevice: false
  },
  {
    id: 'immich',
    name: 'Immich',
    description: 'Self-hosted photo and video backup',
    icon: 'image',
    url: 'https://immich.smurfpandey.me',
    roles: ['family', 'admin'],
    multiDevice: true,
    tvClient: 'Immich TV viewer',
    mobileClient: 'Immich mobile app'
  },
  {
    id: 'audiobookshelf',
    name: 'Audiobookshelf',
    description: 'Audiobooks, podcasts, and ebooks library',
    icon: 'headphones',
    url: 'https://audiobookshelf.smurfpandey.me',
    roles: ['family', 'admin'],
    multiDevice: true,
    tvClient: 'Any web browser',
    mobileClient: 'Audiobookshelf app'
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Infrastructure monitoring dashboards',
    icon: 'activity',
    url: 'https://grafana.smurfpandey.me',
    roles: ['admin'],
    multiDevice: false
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: 'Container management console',
    icon: 'box',
    url: 'https://portainer.smurfpandey.me',
    roles: ['admin'],
    multiDevice: false
  }
]

// DOM Elements
const views = {
  loggedOut: document.getElementById('view-logged-out'),
  pending: document.getElementById('view-pending'),
  disconnected: document.getElementById('view-disconnected'),
  connected: document.getElementById('view-connected')
}

const headerSlot = {
  pending: document.getElementById('pending-header-slot'),
  disconnected: document.getElementById('disconnected-header-slot'),
  connected: document.getElementById('connected-header-slot')
}

const elements = {
  loggedInHeader: document.getElementById('logged-in-header'),
  statusBadges: document.getElementById('status-badges'),
  userInitial: document.getElementById('user-initial'),
  userEmail: document.getElementById('user-email'),
  pendingEmail: document.getElementById('pending-email'),
  disconnectedAppGrid: document.getElementById('disconnected-app-grid'),
  connectedAppGrid: document.getElementById('connected-app-grid'),
  modalContainer: document.getElementById('modal-container'),
  modalTitle: document.getElementById('modal-title'),
  modalIcon: document.getElementById('modal-icon'),
  browserDesc: document.getElementById('browser-desc'),
  browserLaunchBtn: document.getElementById('browser-launch-btn'),
  tvClientName: document.getElementById('tv-client-name'),
  tvServerUrl: document.getElementById('tv-server-url'),
  mobileClientName: document.getElementById('mobile-client-name'),
  mobileServerUrl: document.getElementById('mobile-server-url'),
  stateSelector: document.getElementById('state-selector'),
  roleSelector: document.getElementById('role-selector'),
  currentStateDisplay: document.getElementById('current-state-display')
}

function refreshIcons() {
  createIcons({ icons })
}

// Create App Card Element
function createAppCard(app, isDisabled) {
  const card = document.createElement('div')
  card.className = `glass-card app-card rounded-xl p-5 flex flex-col${isDisabled ? ' app-disabled' : ''}`

  const statusBadge = isDisabled
    ? '<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700/50 text-slate-400 text-xs"><i data-lucide="lock" class="w-3 h-3"></i>Locked</span>'
    : '<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs"><i data-lucide="check-circle" class="w-3 h-3"></i>Online</span>'

  if (isDisabled) {
    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600/20 to-cyan-600/20 border border-sky-500/20 flex items-center justify-center">
          <i data-lucide="${app.icon}" class="w-6 h-6 text-sky-400"></i>
        </div>
        ${statusBadge}
      </div>
      <h3 class="text-lg font-semibold text-slate-100 mb-1">${app.name}</h3>
      <p class="text-sm text-slate-400 mb-4 flex-grow">${app.description}</p>
      <button disabled class="w-full btn-primary text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
        <i data-lucide="lock" class="w-4 h-4"></i>Connect to Tailscale
      </button>
    `
  } else {
    const btn = document.createElement('button')
    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600/20 to-cyan-600/20 border border-sky-500/20 flex items-center justify-center">
          <i data-lucide="${app.icon}" class="w-6 h-6 text-sky-400"></i>
        </div>
        ${statusBadge}
      </div>
      <h3 class="text-lg font-semibold text-slate-100 mb-1">${app.name}</h3>
      <p class="text-sm text-slate-400 mb-4 flex-grow">${app.description}</p>
      <button class="launch-btn w-full btn-primary text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
        <i data-lucide="external-link" class="w-4 h-4"></i>Launch
      </button>
    `
    const launchBtn = card.querySelector('.launch-btn')
    launchBtn.addEventListener('click', () => handleLaunchApp(app.id))
  }

  return card
}

// Render App Grid
function renderAppGrid(container, isDisabled) {
  container.innerHTML = ''
  const accessibleApps = applications.filter(app => app.roles.includes(state.role))

  if (accessibleApps.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i data-lucide="inbox" class="w-12 h-12 text-slate-600 mx-auto mb-4"></i>
        <p class="text-slate-400">No applications available for your role.</p>
      </div>
    `
    refreshIcons()
    return
  }

  accessibleApps.forEach(app => {
    container.appendChild(createAppCard(app, isDisabled))
  })
  refreshIcons()
}

// Update Status Badges
function updateStatusBadges() {
  const isConnected = state.userState === 4
  const isApproved = state.userState >= 3
  const isPending = state.userState === 2

  elements.statusBadges.innerHTML = ''

  if (isPending) {
    elements.statusBadges.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium status-glow-amber">
        <i data-lucide="clock" class="w-4 h-4"></i>
        Pending Approval
      </span>
    `
  } else if (isApproved && !isConnected) {
    elements.statusBadges.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
        <i data-lucide="check-circle" class="w-4 h-4"></i>
        Approved
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium status-glow-amber">
        <i data-lucide="wifi-off" class="w-4 h-4"></i>
        Tailscale Disconnected
      </span>
    `
  } else if (isConnected) {
    elements.statusBadges.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium status-glow-green">
        <i data-lucide="check-circle" class="w-4 h-4"></i>
        Approved
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium status-glow-green">
        <i data-lucide="network" class="w-4 h-4"></i>
        Mesh Active
      </span>
    `
  }
  refreshIcons()
}

// Move Header to Slot
function moveHeaderToSlot(slotId) {
  const slot = headerSlot[slotId]
  if (slot) {
    slot.innerHTML = ''
    slot.appendChild(elements.loggedInHeader)
    elements.loggedInHeader.classList.remove('hidden')
  }
}

// Main Render
function render() {
  // Hide all views
  Object.values(views).forEach(v => v.classList.add('hidden'))

  // Update user display
  elements.userInitial.textContent = state.user.name.charAt(0) || '?'
  elements.userEmail.textContent = state.user.email
  elements.pendingEmail.textContent = state.user.email

  switch (state.userState) {
    case 1:
      elements.loggedInHeader.classList.add('hidden')
      views.loggedOut.classList.remove('hidden')
      break

    case 2:
      moveHeaderToSlot('pending')
      updateStatusBadges()
      views.pending.classList.remove('hidden')
      break

    case 3:
      moveHeaderToSlot('disconnected')
      updateStatusBadges()
      renderAppGrid(elements.disconnectedAppGrid, true)
      views.disconnected.classList.remove('hidden')
      break

    case 4:
      moveHeaderToSlot('connected')
      updateStatusBadges()
      renderAppGrid(elements.connectedAppGrid, false)
      views.connected.classList.remove('hidden')
      break
  }

  updateStateDisplay()
}

// Update State Display
function updateStateDisplay() {
  const stateNames = {
    1: 'Logged Out',
    2: 'Pending Approval',
    3: 'Approved / Disconnected',
    4: 'Approved / Connected'
  }
  elements.currentStateDisplay.textContent = stateNames[state.userState]
}

// Open Modal
function openModal(app) {
  elements.modalTitle.textContent = app.name
  elements.modalIcon.setAttribute('data-lucide', app.icon)
  elements.browserDesc.textContent = `Open ${app.name} directly in a new browser tab.`
  elements.browserLaunchBtn.href = app.url

  elements.tvClientName.innerHTML = `Install <span class="text-sky-400">${app.tvClient || 'the compatible app'}</span> from your TV's app store.`
  elements.tvServerUrl.innerHTML = `Launch the app, enter Server Address: <span class="text-sky-400">${app.url}</span>, and log in with your credentials.`

  elements.mobileClientName.innerHTML = `Install <span class="text-sky-400">${app.mobileClient || 'the official app'}</span> from your device's app store.`
  elements.mobileServerUrl.innerHTML = `Open the app, point it to <span class="text-sky-400">${app.url}</span>, and authenticate with your credentials.`

  elements.modalContainer.classList.remove('hidden')
  refreshIcons()
}

// Close Modal
function closeModal(event) {
  if (event && event.target !== event.currentTarget && !event.target.closest('.btn-close-modal')) {
    return
  }
  elements.modalContainer.classList.add('hidden')
}

// Tab Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('tab-active', 'text-sky-400')
    btn.classList.add('text-slate-400')
  })
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('tab-active', 'text-sky-400')
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.remove('text-slate-400')

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden')
  })
  document.getElementById(`tab-${tabName}`).classList.remove('hidden')
  refreshIcons()
}

// Event Handlers
function handleLaunchApp(appId) {
  const app = applications.find(a => a.id === appId)
  if (!app) return

  if (app.multiDevice) {
    openModal(app)
  } else {
    window.open(app.url, '_blank')
  }
}

function handleSignIn() {
  state.userState = 3
  state.user.name = 'John Smurf'
  state.user.email = 'john@smurfpandey.me'
  render()
}

function handleCreateAccount() {
  state.userState = 2
  state.user.name = 'New User'
  state.user.email = 'newuser@smurfpandey.me'
  render()
}

function handleSignOut() {
  state.userState = 1
  state.user.name = ''
  state.user.email = ''
  render()
}

// Event Listeners
document.getElementById('btn-signin').addEventListener('click', handleSignIn)
document.getElementById('btn-create-account').addEventListener('click', handleCreateAccount)
document.getElementById('btn-signout').addEventListener('click', handleSignOut)
document.getElementById('btn-close-modal').addEventListener('click', closeModal)
document.querySelector('.modal-overlay').addEventListener('click', closeModal)

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab))
})

elements.stateSelector.addEventListener('change', (e) => {
  state.userState = parseInt(e.target.value)
  render()
})

elements.roleSelector.addEventListener('change', (e) => {
  state.role = e.target.value
  render()
})

// Initialize
render()
refreshIcons()
