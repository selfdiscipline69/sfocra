export interface UserChoices {
  question1: string | null;
  question2: string | null;
  question3: string | null;
  question4: string | null;
}

export interface AdditionalTask {
  text: string;
  image: string | null;
  completed: boolean;
  showImage: boolean;
}
