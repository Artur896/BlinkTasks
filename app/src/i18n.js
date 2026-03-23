// ─── Textos de la aplicación en ES y EN ───────────────────────

export const translations = {
  es: {
    // Header
    appName: "BlinkTasks",

    // Profile
    createProfile: "+ Crear perfil",
    editProfile: "Editar",
    verifying: "Verificando...",
    creating: "Creando...",
    saving: "Guardando...",
    profileActive: "Perfil activo",
    reputation: "Reputación",
    completed: "Completadas",
    reviews: "reseñas",
    createProfileVault: "Crear perfil + vault",
    updateProfile: "Actualizar perfil",
    cancel: "Cancelar",
    aboutMe: "Sobre mí",
    skills: "Skills",
    contact: "Contacto",
    noPublicProfile: "Sin perfil público",

    // Profile form
    usernameLabel: "Username *",
    usernameHint: "máx 50 chars",
    bioLabel: "Bio",
    skillsLabel: "Skills",
    skillsHint: "máx 100 chars",
    contactLabel: "Contacto",
    contactPlaceholder: "@tu_usuario / tu@email.com",
    bioPlaceholder: "Cuéntale a los clientes quién eres...",
    skillsPlaceholder: "o escribe tus skills manualmente",
    usernamePlaceholder: "satoshi_dev",

    // Profile errors
    usernameRequired: "El username es requerido",
    usernameMax: "Username máx 50 chars",
    bioMax: "Bio máx 200 chars",
    skillsMax: "Skills máx 100 chars",
    contactMax: "Contacto máx 100 chars",

    // Task actions
    newTask: "+ Nueva tarea",
    refresh: "Actualizar",
    acceptTask: "Aceptar tarea",
    cancelTask: "Cancelar y recuperar SOL",
    submitDelivery: "Subir entrega",
    resubmitDelivery: "Resubmitir entrega",
    sendDelivery: "Enviar entrega",
    approveAndPay: "Aprobar y pagar",
    confirmPayment: "Confirmar pago",
    reportProblem: "Reportar problema",
    reportError: "Reportar error",

    // Task form
    taskTitle: "Título *",
    taskDescription: "Descripción *",
    taskCategory: "Categoría *",
    taskPayment: "Pago en SOL *",
    taskDeadline: "Deadline (opcional)",
    taskTitlePlaceholder: "Ej: Diseñar logo para startup",
    taskDescriptionPlaceholder: "Explica qué necesitas: entregables, formato, referencias...",
    createAndLock: "Crear y bloquear SOL",
    titleMax: "Título máx 100 chars",
    descriptionMax: "Descripción máx 500 chars",
    titleRequired: "El título es requerido",
    descriptionRequired: "La descripción es requerida",
    categoryRequired: "Elige una categoría",
    invalidAmount: "Monto inválido",

    // Task card
    client: "Cliente",
    worker: "Worker",
    payment: "Pago",
    deadline: "Deadline",
    workerDelivery: "Entrega del worker",
    reportedProblem: "Problema reportado",
    rateWork: "Califica el trabajo (1–5 estrellas)",
    deliveryPlaceholder: "https://tu-entrega.com o IPFS hash...",
    errorPlaceholder: "Describe qué está mal o qué falta...",

    // Status
    statusOpen: "Disponible",
    statusInProgress: "En progreso",
    statusSubmitted: "Entrega pendiente",
    statusDisputed: "Disputado",
    statusPaid: "Pagado",
    statusCancelled: "Cancelado",

    // Filters
    searchPlaceholder: "Buscar tareas...",
    allStatuses: "Todos",
    allCategories: "Todas las categorías",

    // Task list
    noResults: "Sin resultados",
    noResultsHint: "Intenta cambiar los filtros o la búsqueda",
    loadingTasks: "Cargando tareas...",
    tasks: "tarea",
    tasksPlural: "tareas",
    noTasks: "sin resultados",
    loadMore: "Cargar más",

    // Notifications
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones",
    notifAccepted: "Tu tarea fue aceptada por un worker",
    notifSubmitted: "El worker subió su entrega — revísala",
    notifDisputed: "El cliente reportó un problema en tu entrega",
    notifPaid: "¡Recibiste el pago por tu tarea!",
    notifCancelled: "Una tarea fue cancelada",

    // Error
    connectWallet: "Conecta tu wallet primero",
    noProfile: "Primero crea tu perfil",
    errorSaving: "Error al guardar",
    errorCreating: "Error al crear tarea",

    // Categories
    categories: ["Diseño", "Código", "Redacción", "Marketing", "Video", "Audio", "3D", "Otro"],

    // Stats
    tasksCreated: "Creadas",
    tasksCompleted: "Completadas",
    pts: "pts",
  },

  en: {
    // Header
    appName: "BlinkTasks",

    // Profile
    createProfile: "+ Create profile",
    editProfile: "Edit",
    verifying: "Verifying...",
    creating: "Creating...",
    saving: "Saving...",
    profileActive: "Active profile",
    reputation: "Reputation",
    completed: "Completed",
    reviews: "reviews",
    createProfileVault: "Create profile + vault",
    updateProfile: "Update profile",
    cancel: "Cancel",
    aboutMe: "About me",
    skills: "Skills",
    contact: "Contact",
    noPublicProfile: "No public profile",

    // Profile form
    usernameLabel: "Username *",
    usernameHint: "max 50 chars",
    bioLabel: "Bio",
    skillsLabel: "Skills",
    skillsHint: "max 100 chars",
    contactLabel: "Contact",
    contactPlaceholder: "@your_user / you@email.com",
    bioPlaceholder: "Tell clients who you are...",
    skillsPlaceholder: "or type your skills manually",
    usernamePlaceholder: "satoshi_dev",

    // Profile errors
    usernameRequired: "Username is required",
    usernameMax: "Username max 50 chars",
    bioMax: "Bio max 200 chars",
    skillsMax: "Skills max 100 chars",
    contactMax: "Contact max 100 chars",

    // Task actions
    newTask: "+ New task",
    refresh: "Refresh",
    acceptTask: "Accept task",
    cancelTask: "Cancel and recover SOL",
    submitDelivery: "Submit delivery",
    resubmitDelivery: "Resubmit delivery",
    sendDelivery: "Send delivery",
    approveAndPay: "Approve and pay",
    confirmPayment: "Confirm payment",
    reportProblem: "Report problem",
    reportError: "Report error",

    // Task form
    taskTitle: "Title *",
    taskDescription: "Description *",
    taskCategory: "Category *",
    taskPayment: "Payment in SOL *",
    taskDeadline: "Deadline (optional)",
    taskTitlePlaceholder: "e.g: Design logo for startup",
    taskDescriptionPlaceholder: "Explain what you need: deliverables, format, references...",
    createAndLock: "Create and lock SOL",
    titleMax: "Title max 100 chars",
    descriptionMax: "Description max 500 chars",
    titleRequired: "Title is required",
    descriptionRequired: "Description is required",
    categoryRequired: "Choose a category",
    invalidAmount: "Invalid amount",

    // Task card
    client: "Client",
    worker: "Worker",
    payment: "Payment",
    deadline: "Deadline",
    workerDelivery: "Worker delivery",
    reportedProblem: "Reported problem",
    rateWork: "Rate the work (1–5 stars)",
    deliveryPlaceholder: "https://your-delivery.com or IPFS hash...",
    errorPlaceholder: "Describe what is wrong or missing...",

    // Status
    statusOpen: "Available",
    statusInProgress: "In progress",
    statusSubmitted: "Pending review",
    statusDisputed: "Disputed",
    statusPaid: "Paid",
    statusCancelled: "Cancelled",

    // Filters
    searchPlaceholder: "Search tasks...",
    allStatuses: "All",
    allCategories: "All categories",

    // Task list
    noResults: "No results",
    noResultsHint: "Try changing the filters or search",
    loadingTasks: "Loading tasks...",
    tasks: "task",
    tasksPlural: "tasks",
    noTasks: "no results",
    loadMore: "Load more",

    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications",
    notifAccepted: "Your task was accepted by a worker",
    notifSubmitted: "The worker submitted a delivery — review it",
    notifDisputed: "The client reported a problem with your delivery",
    notifPaid: "You received payment for your task!",
    notifCancelled: "A task was cancelled",

    // Error
    connectWallet: "Connect your wallet first",
    noProfile: "Create your profile first",
    errorSaving: "Error saving",
    errorCreating: "Error creating task",

    // Categories
    categories: ["Design", "Code", "Writing", "Marketing", "Video", "Audio", "3D", "Other"],

    // Stats
    tasksCreated: "Created",
    tasksCompleted: "Completed",
    pts: "pts",
  },
};