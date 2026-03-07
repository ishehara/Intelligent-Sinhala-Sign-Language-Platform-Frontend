import { Category, CategoryItem } from "../types";

// Note: Replace with actual image/audio/video paths from your assets folder
export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "කෑම",
    icon: require("../../assets/images/food.jpg"), // You'll need to add these images
    color: "#FFB6C1",
  },
  {
    id: "2",
    name: "බීම",
    icon: require("../../assets/images/drink.png"),
    color: "#87CEEB",
  },
  {
    id: "3",
    name: "ලෙඩ",
    icon: require("../../assets/images/sick.jpg"),
    color: "#FFD700",
  },
  {
    id: "4",
    name: "වැසිකිලිය",
    icon: require("../../assets/images/toilet.jpg"),
    color: "#DDA0DD",
  },
  {
    id: "5",
    name: "ක්‍රියා පද",
    icon: require("../../assets/images/actions.jpg"),
    color: "#90EE90",
  },
];

// Category Items Data
export const FOOD_ITEMS: CategoryItem[] = [
  {
    id: "food1",
    name: "මට බත් කන්න ඕනේ",
    icon: require("../../assets/images/rice.jpg"),
    audio: require("../../assets/audio/mata bath kanna one.mp3"),
    video: require("../../assets/videos/rice-sign.mp4"),
  },
  {
    id: "food2",
    name: "මට නූඩ්ල්ස් කන්න ඕනේ",
    icon: require("../../assets/images/noodles.jpg"),
    audio: require("../../assets/audio/mata noodles kanna one.mp3"),
    video: require("../../assets/videos/noodles-sign.mp4"),
  },
  {
    id: "food3",
    name: "මට පාන් කන්න ඕනේ",
    icon: require("../../assets/images/bread.jpg"),
    audio: require("../../assets/audio/mata paan kanna oone.mp3"),
    video: require("../../assets/videos/bread-sign.mp4"),
  },
  {
    id: "food4",
    name: "මට ඉදිආප්ප කන්න ඕනේ",
    icon: require("../../assets/images/idiappa.jpg"),
    audio: require("../../assets/audio/mata idiappa kanna oone.mp3"),
    video: require("../../assets/videos/idiappa-sign.mp4"),
  },
];

export const DRINK_ITEMS: CategoryItem[] = [
  {
    id: "drink1",
    name: "මට වතුර බොන්න ඕනේ",
    icon: require("../../assets/images/drink.png"),
    audio: require("../../assets/audio/mata jo one.mp3"),
    video: require("../../assets/videos/water-sign.mp4"),
  },
  {
    id: "drink2",
    name: "මට කිරි බොන්න ඕනේ",
    icon: require("../../assets/images/milk.jpg"),
    audio: require("../../assets/audio/mata kiri bonna oone.mp3"),
    video: require("../../assets/videos/milk-sign.mp4"),
  },
  // {
  //   id: "drink3",
  //   name: "මට ජූස් ඕනේ",
  //   icon: require("../../assets/images/juice.jpg"),
  //   audio: require("../../assets/audio/mata juice one.mp3"),
  //   video: require("../../assets/videos/juice-sign.mp4"),
  // },
  {
    id: "drink4",
    name: "මට තේ බොන්න ඕනේ",
    icon: require("../../assets/images/tea.png"),
    audio: require("../../assets/audio/mata thee bonna one.mp3"),
    video: require("../../assets/videos/tea-sign.mp4"),
  },
];

export const SICK_ITEMS: CategoryItem[] = [
  {
    id: "sick1",
    name: "මගේ බඩ රිදෙනවා",
    icon: require("../../assets/images/stomach.jpg"),
    audio: require("../../assets/audio/mage bada ridenawa.mp3"),
    video: require("../../assets/videos/stomachache-sign.mp4"),
  },
  {
    id: "sick2",
    name: "මගේ ඔලුව රිදෙනවා",
    icon: require("../../assets/images/headache.png"),
    audio: require("../../assets/audio/mage oluwa ridenawa.mp3"),
    video: require("../../assets/videos/headache-sign.mp4"),
  },
  {
    id: "sick3",
    name: "මට කැස්ස",
    icon: require("../../assets/images/cough.jpg"),
    audio: require("../../assets/audio/mata kassa.mp3"),
    video: require("../../assets/videos/cough-sign.mp4"),
  },
  {
    id: "sick4",
    name: "දතක් රිදෙනවා",
    icon: require("../../assets/images/tooth.jpg"),
    audio: require("../../assets/audio/dath kakkumai.mp3"),
    video: require("../../assets/videos/tooth-sign.mp4"),
  },
  {
    id: "sick5",
    name: "හොටු ගලනවා",
    icon: require("../../assets/images/hotu.jpg"),
    audio: require("../../assets/audio/mata hotu galanawa.mp3"),
    video: require("../../assets/videos/hotu-sign.mp4"),
  },
];

export const TOILET_ITEMS: CategoryItem[] = [
  {
    id: "toilet1",
    name: "මුත්‍රා",
    icon: require("../../assets/images/pee.jpg"),
    audio: require("../../assets/audio/mata chuu barai.mp3"),
    video: require("../../assets/videos/pee-sign.mp4"),
  },
  {
    id: "toilet2",
    name: "මළ",
    icon: require("../../assets/images/poop.png"),
    audio: require("../../assets/audio/mata kakka barai.mp3"),
    video: require("../../assets/videos/poop-sign.mp4"),
  },
];

export const ACTION_ITEMS: CategoryItem[] = [
  // {
  //   id: "action1",
  //   name: "කන්න",
  //   icon: require("../../assets/images/noodles.jpg"),
  //   audio: require("../../assets/audio/mata kanna one.mp3"),
  //   video: require("../../assets/videos/eat-sign.mp4"),
  // },
  // {
  //   id: "action2",
  //   name: "බොන්න",
  //   icon: require("../../assets/images/noodles.jpg"),
  //   audio: require("../../assets/audio/mata bonna one.mp3"),
  //   video: require("../../assets/videos/drink-action-sign.mp4"),
  // },
  // {
  //   id: "action3",
  //   name: "නිදාගන්න",
  //   icon: require("../../assets/images/noodles.jpg"),
  //   audio: require("../../assets/audio/mata nida gananwa.mp3"),
  //   video: require("../../assets/videos/sleep-sign.mp4"),
  // },
  {
    id: "action4",
    name: "සෙල්ලම් කරන්න",
    icon: require("../../assets/images/play.jpg"),
    audio: require("../../assets/audio/mata sellam karanna oone.mp3"),
    video: require("../../assets/videos/play-sign.mp4"),
  },
  {
    id: "action5",
    name: "කතාකරනවා",
    icon: require("../../assets/images/talk.jpg"),
    audio: require("../../assets/audio/katha karanawa.mp3"),
    video: require("../../assets/videos/talk-sign.mp4"),
  },
];

export const getCategoryItems = (categoryName: string): CategoryItem[] => {
  switch (categoryName) {
    case "කෑම":
      return FOOD_ITEMS;
    case "බීම":
      return DRINK_ITEMS;
    case "ලෙඩ":
      return SICK_ITEMS;
    case "වැසිකිලිය":
      return TOILET_ITEMS;
    case "ක්‍රියා පද":
      return ACTION_ITEMS;
    default:
      return [];
  }
};
