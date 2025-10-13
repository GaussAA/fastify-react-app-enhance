/**
 * 多轮对话服务
 * 实现基于上下文的自然语言理解和状态机管理
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from './session.service.js';

export interface DialogueState {
  id: string;
  sessionId: string;
  currentState: string;
  context: Record<string, any>;
  history: DialogueTurn[];
  pendingActions: string[];
  metadata: {
    createdAt: Date;
    lastUpdate: Date;
    stateTransitions: StateTransition[];
  };
}

export interface DialogueTurn {
  id: string;
  userInput: string;
  intent: string;
  entities: Record<string, any>;
  systemResponse: string;
  stateBefore: string;
  stateAfter: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  slots: Record<string, any>;
}

export interface DialogueConfig {
  maxContextTurns: number;
  stateTimeout: number;
  enableInterruption: boolean;
  enableRecovery: boolean;
}

export class DialogueManager extends EventEmitter {
  private dialogues: Map<string, DialogueState> = new Map();
  private stateMachines: Map<string, StateMachine> = new Map();
  private sessionManager: SessionManager;
  private config: DialogueConfig;

  constructor(
    sessionManager: SessionManager,
    config: Partial<DialogueConfig> = {}
  ) {
    super();
    this.sessionManager = sessionManager;
    this.config = {
      maxContextTurns: 10,
      stateTimeout: 5 * 60 * 1000, // 5分钟
      enableInterruption: true,
      enableRecovery: true,
      ...config,
    };

    // 初始化默认状态机
    this.initializeDefaultStateMachine();
  }

  /**
   * 创建新的对话状态
   */
  async createDialogue(
    sessionId: string,
    initialState: string = 'greeting'
  ): Promise<DialogueState> {
    const dialogueId = uuidv4();
    const now = new Date();

    const dialogue: DialogueState = {
      id: dialogueId,
      sessionId,
      currentState: initialState,
      context: {},
      history: [],
      pendingActions: [],
      metadata: {
        createdAt: now,
        lastUpdate: now,
        stateTransitions: [],
      },
    };

    this.dialogues.set(dialogueId, dialogue);

    // 更新会话上下文
    await this.sessionManager.updateContext(sessionId, {
      dialogueId,
      currentState: initialState,
    });

    this.emit('dialogueCreated', dialogue);
    return dialogue;
  }

  /**
   * 处理用户输入
   */
  async processUserInput(
    sessionId: string,
    userInput: string
  ): Promise<{
    response: string;
    newState: string;
    actions: string[];
  }> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 获取或创建对话状态
    let dialogue = this.getDialogueBySessionId(sessionId);
    if (!dialogue) {
      dialogue = await this.createDialogue(sessionId);
    }

    // 意图识别
    const intentResult = await this.recognizeIntent(userInput);

    // 状态机处理
    const stateResult = await this.processStateMachine(dialogue, intentResult);

    // 生成响应
    const response = await this.generateResponse(
      dialogue,
      intentResult,
      stateResult
    );

    // 更新对话状态
    await this.updateDialogueState(
      dialogue,
      intentResult,
      stateResult,
      response
    );

    // 记录对话轮次
    await this.recordDialogueTurn(
      dialogue,
      userInput,
      intentResult,
      response,
      stateResult
    );

    return {
      response,
      newState: stateResult.newState,
      actions: stateResult.actions,
    };
  }

  /**
   * 获取对话状态
   */
  getDialogueBySessionId(sessionId: string): DialogueState | undefined {
    for (const dialogue of this.dialogues.values()) {
      if (dialogue.sessionId === sessionId) {
        return dialogue;
      }
    }
    return undefined;
  }

  /**
   * 意图识别
   */
  private async recognizeIntent(userInput: string): Promise<IntentResult> {
    // 这里可以集成更复杂的NLP模型
    // 目前实现基础的规则匹配

    if (!userInput || typeof userInput !== 'string') {
      return {
        intent: 'general',
        confidence: 0.5,
        entities: {},
        slots: {},
      };
    }

    const input = userInput.toLowerCase().trim();

    // 基础意图识别规则
    if (this.matchesPattern(input, ['你好', 'hello', 'hi', '嗨'])) {
      return {
        intent: 'greeting',
        confidence: 0.9,
        entities: {},
        slots: {},
      };
    }

    if (this.matchesPattern(input, ['再见', 'bye', 'goodbye', '拜拜'])) {
      return {
        intent: 'farewell',
        confidence: 0.9,
        entities: {},
        slots: {},
      };
    }

    if (this.matchesPattern(input, ['帮助', 'help', '怎么用', '如何使用'])) {
      return {
        intent: 'help_request',
        confidence: 0.8,
        entities: {},
        slots: {},
      };
    }

    if (this.matchesPattern(input, ['问题', 'question', '问', '？', '?'])) {
      return {
        intent: 'question',
        confidence: 0.7,
        entities: this.extractEntities(userInput),
        slots: {},
      };
    }

    if (this.matchesPattern(input, ['谢谢', 'thank', 'thanks', '感谢'])) {
      return {
        intent: 'thanks',
        confidence: 0.8,
        entities: {},
        slots: {},
      };
    }

    // 默认意图
    return {
      intent: 'general',
      confidence: 0.5,
      entities: this.extractEntities(userInput),
      slots: {},
    };
  }

  /**
   * 实体提取
   */
  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 提取时间实体
    const timePattern =
      /(\d{1,2}[:：]\d{2}|\d{1,2}点|\d{1,2}时|今天|明天|昨天|现在)/g;
    const timeMatches = text.match(timePattern);
    if (timeMatches) {
      entities.time = timeMatches;
    }

    // 提取数字实体
    const numberPattern = /\d+/g;
    const numberMatches = text.match(numberPattern);
    if (numberMatches) {
      entities.numbers = numberMatches.map(n => parseInt(n));
    }

    // 提取人名实体（简单规则）
    const namePattern = /[A-Za-z\u4e00-\u9fa5]{2,4}/g;
    const nameMatches = text.match(namePattern);
    if (nameMatches) {
      entities.potential_names = nameMatches;
    }

    return entities;
  }

  /**
   * 模式匹配
   */
  private matchesPattern(input: string, patterns: string[]): boolean {
    return patterns.some(pattern => input.includes(pattern));
  }

  /**
   * 状态机处理
   */
  private async processStateMachine(
    dialogue: DialogueState,
    intentResult: IntentResult
  ): Promise<{
    newState: string;
    actions: string[];
    shouldContinue: boolean;
  }> {
    const stateMachine = this.stateMachines.get('default');
    if (!stateMachine) {
      throw new Error('State machine not found');
    }

    const currentState = stateMachine.getState(dialogue.currentState);
    if (!currentState) {
      throw new Error(`State ${dialogue.currentState} not found`);
    }

    // 查找匹配的转换
    const transition = currentState.transitions.find(
      t =>
        t.intent === intentResult.intent &&
        intentResult.confidence >= t.confidence
    );
    if (!transition) {
      // 如果没有匹配的转换，保持当前状态
      return {
        newState: dialogue.currentState,
        actions: [],
        shouldContinue: true,
      };
    }

    // 执行转换
    const newState = transition.targetState;
    const actions = transition.actions || [];

    // 记录状态转换
    dialogue.metadata.stateTransitions.push({
      from: dialogue.currentState,
      to: newState,
      trigger: intentResult.intent,
      timestamp: new Date(),
      metadata: { confidence: intentResult.confidence },
    });

    return {
      newState,
      actions,
      shouldContinue: transition.shouldContinue !== false,
    };
  }

  /**
   * 生成响应
   */
  private async generateResponse(
    dialogue: DialogueState,
    intentResult: IntentResult,
    stateResult: any
  ): Promise<string> {
    // 根据意图和状态生成响应
    const responses: Record<string, string[]> = {
      greeting: [
        '你好！很高兴见到你！有什么我可以帮助你的吗？',
        '嗨！我是你的AI助手，有什么问题尽管问我吧！',
        '你好呀！今天想聊什么呢？',
      ],
      farewell: [
        '再见！期待下次与你聊天！',
        '拜拜！有需要随时找我哦！',
        '再见！祝你今天愉快！',
      ],
      help_request: [
        '我可以帮助你回答问题、聊天交流、提供信息等。你想了解什么具体功能呢？',
        '我是你的AI助手，可以协助你处理各种问题。有什么特别想了解的吗？',
        '我可以和你聊天、回答问题、提供建议等。有什么需要帮助的吗？',
      ],
      thanks: [
        '不客气！很高兴能帮到你！',
        '不用谢！这是我应该做的！',
        '客气了！有什么其他需要帮助的吗？',
      ],
      question: [
        '这是一个很好的问题！让我来帮你解答。',
        '我理解你的问题，让我为你详细说明。',
        '这个问题很有意思，我来为你分析一下。',
      ],
      general: [
        '我明白了，让我来回应你的话。',
        '好的，我理解你的意思。',
        '我听到了，让我来回复你。',
      ],
    };

    const stateResponses =
      responses[stateResult.newState] || responses['general'];
    const randomResponse =
      stateResponses[Math.floor(Math.random() * stateResponses.length)];

    // 根据上下文个性化响应
    return this.personalizeResponse(
      randomResponse,
      dialogue.context,
      intentResult.entities
    );
  }

  /**
   * 个性化响应
   */
  private personalizeResponse(
    response: string,
    context: Record<string, any>,
    entities: Record<string, any>
  ): string {
    let personalizedResponse = response;

    // 如果有用户名，使用用户名
    if (context.userName) {
      personalizedResponse = personalizedResponse.replace(
        '你',
        context.userName
      );
    }

    // 如果有时间信息，加入时间相关的个性化
    if (entities.time) {
      const time = entities.time[0];
      if (time.includes('今天')) {
        personalizedResponse = `今天${personalizedResponse}`;
      } else if (time.includes('明天')) {
        personalizedResponse = `明天${personalizedResponse}`;
      }
    }

    return personalizedResponse;
  }

  /**
   * 更新对话状态
   */
  private async updateDialogueState(
    dialogue: DialogueState,
    intentResult: IntentResult,
    stateResult: any,
    response: string
  ): Promise<void> {
    dialogue.currentState = stateResult.newState;
    dialogue.metadata.lastUpdate = new Date();

    // 更新上下文
    dialogue.context = {
      ...dialogue.context,
      lastIntent: intentResult.intent,
      lastEntities: intentResult.entities,
      lastResponse: response,
    };

    // 更新会话上下文
    await this.sessionManager.updateContext(dialogue.sessionId, {
      dialogueId: dialogue.id,
      currentState: dialogue.currentState,
      context: dialogue.context,
    });

    this.emit('dialogueStateUpdated', dialogue);
  }

  /**
   * 记录对话轮次
   */
  private async recordDialogueTurn(
    dialogue: DialogueState,
    userInput: string,
    intentResult: IntentResult,
    response: string,
    stateResult: any
  ): Promise<void> {
    const turn: DialogueTurn = {
      id: uuidv4(),
      userInput,
      intent: intentResult.intent,
      entities: intentResult.entities,
      systemResponse: response,
      stateBefore: dialogue.currentState,
      stateAfter: stateResult.newState,
      timestamp: new Date(),
      metadata: {
        confidence: intentResult.confidence,
        actions: stateResult.actions,
      },
    };

    dialogue.history.push(turn);

    // 限制历史记录长度
    if (dialogue.history.length > this.config.maxContextTurns) {
      dialogue.history = dialogue.history.slice(-this.config.maxContextTurns);
    }

    this.emit('dialogueTurnRecorded', { dialogue, turn });
  }

  /**
   * 处理对话中断
   */
  async handleInterruption(sessionId: string, reason: string): Promise<void> {
    const dialogue = this.getDialogueBySessionId(sessionId);
    if (!dialogue) return;

    // 保存当前状态
    dialogue.context.interruptionReason = reason;
    dialogue.context.interruptedAt = new Date();

    // 更新会话状态
    await this.sessionManager.updateContext(sessionId, {
      dialogueId: dialogue.id,
      interrupted: true,
      interruptionReason: reason,
    });

    this.emit('dialogueInterrupted', { dialogue, reason });
  }

  /**
   * 恢复对话
   */
  async resumeDialogue(sessionId: string): Promise<string> {
    const dialogue = this.getDialogueBySessionId(sessionId);
    if (!dialogue) {
      throw new Error('Dialogue not found');
    }

    // 清除中断状态
    delete dialogue.context.interruptionReason;
    delete dialogue.context.interruptedAt;

    // 更新会话状态
    await this.sessionManager.updateContext(sessionId, {
      dialogueId: dialogue.id,
      interrupted: false,
    });

    // 生成恢复响应
    const resumeResponses = [
      '我们继续之前的对话吧！',
      '好的，让我们继续！',
      '没问题，我们接着聊！',
    ];

    const response =
      resumeResponses[Math.floor(Math.random() * resumeResponses.length)];

    this.emit('dialogueResumed', dialogue);
    return response;
  }

  /**
   * 初始化默认状态机
   */
  private initializeDefaultStateMachine(): void {
    const stateMachine = new StateMachine('default');

    // 定义状态
    const greetingState = new State('greeting', '问候状态');
    greetingState.transitions = [
      {
        intent: 'help_request',
        targetState: 'help',
        confidence: 0.7,
        actions: ['provide_help'],
      },
      {
        intent: 'question',
        targetState: 'answering',
        confidence: 0.6,
        actions: ['answer_question'],
      },
      {
        intent: 'farewell',
        targetState: 'farewell',
        confidence: 0.8,
        actions: ['say_goodbye'],
      },
    ];
    stateMachine.addState('greeting', greetingState);

    const helpState = new State('help', '帮助状态');
    helpState.transitions = [
      {
        intent: 'question',
        targetState: 'answering',
        confidence: 0.6,
        actions: ['answer_question'],
      },
      {
        intent: 'thanks',
        targetState: 'greeting',
        confidence: 0.7,
        actions: ['acknowledge_thanks'],
      },
    ];
    stateMachine.addState('help', helpState);

    const answeringState = new State('answering', '回答状态');
    answeringState.transitions = [
      {
        intent: 'question',
        targetState: 'answering',
        confidence: 0.6,
        actions: ['answer_question'],
      },
      {
        intent: 'thanks',
        targetState: 'greeting',
        confidence: 0.7,
        actions: ['acknowledge_thanks'],
      },
    ];
    stateMachine.addState('answering', answeringState);

    const farewellState = new State('farewell', '告别状态');
    farewellState.transitions = [
      {
        intent: 'greeting',
        targetState: 'greeting',
        confidence: 0.8,
        actions: ['greet_again'],
      },
    ];
    stateMachine.addState('farewell', farewellState);

    this.stateMachines.set('default', stateMachine);
  }

  /**
   * 获取对话统计信息
   */
  getDialogueStats(): {
    totalDialogues: number;
    activeDialogues: number;
    averageTurnsPerDialogue: number;
    mostCommonIntents: Array<{ intent: string; count: number }>;
  } {
    const stats = {
      totalDialogues: this.dialogues.size,
      activeDialogues: 0,
      averageTurnsPerDialogue: 0,
      mostCommonIntents: [] as Array<{ intent: string; count: number }>,
    };

    const intentCounts: Record<string, number> = {};
    let totalTurns = 0;

    for (const dialogue of this.dialogues.values()) {
      if (dialogue.currentState !== 'farewell') {
        stats.activeDialogues++;
      }

      totalTurns += dialogue.history.length;

      for (const turn of dialogue.history) {
        intentCounts[turn.intent] = (intentCounts[turn.intent] || 0) + 1;
      }
    }

    stats.averageTurnsPerDialogue =
      stats.totalDialogues > 0 ? totalTurns / stats.totalDialogues : 0;
    stats.mostCommonIntents = Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }
}

/**
 * 状态机类
 */
class StateMachine {
  private states: Map<string, State> = new Map();

  constructor(_name: string) {
    // name parameter is kept for future use
  }

  addState(name: string, state: State): void {
    this.states.set(name, state);
  }

  getState(name: string): State | undefined {
    return this.states.get(name);
  }
}

/**
 * 状态类
 */
class State {
  name: string;
  description: string;
  transitions: StateTransitionRule[];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.transitions = [];
  }

  findTransition(
    intent: string,
    confidence: number
  ): StateTransitionRule | undefined {
    return this.transitions.find(
      transition =>
        transition.intent === intent && confidence >= transition.confidence
    );
  }
}

/**
 * 状态转换接口
 */
export interface StateTransitionRule {
  intent: string;
  targetState: string;
  confidence: number;
  actions?: string[];
  shouldContinue?: boolean;
}

// 导出单例实例
let dialogueManagerInstance: DialogueManager | null = null;

export function getDialogueManager(
  sessionManager?: SessionManager,
  config?: Partial<DialogueConfig>
): DialogueManager {
  if (!dialogueManagerInstance && sessionManager) {
    dialogueManagerInstance = new DialogueManager(sessionManager, config);
  }
  return dialogueManagerInstance!;
}
