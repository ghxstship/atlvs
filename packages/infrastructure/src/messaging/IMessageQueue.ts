/**
 * Message Queue Interface - Adapter Pattern
 * Abstracts message queue implementation (RabbitMQ, SQS, Redis, etc.)
 */

export interface QueueMessage<T = unknown> {
  id: string;
  data: T;
  timestamp: Date;
  attempts: number;
  maxAttempts?: number;
  priority?: number;
  delay?: number;
}

export interface QueueOptions {
  maxAttempts?: number;
  retryDelay?: number;
  priority?: number;
  delay?: number;
}

export interface MessageHandler<T = unknown> {
  (message: QueueMessage<T>): Promise<void>;
}

export interface IMessageQueue {
  // Publishing
  publish<T>(queue: string, data: T, options?: QueueOptions): Promise<string>;
  publishBatch<T>(queue: string, messages: T[], options?: QueueOptions): Promise<string[]>;
  
  // Consuming
  subscribe<T>(queue: string, handler: MessageHandler<T>): Promise<void>;
  unsubscribe(queue: string): Promise<void>;
  
  // Management
  getQueueSize(queue: string): Promise<number>;
  purgeQueue(queue: string): Promise<void>;
  deleteMessage(queue: string, messageId: string): Promise<void>;
  
  // Dead Letter Queue
  getDeadLetterQueue(queue: string): Promise<QueueMessage[]>;
  retryDeadLetter(queue: string, messageId: string): Promise<void>;
}
