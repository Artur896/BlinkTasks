# BlinkTasks

Marketplace descentralizado de tareas freelance construido sobre Solana. El pago se bloquea en una vault PDA al crear la tarea y se libera únicamente cuando el cliente aprueba la entrega — sin intermediarios, sin custodia centralizada.

---

## ¿Cómo funciona?

```
Cliente crea tarea → SOL bloqueado en vault
        ↓
Worker acepta → estado: En progreso
        ↓
Worker sube entrega (URL/link)
        ↓
Cliente revisa
    ├── Aprueba + califica → SOL liberado al worker
    └── Reporta error → Worker puede resubmitir
```

El ciclo completo vive on-chain. Ninguna de las dos partes puede acceder al SOL fuera del flujo definido por el contrato.

---

## Stack

| Capa | Tecnología |
|---|---|
| Contrato | Anchor 0.32 · Rust · Solana |
| Frontend | React · Vite |
| Wallet | `@solana/wallet-adapter` |
| Red | Devnet (desplegable en Mainnet) |
| Fuentes | Syne · DM Mono |

---

## Instrucciones del contrato

| Instrucción | Actor | Descripción |
|---|---|---|
| `init_profile` | Cualquiera | Crea perfil on-chain con username, bio, skills y contacto |
| `update_profile` | Dueño del perfil | Actualiza los campos del perfil |
| `init_vault` | Creador | Inicializa la vault PDA que custodia el SOL |
| `create_task` | Creador | Publica una tarea y bloquea el pago en la vault |
| `accept_task` | Worker | Toma una tarea disponible |
| `submit_delivery` | Worker | Sube la URL de entrega (también usado para resubmitir) |
| `approve_and_pay` | Creador | Aprueba la entrega, libera el pago y registra un rating (1–5) |
| `report_error` | Creador | Reporta un problema — el worker puede resubmitir |
| `cancel_task` | Creador | Cancela la tarea y recupera el SOL (solo si está sin worker) |

---

## Cuentas on-chain

### `UserProfile`

```
authority       Pubkey      Wallet dueña del perfil
username        String      Máx 50 chars
bio             String      Máx 200 chars
skills          String      Máx 100 chars
contact         String      Máx 100 chars
tasks_created   u64
tasks_completed u64
reputation      u64         +10 por tarea completada
total_rating    u64         Suma acumulada de ratings recibidos
rating_count    u64         Cantidad de ratings — promedio = total/count
```

Seeds: `["profile", authority]` · Space: 546 bytes

### `Task`

```
creator         Pubkey
worker          Pubkey      default() si aún no tiene worker
amount          u64         Lamports bloqueados en vault
title           String      Máx 100 chars
description     String      Máx 500 chars
category        String      Máx 50 chars
deadline        i64         Unix timestamp — 0 si no aplica
delivery_url    String      Máx 200 chars
error_note      String      Máx 200 chars
status          TaskStatus  Enum (ver abajo)
bump / vault_bump u8
task_id         u64         Índice secuencial por creador
```

Seeds: `["task", creator, task_id_le_bytes]` · Space: 1174 bytes

### `TaskStatus`

```
Open        → recién creada, sin worker
InProgress  → worker asignado
Submitted   → worker subió entrega
Disputed    → cliente reportó un problema
Paid        → entrega aprobada y pago liberado
Cancelled   → cancelada con reembolso al creador
```

---

## Estructura del proyecto

```
blinktasks/
├── programs/
│   └── blinktasks/
│       └── src/
│           └── lib.rs              # Contrato Anchor
└── src/
    ├── App.jsx                     # Orquestador principal
    ├── anchor.js                   # Configuración del programa
    ├── hooks/
    │   ├── useProfile.js           # CRUD de perfil propio
    │   ├── useProfiles.js          # Caché global pubkey → username
    │   ├── useTasks.js             # Ciclo de vida + filtros
    │   ├── useNotifications.js     # Polling de cambios de estado
    │   └── useBreakpoint.js        # Detección de breakpoint
    ├── components/
    │   ├── ProfileBadge.jsx        # Barra de perfil activo
    │   ├── ProfileModal.jsx        # Crear / editar perfil
    │   ├── PublicProfileModal.jsx  # Ver perfil de otro usuario
    │   ├── CreateTaskModal.jsx     # Formulario de nueva tarea
    │   ├── TaskCard.jsx            # Tarjeta con todas las acciones
    │   ├── TaskList.jsx            # Grid de tarjetas
    │   ├── TaskFilters.jsx         # Búsqueda, pills de estado y categoría
    │   └── NotificationBell.jsx    # Campana con historial de alertas
    ├── utils/
    │   └── helpers.js              # Formatters, status helpers
    └── styles/
        └── globals.css             # Design system + responsive
```

---

## Instalación

```bash
# Requisitos
# - Rust + Anchor CLI 0.32
# - Node 18+
# - Solana CLI con wallet configurada en devnet

# 1. Clonar e instalar
git clone https://github.com/tu-usuario/blinktasks
cd blinktasks
npm install

# 2. Compilar y desplegar el contrato
anchor build
anchor deploy

# 3. Copiar el Program ID generado a:
#    - programs/blinktasks/src/lib.rs → declare_id!(...)
#    - src/anchor.js → programId
#    - Anchor.toml → [programs.devnet]

# 4. Correr el frontend
npm run dev
```

---

## Flujo de uso

**Como cliente**
1. Conecta tu wallet
2. Crea tu perfil con `+ Crear perfil` (también inicializa tu vault)
3. Pulsa `+ Nueva tarea`, completa título, descripción, categoría, monto y deadline opcional
4. Cuando un worker entregue, verás el link en la tarjeta — aprueba o reporta un problema
5. Al aprobar, califica el trabajo de 1 a 5 estrellas y el SOL se transfiere automáticamente

**Como worker**
1. Conecta tu wallet y crea tu perfil
2. Pulsa `Aceptar tarea` en cualquier tarea disponible
3. Cuando termines, sube el link de tu entrega desde la misma tarjeta
4. Si el cliente reporta un error, puedes resubmitir cuantas veces sea necesario
5. Al aprobarse, el SOL llega directo a tu wallet y tu reputación sube +10 pts

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| Mobile `< 640px` | 1 columna · modales como bottom sheets · pills con scroll horizontal |
| Tablet `640–1024px` | 2 columnas · modales centrados |
| Desktop `1024px+` | 3 columnas · layout completo |

---

## Program ID

```
An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my
```

Red: **Devnet**

---

## Licencia

MIT