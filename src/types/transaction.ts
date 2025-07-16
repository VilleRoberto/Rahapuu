export interface Transaction {
  id: string;
  userId: string;
  goalId?: string;
  amount: number;
  description?: string;
  transactionType: 'saving' | 'task_reward' | 'adjustment';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PendingTransaction extends Transaction {
  status: 'pending';
}