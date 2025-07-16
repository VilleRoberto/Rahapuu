import SQLite from 'react-native-sqlite-storage';
import { User } from '../types/user';
import { SavingsGoal } from '../types/goal';
import { Transaction } from '../types/transaction';
import { TreeProgress } from '../types/tree';
import { Task } from '../types/tree';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'RahapuuApp.db',
        location: 'default',
      });
      
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        user_type TEXT CHECK(user_type IN ('child', 'parent')) NOT NULL,
        pin_code TEXT,
        language TEXT DEFAULT 'fi',
        tree_type TEXT DEFAULT 'default',
        background_theme TEXT DEFAULT 'forest',
        pet_companion TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS savings_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        image_icon TEXT,
        is_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goal_id TEXT,
        amount REAL NOT NULL,
        description TEXT,
        transaction_type TEXT CHECK(transaction_type IN ('saving', 'task_reward', 'adjustment')) NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_at TEXT,
        approved_by TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (goal_id) REFERENCES savings_goals(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        reward_amount REAL NOT NULL,
        is_completed INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        approved_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tree_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tree_level INTEGER DEFAULT 1,
        total_saved REAL DEFAULT 0,
        leaves_count INTEGER DEFAULT 0,
        fruits_count INTEGER DEFAULT 0,
        flowers_count INTEGER DEFAULT 0,
        decorations TEXT DEFAULT '{"stickers":[],"animals":[]}',
        last_growth_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    ];

    for (const table of tables) {
      await this.db.executeSql(table);
    }
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };

    await this.db.executeSql(
      `INSERT INTO users (id, name, user_type, pin_code, language, tree_type, background_theme, pet_companion, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.name, user.userType, user.pinCode || null, user.language, user.treeType, user.backgroundTheme, user.petCompanion || null, now, now]
    );

    // Create initial tree progress for child users
    if (user.userType === 'child') {
      await this.createInitialTreeProgress(id);
    }

    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [result] = await this.db.executeSql(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows.item(0);
    return {
      id: row.id,
      name: row.name,
      userType: row.user_type,
      pinCode: row.pin_code,
      language: row.language,
      treeType: row.tree_type,
      backgroundTheme: row.background_theme,
      petCompanion: row.pet_companion,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Goal operations
  async createGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<SavingsGoal> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newGoal: SavingsGoal = {
      ...goal,
      id,
      createdAt: now
    };

    await this.db.executeSql(
      `INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, image_icon, is_completed, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, goal.userId, goal.name, goal.description || null, goal.targetAmount, goal.currentAmount, goal.imageIcon, goal.isCompleted ? 1 : 0, now]
    );

    return newGoal;
  }

  async getGoalsByUserId(userId: string): Promise<SavingsGoal[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [result] = await this.db.executeSql(
      'SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const goals: SavingsGoal[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      goals.push({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        targetAmount: row.target_amount,
        currentAmount: row.current_amount,
        imageIcon: row.image_icon,
        isCompleted: row.is_completed === 1,
        createdAt: row.created_at,
        completedAt: row.completed_at
      });
    }
    
    return goals;
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now
    };

    await this.db.executeSql(
      `INSERT INTO transactions (id, user_id, goal_id, amount, description, transaction_type, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, transaction.userId, transaction.goalId || null, transaction.amount, transaction.description || null, transaction.transactionType, transaction.status, now]
    );

    return newTransaction;
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [result] = await this.db.executeSql(
      'SELECT * FROM transactions WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, 'pending']
    );
    
    const transactions: Transaction[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      transactions.push({
        id: row.id,
        userId: row.user_id,
        goalId: row.goal_id,
        amount: row.amount,
        description: row.description,
        transactionType: row.transaction_type,
        status: row.status,
        createdAt: row.created_at,
        approvedAt: row.approved_at,
        approvedBy: row.approved_by
      });
    }
    
    return transactions;
  }

  async approveTransaction(transactionId: string, approvedBy: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    
    await this.db.executeSql(
      'UPDATE transactions SET status = ?, approved_at = ?, approved_by = ? WHERE id = ?',
      ['approved', now, approvedBy, transactionId]
    );

    // Update goal current amount if transaction has a goal
    const [result] = await this.db.executeSql(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    if (result.rows.length > 0) {
      const transaction = result.rows.item(0);
      if (transaction.goal_id) {
        await this.db.executeSql(
          'UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?',
          [transaction.amount, transaction.goal_id]
        );
      }
      
      // Update tree progress
      await this.updateTreeProgress(transaction.user_id, transaction.amount);
    }
  }

  // Tree progress operations
  async createInitialTreeProgress(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.executeSql(
      `INSERT INTO tree_progress (id, user_id, tree_level, total_saved, leaves_count, fruits_count, flowers_count, decorations) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, 1, 0, 0, 0, 0, '{"stickers":[],"animals":[]}']
    );
  }

  async getTreeProgress(userId: string): Promise<TreeProgress | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [result] = await this.db.executeSql(
      'SELECT * FROM tree_progress WHERE user_id = ?',
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows.item(0);
    return {
      id: row.id,
      userId: row.user_id,
      treeLevel: row.tree_level,
      totalSaved: row.total_saved,
      leavesCount: row.leaves_count,
      fruitsCount: row.fruits_count,
      flowersCount: row.flowers_count,
      decorations: JSON.parse(row.decorations),
      lastGrowthAt: row.last_growth_at
    };
  }

  async updateTreeProgress(userId: string, amount: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    
    // Calculate new values based on amount
    const newLeaves = Math.floor(amount / 5); // 1 leaf per 5 euros
    const newFruits = Math.floor(amount / 25); // 1 fruit per 25 euros
    const newFlowers = Math.floor(amount / 10); // 1 flower per 10 euros
    
    await this.db.executeSql(
      `UPDATE tree_progress 
       SET total_saved = total_saved + ?, 
           leaves_count = leaves_count + ?, 
           fruits_count = fruits_count + ?, 
           flowers_count = flowers_count + ?,
           last_growth_at = ?
       WHERE user_id = ?`,
      [amount, newLeaves, newFruits, newFlowers, now, userId]
    );
  }

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newTask: Task = {
      ...task,
      id,
      createdAt: now
    };

    await this.db.executeSql(
      `INSERT INTO tasks (id, user_id, title, description, reward_amount, is_completed, is_approved, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, task.userId, task.title, task.description || null, task.rewardAmount, task.isCompleted ? 1 : 0, task.isApproved ? 1 : 0, now]
    );

    return newTask;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [result] = await this.db.executeSql(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const tasks: Task[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      tasks.push({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        rewardAmount: row.reward_amount,
        isCompleted: row.is_completed === 1,
        isApproved: row.is_approved === 1,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        approvedAt: row.approved_at
      });
    }
    
    return tasks;
  }

  async completeTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    
    await this.db.executeSql(
      'UPDATE tasks SET is_completed = 1, completed_at = ? WHERE id = ?',
      [now, taskId]
    );
  }

  async approveTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    
    await this.db.executeSql(
      'UPDATE tasks SET is_approved = 1, approved_at = ? WHERE id = ?',
      [now, taskId]
    );

    // Create transaction for task reward
    const [result] = await this.db.executeSql(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    
    if (result.rows.length > 0) {
      const task = result.rows.item(0);
      await this.createTransaction({
        userId: task.user_id,
        amount: task.reward_amount,
        description: `Tehtävä: ${task.title}`,
        transactionType: 'task_reward',
        status: 'approved'
      });
      
      // Update tree progress
      await this.updateTreeProgress(task.user_id, task.reward_amount);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export default new DatabaseService();