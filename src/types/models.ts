export type SortMode = 'participant' | 'item';

export interface Occasion {
  id: string;
  code: string;
  title: string;
  date?: string;
  time?: string;
  createdAt: string;
  status: 'draft' | 'active' | 'archived';
}

export interface Participant {
  id: string;
  occasionId: string;
  name: string;
  joinedAt: string;
}

export interface ContributionItem {
  id: string;
  occasionId: string;
  participantId: string;
  name: string;
  category: 'food' | 'drink' | 'dessert' | 'supplies';
  quantity: string;
  notes: string;
}

export interface Suggestion {
  id: string;
  occasionId: string;
  text: string;
  createdAt: string;
}

export interface OccasionView {
  occasion: Occasion;
  participants: Participant[];
  items: ContributionItem[];
  suggestions: Suggestion[];
}

export interface JoinFormValues {
  code: string;
  name: string;
}

export interface AddItemValues {
  participantId: string;
  name: string;
  category: ContributionItem['category'];
  quantity: string;
  notes: string;
}
