import type {
  AddItemValues,
  ContributionItem,
  Occasion,
  OccasionView,
  Participant,
  Suggestion,
} from '../../../types/models';
import { firestoreDb } from '../../../lib/firebase/config';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

const OCCASIONS_KEY = 'knytis.occasions';
const VIEWER_KEY = 'knytis.viewerByCode';

type StoredOccasions = Record<string, OccasionView>;
type StoredViewers = Record<string, string>;

const now = () => new Date().toISOString();

const makeId = () => crypto.randomUUID();

const normalizeCode = (code: string) => code.trim().toUpperCase();

const occasionsCollection = () => {
  if (!firestoreDb) {
    throw new Error('Firebase is not configured.');
  }

  return collection(firestoreDb, 'occasions');
};

const occasionDocument = (code: string) => doc(occasionsCollection(), normalizeCode(code));

const participantCollection = (code: string) =>
  collection(occasionDocument(code), 'participants');

const itemCollection = (code: string) => collection(occasionDocument(code), 'items');

const suggestionCollection = (code: string) =>
  collection(occasionDocument(code), 'suggestions');

const readOccasions = (): StoredOccasions => {
  const raw = localStorage.getItem(OCCASIONS_KEY);

  if (!raw) {
    const seeded = seedOccasions();
    localStorage.setItem(OCCASIONS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return JSON.parse(raw) as StoredOccasions;
};

const LOCAL_CHANGE_EVENT = 'knytis.localChange';

const writeOccasions = (occasions: StoredOccasions) => {
  localStorage.setItem(OCCASIONS_KEY, JSON.stringify(occasions));
  window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
};

const readViewers = (): StoredViewers => {
  const raw = localStorage.getItem(VIEWER_KEY);
  return raw ? (JSON.parse(raw) as StoredViewers) : {};
};

const writeViewers = (viewers: StoredViewers) => {
  localStorage.setItem(VIEWER_KEY, JSON.stringify(viewers));
};

const seedOccasions = (): StoredOccasions => {
  const occasionId = makeId();
  const participants: Participant[] = [
    {
      id: makeId(),
      occasionId,
      name: 'Alex',
      joinedAt: now(),
    },
    {
      id: makeId(),
      occasionId,
      name: 'Sam',
      joinedAt: now(),
    },
  ];

  const items: ContributionItem[] = [
    {
      id: makeId(),
      occasionId,
      participantId: participants[0].id,
      name: 'Pasta salad',
      category: 'food',
      quantity: '1 large bowl',
      notes: 'Vegetarian',
    },
    {
      id: makeId(),
      occasionId,
      participantId: participants[1].id,
      name: 'Sparkling water',
      category: 'drink',
      quantity: '6 bottles',
      notes: '',
    },
  ];

  const suggestions: Suggestion[] = [
    {
      id: makeId(),
      occasionId,
      text: 'Maybe someone could bring napkins.',
      createdAt: now(),
    },
  ];

  const occasion: Occasion = {
    id: occasionId,
    code: 'DEMO42',
    title: 'Friday Potluck',
    createdAt: now(),
    status: 'active',
  };

  return {
    [occasion.code]: {
      occasion,
      participants,
      items,
      suggestions,
    },
  };
};

export const listOccasions = (): Occasion[] =>
  Object.values(readOccasions()).map(({ occasion }) => occasion);

const getLocalOccasionByCode = (code: string): OccasionView | null => {
  const normalizedCode = normalizeCode(code);
  return readOccasions()[normalizedCode] ?? null;
};

const mapCollection = <T extends { id: string }>(
  snapshot: QuerySnapshot,
): T[] => snapshot.docs.map((documentSnapshot) => documentSnapshot.data() as T);

const buildOccasionView = async (code: string): Promise<OccasionView | null> => {
  const occasionSnapshot = await getDoc(occasionDocument(code));

  if (!occasionSnapshot.exists()) {
    return null;
  }

  const [participantsSnapshot, itemsSnapshot, suggestionsSnapshot] = await Promise.all([
    getDocs(query(participantCollection(code))),
    getDocs(query(itemCollection(code))),
    getDocs(query(suggestionCollection(code))),
  ]);

  return {
    occasion: occasionSnapshot.data() as Occasion,
    participants: mapCollection<Participant>(participantsSnapshot),
    items: mapCollection<ContributionItem>(itemsSnapshot),
    suggestions: mapCollection<Suggestion>(suggestionsSnapshot),
  };
};

export const getOccasionByCode = async (code: string): Promise<OccasionView | null> => {
  if (!firestoreDb) {
    return getLocalOccasionByCode(code);
  }

  return buildOccasionView(code);
};

export const createOccasionCode = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
};

interface CreateOccasionOptions {
  title: string;
  hostName: string;
  date?: string;
  time?: string;
}

const createLocalOccasion = (options: CreateOccasionOptions): OccasionView => {
  const occasions = readOccasions();
  let code = createOccasionCode();

  while (occasions[code]) {
    code = createOccasionCode();
  }

  const occasionId = makeId();
  const participant: Participant = {
    id: makeId(),
    occasionId,
    name: options.hostName.trim(),
    joinedAt: now(),
  };

  const occasion: Occasion = {
    id: occasionId,
    code,
    title: options.title.trim() || 'Untitled occasion',
    ...(options.date && { date: options.date }),
    ...(options.time && { time: options.time }),
    createdAt: now(),
    status: 'active',
  };

  const occasionView: OccasionView = {
    occasion,
    participants: [participant],
    items: [],
    suggestions: [],
  };

  occasions[code] = occasionView;
  writeOccasions(occasions);
  setViewerName(code, participant.name);

  return occasionView;
};

export const createOccasion = async (
  options: CreateOccasionOptions,
): Promise<OccasionView> => {
  if (!firestoreDb) {
    return createLocalOccasion(options);
  }

  let code = createOccasionCode();

  while ((await getDoc(occasionDocument(code))).exists()) {
    code = createOccasionCode();
  }

  const occasion: Occasion = {
    id: code,
    code,
    title: options.title.trim() || 'Untitled occasion',
    ...(options.date && { date: options.date }),
    ...(options.time && { time: options.time }),
    createdAt: now(),
    status: 'active',
  };

  const participant: Participant = {
    id: makeId(),
    occasionId: occasion.id,
    name: options.hostName.trim(),
    joinedAt: now(),
  };

  await Promise.all([
    setDoc(occasionDocument(code), occasion),
    setDoc(doc(participantCollection(code), participant.id), participant),
  ]);

  setViewerName(code, participant.name);

  return {
    occasion,
    participants: [participant],
    items: [],
    suggestions: [],
  };
};

const joinLocalOccasion = (code: string, name: string): OccasionView | null => {
  const normalizedCode = normalizeCode(code);
  const occasions = readOccasions();
  const existingOccasion = occasions[normalizedCode];

  if (!existingOccasion) {
    return null;
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return existingOccasion;
  }

  const alreadyJoined = existingOccasion.participants.some(
    (participant) => participant.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (!alreadyJoined) {
    existingOccasion.participants = [
      ...existingOccasion.participants,
      {
        id: makeId(),
        occasionId: existingOccasion.occasion.id,
        name: trimmedName,
        joinedAt: now(),
      },
    ];
  }

  occasions[normalizedCode] = existingOccasion;
  writeOccasions(occasions);
  setViewerName(normalizedCode, trimmedName);

  return existingOccasion;
};

export const joinOccasion = async (
  code: string,
  name: string,
): Promise<OccasionView | null> => {
  if (!firestoreDb) {
    return joinLocalOccasion(code, name);
  }

  const occasionView = await buildOccasionView(code);

  if (!occasionView) {
    return null;
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return occasionView;
  }

  const alreadyJoined = occasionView.participants.some(
    (participant) => participant.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (!alreadyJoined) {
    const participant: Participant = {
      id: makeId(),
      occasionId: occasionView.occasion.id,
      name: trimmedName,
      joinedAt: now(),
    };

    await setDoc(doc(participantCollection(code), participant.id), participant);
  }

  setViewerName(code, trimmedName);
  return buildOccasionView(code);
};

export const addItemToOccasion = async (
  code: string,
  values: AddItemValues,
): Promise<OccasionView | null> => {
  if (!firestoreDb) {
    const normalizedCode = normalizeCode(code);
    const occasions = readOccasions();
    const occasionView = occasions[normalizedCode];

    if (!occasionView) {
      return null;
    }

    occasionView.items = [
      ...occasionView.items,
      {
        id: makeId(),
        occasionId: occasionView.occasion.id,
        participantId: values.participantId,
        name: values.name.trim(),
        category: values.category,
        quantity: values.quantity.trim(),
        notes: values.notes.trim(),
      },
    ];

    occasions[normalizedCode] = occasionView;
    writeOccasions(occasions);
    return occasionView;
  }

  const occasionView = await buildOccasionView(code);

  if (!occasionView) {
    return null;
  }

  const item: ContributionItem = {
    id: makeId(),
    occasionId: occasionView.occasion.id,
    participantId: values.participantId,
    name: values.name.trim(),
    category: values.category,
    quantity: values.quantity.trim(),
    notes: values.notes.trim(),
  };

  await setDoc(doc(itemCollection(code), item.id), item);
  return buildOccasionView(code);
};

export const updateItemInOccasion = async (
  code: string,
  itemId: string,
  updates: { name?: string; notes?: string },
): Promise<void> => {
  if (!firestoreDb) {
    const normalizedCode = normalizeCode(code);
    const occasions = readOccasions();
    const occasionView = occasions[normalizedCode];

    if (!occasionView) return;

    occasionView.items = occasionView.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            ...(updates.name !== undefined && { name: updates.name.trim() }),
            ...(updates.notes !== undefined && { notes: updates.notes.trim() }),
          }
        : item,
    );

    occasions[normalizedCode] = occasionView;
    writeOccasions(occasions);
    return;
  }

  await updateDoc(doc(itemCollection(code), itemId), updates);
};

export const deleteItemFromOccasion = async (
  code: string,
  itemId: string,
): Promise<void> => {
  if (!firestoreDb) {
    const normalizedCode = normalizeCode(code);
    const occasions = readOccasions();
    const occasionView = occasions[normalizedCode];

    if (!occasionView) return;

    occasionView.items = occasionView.items.filter((item) => item.id !== itemId);
    occasions[normalizedCode] = occasionView;
    writeOccasions(occasions);
    return;
  }

  await deleteDoc(doc(itemCollection(code), itemId));
};

export const addSuggestionToOccasion = async (
  code: string,
  text: string,
): Promise<OccasionView | null> => {
  if (!firestoreDb) {
    const normalizedCode = normalizeCode(code);
    const occasions = readOccasions();
    const occasionView = occasions[normalizedCode];

    if (!occasionView) {
      return null;
    }

    occasionView.suggestions = [
      ...occasionView.suggestions,
      {
        id: makeId(),
        occasionId: occasionView.occasion.id,
        text: text.trim(),
        createdAt: now(),
      },
    ];

    occasions[normalizedCode] = occasionView;
    writeOccasions(occasions);
    return occasionView;
  }

  const occasionView = await buildOccasionView(code);

  if (!occasionView) {
    return null;
  }

  const suggestion: Suggestion = {
    id: makeId(),
    occasionId: occasionView.occasion.id,
    text: text.trim(),
    createdAt: now(),
  };

  await setDoc(doc(suggestionCollection(code), suggestion.id), suggestion);
  return buildOccasionView(code);
};

export const subscribeToOccasion = (
  code: string,
  onChange: (occasionView: OccasionView | null) => void,
): Unsubscribe => {
  if (!firestoreDb) {
    onChange(getLocalOccasionByCode(code));

    const handleChange = () => {
      onChange(getLocalOccasionByCode(code));
    };

    window.addEventListener(LOCAL_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(LOCAL_CHANGE_EVENT, handleChange);
  }

  let occasion: Occasion | null = null;
  let participants: Participant[] = [];
  let items: ContributionItem[] = [];
  let suggestions: Suggestion[] = [];

  const emit = () => {
    if (!occasion) {
      onChange(null);
      return;
    }

    onChange({
      occasion,
      participants,
      items,
      suggestions,
    });
  };

  const unsubscribes = [
    onSnapshot(occasionDocument(code), (snapshot) => {
      occasion = snapshot.exists() ? (snapshot.data() as Occasion) : null;
      emit();
    }),
    onSnapshot(query(participantCollection(code)), (snapshot) => {
      participants = mapCollection<Participant>(snapshot);
      emit();
    }),
    onSnapshot(query(itemCollection(code)), (snapshot) => {
      items = mapCollection<ContributionItem>(snapshot);
      emit();
    }),
    onSnapshot(query(suggestionCollection(code)), (snapshot) => {
      suggestions = mapCollection<Suggestion>(snapshot);
      emit();
    }),
  ];

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};

export const getViewerName = (code: string): string => {
  const normalizedCode = normalizeCode(code);
  return readViewers()[normalizedCode] ?? '';
};

export const setViewerName = (code: string, name: string) => {
  const normalizedCode = normalizeCode(code);
  const viewers = readViewers();
  viewers[normalizedCode] = name.trim();
  writeViewers(viewers);
};

export interface KnownOccasion {
  code: string;
  title: string;
  createdAt: string;
}

export const getKnownOccasions = (): KnownOccasion[] => {
  const viewers = readViewers();
  const codes = Object.keys(viewers);

  if (!firestoreDb) {
    const occasions = readOccasions();
    return codes
      .map((code) => {
        const occ = occasions[code];
        if (!occ) return null;
        return { code, title: occ.occasion.title, createdAt: occ.occasion.createdAt };
      })
      .filter((o): o is KnownOccasion => o !== null);
  }

  // For Firebase mode, return codes with empty titles — the component will resolve them async
  return codes.map((code) => ({ code, title: code, createdAt: '' }));
};

export const getKnownOccasionsAsync = async (): Promise<KnownOccasion[]> => {
  const viewers = readViewers();
  const codes = Object.keys(viewers);

  if (!firestoreDb) {
    return getKnownOccasions();
  }

  const results = await Promise.all(
    codes.map(async (code) => {
      try {
        const snap = await getDoc(occasionDocument(code));
        if (!snap.exists()) return null;
        const data = snap.data() as Occasion;
        return { code, title: data.title, createdAt: data.createdAt };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((o): o is KnownOccasion => o !== null);
};
