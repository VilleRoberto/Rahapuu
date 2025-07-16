# Rahapuu-sovellus - Suunnitteludokumentti

## 1. Käyttäjävirta ja Keskeiset Näkymät

### 1.1 Päänäkymät (Core Screens)

#### A) Aloitusnäkymä / Tervetuloa-ruutu
- **Tarkoitus**: Ensimmäinen näkymä sovelluksen avatessa
- **Elementit**: 
  - Lapsen nimi ja tervehdys
  - Nopea yleiskatsaus säästöihin
  - Pääpainike puunäkymään siirtymiseen
  - Vanhempi-painike (pieni, yläkulmassa)

#### B) Rahapuu-näkymä (Päänäkymä)
- **Tarkoitus**: Sovelluksen sydän - interaktiivinen puu
- **Elementit**:
  - Animoitu puun grafiikka (responsive touch)
  - Puun kasvu-indikaattori
  - Säästöjen kokonaissumma
  - "Lisää rahaa" -painike
  - Tavoitteet-painike
  - Asetukset-painike

#### C) Säästöjen lisääminen -näkymä
- **Tarkoitus**: Rahatapahtumien kirjaaminen
- **Elementit**:
  - Numeronäppäimistö
  - Summan syöttökenttä
  - Tavoitteen valinta (dropdown)
  - Muistiinpano-kenttä (valinnainen)
  - Tallenna/Peru -painikkeet
  - "Odottaa hyväksyntää" -status

#### D) Tavoitteet-näkymä
- **Tarkoitus**: Säästötavoitteiden hallinta ja seuranta
- **Elementit**:
  - Lista tavoitteista (scrollable)
  - Edistymispalkit
  - Tavoitteen kuvat/ikonit
  - Jäljellä oleva summa
  - "Uusi tavoite" -painike (jos vanhempi on hyväksynyt)

#### E) Tehtävät-näkymä
- **Tarkoitus**: Ansaintatehtävien listaus
- **Elementit**:
  - Tehtävälista (active/completed)
  - Tehtävän kuvaus ja palkkio
  - "Merkitse tehdyksi" -painike
  - Odottaa hyväksyntää -status

#### F) Vanhempi-näkymä (PIN-suojattu)
- **Tarkoitus**: Vanhemman hallintatyökalut
- **Elementit**:
  - PIN-koodi sisäänkirjautumiseen
  - Säästöjen hyväksyntä
  - Tavoitteiden hallinta
  - Tehtävien hallinta
  - Tilastot ja raportit
  - Asetukset

### 1.2 Käyttäjävirta-kaavio

```
Aloitusnäkymä
    ↓
Rahapuu-näkymä (Päänäkymä)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│ Lisää rahaa     │ Tavoitteet      │ Tehtävät        │
│                 │                 │                 │
│ → Odottaa       │ → Edistyminen   │ → Merkitse      │
│   hyväksyntää   │   näkyvissä     │   tehdyksi      │
└─────────────────┴─────────────────┴─────────────────┘
                    ↓
              Vanhempi-näkymä
                    ↓
            Hyväksyntä → Päivitä puu
```

## 2. Tietomalli (Data Model)

### 2.1 Tietokantataulut

#### User (Käyttäjä)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_type TEXT CHECK(user_type IN ('child', 'parent')) NOT NULL,
    pin_code TEXT, -- Vain vanhemmille
    language TEXT DEFAULT 'fi',
    tree_type TEXT DEFAULT 'default',
    background_theme TEXT DEFAULT 'forest',
    pet_companion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Savings_Goals (Säästötavoitteet)
```sql
CREATE TABLE savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    image_icon TEXT, -- Kuvan/ikonin tunniste
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Transactions (Rahatapahtumier)
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_id INTEGER, -- Voi olla NULL jos ei kohdistettu tavoitteeseen
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_type TEXT CHECK(transaction_type IN ('saving', 'task_reward', 'adjustment')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER, -- Viittaus vanhempaan
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (goal_id) REFERENCES savings_goals(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### Tasks (Tehtävät)
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reward_amount DECIMAL(10,2) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    approved_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tree_Progress (Puun edistyminen)
```sql
CREATE TABLE tree_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tree_level INTEGER DEFAULT 1,
    total_saved DECIMAL(10,2) DEFAULT 0,
    leaves_count INTEGER DEFAULT 0,
    fruits_count INTEGER DEFAULT 0,
    flowers_count INTEGER DEFAULT 0,
    decorations TEXT, -- JSON muotoa: {"stickers": [], "animals": []}
    last_growth_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.2 Tietomallin suhteet

- **Käyttäjä → Säästötavoitteet**: Yksi-moneen suhde
- **Käyttäjä → Rahatapahtumier**: Yksi-moneen suhde  
- **Käyttäjä → Tehtävät**: Yksi-moneen suhde
- **Käyttäjä → Puun edistyminen**: Yksi-yhteen suhde
- **Säästötavoite → Rahatapahtumier**: Yksi-moneen suhde (valinnainen)

## 3. UI-komponentit

### 3.1 Yhteiskomponentit (Shared Components)

#### MoneyInput
```typescript
interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  maxValue?: number;
  placeholder?: string;
}
```

#### ProgressBar
```typescript
interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}
```

#### GoalCard
```typescript
interface GoalCardProps {
  id: string;
  name: string;
  image: string;
  currentAmount: number;
  targetAmount: number;
  onPress?: () => void;
  showProgress?: boolean;
}
```

#### TaskCard
```typescript
interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  reward: number;
  isCompleted: boolean;
  isPending: boolean;
  onMarkCompleted?: () => void;
}
```

### 3.2 Rahapuu-spesifiset komponentit

#### AnimatedTree
```typescript
interface AnimatedTreeProps {
  level: number;
  leavesCount: number;
  fruitsCount: number;
  flowersCount: number;
  treeType: 'oak' | 'pine' | 'cherry' | 'apple';
  onTreePress?: () => void;
  isGrowing?: boolean;
}
```

#### TreeDecorations
```typescript
interface TreeDecorationsProps {
  decorations: {
    stickers: string[];
    animals: string[];
  };
  onAddDecoration?: (type: string, item: string) => void;
}
```

#### GrowthCelebration
```typescript
interface GrowthCelebrationProps {
  isVisible: boolean;
  achievementType: 'new_level' | 'new_goal' | 'task_completed';
  onComplete: () => void;
}
```

### 3.3 Vanhempi-näkymän komponentit

#### PINKeypad
```typescript
interface PINKeypadProps {
  onPINEntered: (pin: string) => void;
  onCancel: () => void;
  maxLength?: number;
}
```

#### TransactionApproval
```typescript
interface TransactionApprovalProps {
  transactions: PendingTransaction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}
```

#### GoalManager
```typescript
interface GoalManagerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}
```

## 4. Tekninen toteutus

### 4.1 Suositeltu teknologiapino

#### Frontend
- **Framework**: React Native (cross-platform)
- **Navigaatio**: React Navigation v6
- **Tila-hallinta**: Redux Toolkit tai Context API
- **Animaatiot**: React Native Reanimated 3
- **Lokalisaatio**: react-i18next
- **Ikonit**: react-native-vector-icons

#### Backend/Tietokerttä
- **Paikallinen**: SQLite (react-native-sqlite-storage)
- **Pilvivaihtoehto**: Firebase Firestore
- **Offline-tuki**: AsyncStorage backupina

#### Animaatiot ja grafiikka
- **Lottie**: Valmiit animaatiot
- **React Native SVG**: Vektorigrafiikka
- **React Native Gesture Handler**: Kosketusinteraktiot

### 4.2 Projektikansiorakenne

```
src/
├── components/
│   ├── shared/
│   │   ├── MoneyInput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── GoalCard.tsx
│   ├── tree/
│   │   ├── AnimatedTree.tsx
│   │   ├── TreeDecorations.tsx
│   │   └── GrowthCelebration.tsx
│   └── parent/
│       ├── PINKeypad.tsx
│       ├── TransactionApproval.tsx
│       └── GoalManager.tsx
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── TreeScreen.tsx
│   ├── AddMoneyScreen.tsx
│   ├── GoalsScreen.tsx
│   ├── TasksScreen.tsx
│   └── ParentScreen.tsx
├── services/
│   ├── database.ts
│   ├── treeLogic.ts
│   └── animations.ts
├── types/
│   ├── user.ts
│   ├── goal.ts
│   ├── transaction.ts
│   └── tree.ts
├── utils/
│   ├── currency.ts
│   ├── validation.ts
│   └── constants.ts
└── locales/
    ├── fi.json
    └── en.json
```

## 5. Kehityssuunnitelma

### 5.1 Vaihe 1: MVP (Minimum Viable Product)
- Perus puun näkymä
- Säästöjen lisääminen
- Yksinkertainen vanhempi-hyväksyntä
- Yksi säästötavoite

### 5.2 Vaihe 2: Laajennukset
- Useampia tavoitteita
- Tehtävälista
- Puun personointi
- Paremmat animaatiot

### 5.3 Vaihe 3: Lisäominaisuudet
- Pilvisynkronointi
- Perhekäyttäjät
- Tilastot ja raportit
- Offline-tuki

## 6. Käyttökokemus (UX) huomioita

### 6.1 Lapsiystävällisyys
- **Isot painikkeet**: Minimum 44px korkeus
- **Värikäs paletti**: Iloinen ja turvallinen
- **Yksinkertainen navigaatio**: Maksimissaan 3 tason syvyys
- **Välitön palaute**: Animaatiot ja äänet

### 6.2 Motivaatio
- **Palkitseva edistyminen**: Visuaalinen kasvu
- **Saavutukset**: Erikoiset animaatiot
- **Personointi**: Oma puu ja eläinystävä
- **Positiivinen vahvistus**: Kannustavat viestit

### 6.3 Turvallisuus
- **PIN-suojaus**: Vanhempien alue
- **Ei oikeaa rahaa**: Vain kirjanpito
- **Paikallinen data**: Ei henkilötietoja pilveen
- **Yksinkertainen poisto**: Helppoa nollata

## 7. Seuraavat askeleet

1. **Prototyyppi**: Luo wireframet ja mockupit
2. **Tekninen arkkitehtuuri**: Tarkenna tietomalli
3. **Design System**: Värit, fontit, komponentit
4. **Kehitysympäristö**: React Native setup
5. **MVP-toteutus**: Aloita ydinominaisuuksista

Haluatko, että autan tarkemmin jonkin näistä osa-alueista kanssa?