export interface TreeProgress {
  id: string;
  userId: string;
  treeLevel: number;
  totalSaved: number;
  leavesCount: number;
  fruitsCount: number;
  flowersCount: number;
  decorations: TreeDecorations;
  lastGrowthAt?: string;
}

export interface TreeDecorations {
  stickers: string[];
  animals: string[];
}

export interface TreeGrowthEvent {
  type: 'new_level' | 'new_leaves' | 'new_fruit' | 'new_flower';
  amount: number;
  totalSaved: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  rewardAmount: number;
  isCompleted: boolean;
  isApproved: boolean;
  createdAt: string;
  completedAt?: string;
  approvedAt?: string;
}