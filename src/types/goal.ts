export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  imageIcon: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface GoalProgress {
  goalId: string;
  percentage: number;
  remainingAmount: number;
  isCompleted: boolean;
}