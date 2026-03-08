export type RootStackParamList = {
  Onboarding: undefined;
  SelectionMode: undefined;
  ChildHome: undefined;
  ParentHome: undefined;
  ChildCategory: { categoryName: string };
  ParentCategory: { categoryName: string };
  AIAssessment: undefined; 
  AILoading: { answers: Record<string, number> }; 
  AIResult: { result: any };
};

export type UserMode = 'child' | 'parent';

export type Category = {
  id: string;
  name: string;
  icon: any;
  color: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  icon: any;
  audio: any;
  video?: any;
};
