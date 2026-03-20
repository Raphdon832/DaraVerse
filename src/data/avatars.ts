export type AvatarOption = {
  id: string;
  label: string;
  thumbnail: number;
  full: number;
};

export const avatarOptions: AvatarOption[] = [
  {
    id: "african-female",
    label: "African Female",
    thumbnail: require("../../assets/AvatarThumbnails/African Female 2.png"),
    full: require("../../assets/Avatars/African Female 1.png"),
  },
  {
    id: "african-male",
    label: "African Male",
    thumbnail: require("../../assets/AvatarThumbnails/African Male 2.png"),
    full: require("../../assets/Avatars/African Male 1.png"),
  },
  {
    id: "antarctica-female",
    label: "Antarctica Female",
    thumbnail: require("../../assets/AvatarThumbnails/Antarctica female 2.png"),
    full: require("../../assets/Avatars/Antarctica female 1.png"),
  },
  {
    id: "antarctica-male",
    label: "Antarctica Male",
    thumbnail: require("../../assets/AvatarThumbnails/Antarctica male 2.png"),
    full: require("../../assets/Avatars/Antarctica male 1.png"),
  },
  {
    id: "asian-female",
    label: "Asian Female",
    thumbnail: require("../../assets/AvatarThumbnails/Asian Female 2.png"),
    full: require("../../assets/Avatars/Asian Female 1.png"),
  },
  {
    id: "asian-male",
    label: "Asian Male",
    thumbnail: require("../../assets/AvatarThumbnails/Asian Male 2.png"),
    full: require("../../assets/Avatars/Asian Male 1.png"),
  },
  {
    id: "asian-male-variant",
    label: "Asian Male Variant",
    thumbnail: require("../../assets/AvatarThumbnails/Asian Male 3.png"),
    full: require("../../assets/Avatars/Asian Male 1.png"),
  },
  {
    id: "australian-female",
    label: "Australian Female",
    thumbnail: require("../../assets/AvatarThumbnails/Australian female 2.png"),
    full: require("../../assets/Avatars/Australian female 1.png"),
  },
  {
    id: "australian-male",
    label: "Australian Male",
    thumbnail: require("../../assets/AvatarThumbnails/Australian Male 2.png"),
    full: require("../../assets/Avatars/Australian Male 1.png"),
  },
  {
    id: "black-female",
    label: "Black Female",
    thumbnail: require("../../assets/AvatarThumbnails/Black female 2.png"),
    full: require("../../assets/Avatars/Black female 1.png"),
  },
  {
    id: "black-male",
    label: "Black Male",
    thumbnail: require("../../assets/AvatarThumbnails/Black male 2.png"),
    full: require("../../assets/Avatars/Black male 1.png"),
  },
  {
    id: "european-female",
    label: "European Female",
    thumbnail: require("../../assets/AvatarThumbnails/European female 2.png"),
    full: require("../../assets/Avatars/European female 1.png"),
  },
  {
    id: "european-male",
    label: "European Male",
    thumbnail: require("../../assets/AvatarThumbnails/European male 2.png"),
    full: require("../../assets/Avatars/European male 1.png"),
  },
  {
    id: "indian-female",
    label: "Indian Female",
    thumbnail: require("../../assets/AvatarThumbnails/Indian female 2.png"),
    full: require("../../assets/Avatars/Indian female 1.png"),
  },
  {
    id: "indian-male",
    label: "Indian Male",
    thumbnail: require("../../assets/AvatarThumbnails/Indian male 2.png"),
    full: require("../../assets/Avatars/Indian male 1.png"),
  },
  {
    id: "namerican-female",
    label: "North American Female",
    thumbnail: require("../../assets/AvatarThumbnails/NAmerican Female 2.png"),
    full: require("../../assets/Avatars/NAmerican Female 1.png"),
  },
  {
    id: "namerican-male",
    label: "North American Male",
    thumbnail: require("../../assets/AvatarThumbnails/NAmerican Male 2.png"),
    full: require("../../assets/Avatars/NAmerican Male 1.png"),
  },
  {
    id: "samerican-female",
    label: "South American Female",
    thumbnail: require("../../assets/AvatarThumbnails/SAmerican Female 2.png"),
    full: require("../../assets/Avatars/SAmerican Female 1.png"),
  },
  {
    id: "samerican-male",
    label: "South American Male",
    thumbnail: require("../../assets/AvatarThumbnails/SAmerican Male 2.png"),
    full: require("../../assets/Avatars/SAmerican Male 1.png"),
  },
];

export function getAvatarById(avatarId: string | null | undefined) {
  if (!avatarId) {
    return undefined;
  }
  return avatarOptions.find((avatar) => avatar.id === avatarId);
}
