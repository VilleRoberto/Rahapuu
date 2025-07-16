export interface User {
  id: string;
  name: string;
  userType: 'child' | 'parent';
  pinCode?: string;
  language: string;
  treeType: string;
  backgroundTheme: string;
  petCompanion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  language: string;
  treeType: string;
  backgroundTheme: string;
  petCompanion?: string;
}