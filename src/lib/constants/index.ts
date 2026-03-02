// src/lib/constants/index.ts
export const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop', icon: 'Tool' },
  { value: 'seminar', label: 'Seminar', icon: 'Presentation' },
  { value: 'conference', label: 'Conference', icon: 'Users' },
  { value: 'webinar', label: 'Webinar', icon: 'Video' },
  { value: 'competition', label: 'Competition', icon: 'Trophy' },
  { value: 'field_visit', label: 'Field Visit', icon: 'MapPin' },
  { value: 'awareness_campaign', label: 'Awareness Campaign', icon: 'Megaphone' },
  { value: 'tree_plantation', label: 'Tree Plantation', icon: 'TreePine' },
  { value: 'cleanliness_drive', label: 'Cleanliness Drive', icon: 'Sparkles' },
  { value: 'other', label: 'Other', icon: 'Circle' },
] as const;

export const ITEMS_PER_PAGE = 9;