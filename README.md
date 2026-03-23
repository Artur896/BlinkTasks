# BlinkTasks

Marketplace descentralizado de tareas freelance construido sobre Solana. El pago se bloquea automáticamente al crear la tarea y se libera solo cuando el cliente aprueba la entrega — sin intermediarios, sin custodia centralizada.

---

## Cómo funciona

```
Cliente crea tarea → SOL bloqueado en vault
        ↓
Worker acepta → estado: En progreso
        ↓
Worker sube entrega (URL / IPFS hash)
        ↓
Cliente revisa
    ├── Aprueba + califica (1-5 estrellas) → SOL liberado al worker
    ├── Reporta problema → Worker puede resubmitir cuantas veces sea necesario
    └── Cancela (si nadie aceptó) → SOL devuelto al cliente
```

El ciclo completo vive on-chain. Ninguna de las dos partes puede tocar el SOL fuera del flujo definido por el contrato.

---

## Stack

| Capa | Tecnología |
|---|---|
| Contrato | Anchor 0.32 · Rust · Solana |
| Frontend | React 19 · Vite 8 |
| Wallet | `@solana/wallet-adapter` |
| Red | Localnet · Devnet |
| Fuentes | Syne · DM Mono |

---

## Características

- **Escrow on-chain** — el SOL nunca pasa por ningún servidor central
- **Perfiles con reputación** — cada wallet tiene un perfil con puntos y tareas completadas
- **Categorías** — Diseño, Código, Redacción, Marketing, Video, Audio, 3D, Otro
- **Sistema de calificaciones** — el cliente puntúa de 1 a 5 estrellas al aprobar
- **Notificaciones** — alertas en tiempo real para cambios de estado de las tareas
- **Perfil público** — cualquiera puede ver el historial y reputación de otro usuario
- **Modo oscuro / claro** — toggle en el header
- **Bilingüe** — interfaz completa en español e inglés (ES / EN)
- **Responsive** — adaptado para mobile, tablet y desktop

---

## Flujo de uso

**Como cliente**
1. Conecta tu wallet
2. Crea tu perfil — también inicializa la vault que guardará tu SOL
3. Pulsa **Nueva tarea**, completa título, descripción, categoría, monto y deadline
4. Mientras no haya worker, puedes cancelar y recuperar el SOL
5. Cuando el worker entregue, verás el link en la tarjeta — aprueba o reporta un problema
6. Al aprobar, califica el trabajo de 1 a 5 estrellas y el SOL se transfiere automáticamente

**Como worker**
1. Conecta tu wallet y crea tu perfil
2. Pulsa **Aceptar tarea** en cualquier tarea disponible
3. Cuando termines, sube el link de tu entrega desde la misma tarjeta
4. Si el cliente reporta un problema, puedes resubmitir cuantas veces sea necesario
5. Al aprobarse, el SOL llega directo a tu wallet y tu reputación sube +10 pts

---

## Instalación

### Requisitos

- Rust + Anchor CLI 0.32
- Node 18+
- Solana CLI

### Localnet (desarrollo local)

```bash
# Terminal 1 — levantar el validador local
solana-test-validator

# Terminal 2 — clonar, instalar y correr
git clone https://github.com/Artur896/blinktasks
cd blinktasks
npm install
anchor build
anchor deploy --provider.cluster localnet
solana airdrop 2

cd app
npm install
npm run dev
```

### Devnet

```bash
solana config set --url devnet
solana airdrop 2

anchor build
anchor deploy --provider.cluster devnet

cd app
npm install
npm run dev
```

> Después de desplegar, copia el Program ID generado en `programs/blinktasks/src/lib.rs`, `app/src/anchor.js` y `Anchor.toml`, luego vuelve a hacer `anchor build`.

---

## Estructura del proyecto

```
blinktasks/
├── programs/blinktasks/src/
│   └── lib.rs                      # Contrato Anchor
└── app/src/
    ├── App.jsx                     # Orquestador principal
    ├── anchor.js                   # Configuración del programa y IDL
    ├── i18n.js                     # Traducciones ES / EN
    ├── hooks/
    │   ├── useProfile.js           # CRUD de perfil propio
    │   ├── useProfiles.js          # Caché de usernames por pubkey
    │   ├── useTasks.js             # Ciclo de vida de tareas + filtros
    │   ├── useNotifications.js     # Alertas de cambios de estado
    │   ├── useLanguage.jsx         # Detección y cambio de idioma
    │   ├── useTheme.jsx            # Modo oscuro / claro
    │   ├── useAutoLoad.js          # Recarga automática de tareas
    │   ├── useNotificationSound.js # Sonido de notificaciones
    │   └── useBreakpoint.js        # Detección de breakpoint responsive
    ├── components/
    │   ├── ProfileBadge.jsx        # Barra de perfil activo
    │   ├── ProfileModal.jsx        # Crear / editar perfil
    │   ├── PublicProfileModal.jsx  # Ver perfil de otro usuario
    │   ├── CreateTaskModal.jsx     # Formulario de nueva tarea
    │   ├── TaskList.jsx            # Lista paginada de tareas
    │   ├── TaskCard.jsx            # Tarjeta con todas las acciones
    │   ├── TaskFilters.jsx         # Búsqueda y filtros
    │   ├── NotificationBell.jsx    # Campana de notificaciones
    │   ├── WalletMenu.jsx          # Menú de wallet conectada
    │   ├── LanguageToggle.jsx      # Selector ES / EN
    │   ├── ThemeToggle.jsx         # Toggle oscuro / claro
    │   ├── SuccessModal.jsx        # Confirmación de acciones exitosas
    │   ├── WelcomeToast.jsx        # Toast de bienvenida al conectar
    │   ├── SyncIndicator.jsx       # Indicador de sincronización
    │   └── Modal.jsx               # Wrapper base de modales
    ├── utils/helpers.js            # Funciones de formato
    └── styles/globals.css          # Design system + responsive
```

---

## Responsive

| Dispositivo | Comportamiento |
|---|---|
| Mobile `< 640px` | 1 columna · modales como bottom sheets |
| Tablet `640–1024px` | 2 columnas · modales centrados |
| Desktop `1024px+` | 3 columnas · layout completo |

---

## Licencia

MIT
