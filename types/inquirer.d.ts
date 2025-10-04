declare module 'inquirer' {
  type ChoiceValue = string | number | boolean | Record<string, unknown>;

  interface ChoiceOption {
    name: string;
    value: ChoiceValue;
  }

  interface Question<TAnswers = Record<string, unknown>> {
    type?: string;
    name: keyof TAnswers extends string ? keyof TAnswers : string;
    message?: string;
    default?: ChoiceValue | (() => ChoiceValue);
    validate?: (input: ChoiceValue) => boolean | string;
    choices?: Array<ChoiceOption | string>;
  }

  type QuestionCollection<TAnswers = Record<string, unknown>> =
    | Question<TAnswers>
    | Question<TAnswers>[];

  interface PromptModule {
    <TAnswers = Record<string, unknown>>(
      questions: QuestionCollection<TAnswers>,
      answers?: Partial<TAnswers>
    ): Promise<TAnswers>;
  }

  const inquirer: {
    prompt: PromptModule;
  };

  export default inquirer;
}
