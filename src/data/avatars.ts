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
    thumbnail: require("../../public/AvatarThumbnails/African Female 2.png"),
    full: require("../../public/Avatars/African Female 1.png"),
  },
  {
    id: "african-male",
    label: "African Male",
    thumbnail: require("../../public/AvatarThumbnails/African Male 2.png"),
    full: require("../../public/Avatars/African Male 1.png"),
  },
  {
    id: "antarctica-female",
    label: "Antarctica Female",
    thumbnail: require("../../public/AvatarThumbnails/Antarctica female 2.png"),
    full: require("../../public/Avatars/Antarctica female 1.png"),
  },
  {
    id: "antarctica-male",
    label: "Antarctica Male",
    thumbnail: require("../../public/AvatarThumbnails/Antarctica male 2.png"),
    full: require("../../public/Avatars/Antarctica male 1.png"),
  },
  {
    id: "asian-female",
    label: "Asian Female",
    thumbnail: require("../../public/AvatarThumbnails/Asian Female 2.png"),
    full: require("../../public/Avatars/Asian Female 1.png"),
  },
  {
    id: "asian-male",
    label: "Asian Male",
    thumbnail: require("../../public/AvatarThumbnails/Asian Male 2.png"),
    full: require("../../public/Avatars/Asian Male 1.png"),
  },
  {
    id: "asian-male-variant",
    label: "Asian Male Variant",
    thumbnail: require("../../public/AvatarThumbnails/Asian Male 3.png"),
    full: require("../../public/Avatars/Asian Male 1.png"),
  },
  {
    id: "australian-female",
    label: "Australian Female",
    thumbnail: require("../../public/AvatarThumbnails/Australian female 2.png"),
    full: require("../../public/Avatars/Australian female 1.png"),
  },
  {
    id: "australian-male",
    label: "Australian Male",
    thumbnail: require("../../public/AvatarThumbnails/Australian Male 2.png"),
    full: require("../../public/Avatars/Australian Male 1.png"),
  },
  {
    id: "black-female",
    label: "Black Female",
    thumbnail: require("../../public/AvatarThumbnails/Black female 2.png"),
    full: require("../../public/Avatars/Black female 1.png"),
  },
  {
    id: "black-male",
    label: "Black Male",
    thumbnail: require("../../public/AvatarThumbnails/Black male 2.png"),
    full: require("../../public/Avatars/Black male 1.png"),
  },
  {
    id: "european-female",
    label: "European Female",
    thumbnail: require("../../public/AvatarThumbnails/European female 2.png"),
    full: require("../../public/Avatars/European female 1.png"),
  },
  {
    id: "european-male",
    label: "European Male",
    thumbnail: require("../../public/AvatarThumbnails/European male 2.png"),
    full: require("../../public/Avatars/European male 1.png"),
  },
  {
    id: "indian-female",
    label: "Indian Female",
    thumbnail: require("../../public/AvatarThumbnails/Indian female 2.png"),
    full: require("../../public/Avatars/Indian female 1.png"),
  },
  {
    id: "indian-male",
    label: "Indian Male",
    thumbnail: require("../../public/AvatarThumbnails/Indian male 2.png"),
    full: require("../../public/Avatars/Indian male 1.png"),
  },
  {
    id: "namerican-female",
    label: "North American Female",
    thumbnail: require("../../public/AvatarThumbnails/NAmerican Female 2.png"),
    full: require("../../public/Avatars/NAmerican Female 1.png"),
  },
  {
    id: "namerican-male",
    label: "North American Male",
    thumbnail: require("../../public/AvatarThumbnails/NAmerican Male 2.png"),
    full: require("../../public/Avatars/NAmerican Male 1.png"),
  },
  {
    id: "samerican-female",
    label: "South American Female",
    thumbnail: require("../../public/AvatarThumbnails/SAmerican Female 2.png"),
    full: require("../../public/Avatars/SAmerican Female 1.png"),
  },
  {
    id: "samerican-male",
    label: "South American Male",
    thumbnail: require("../../public/AvatarThumbnails/SAmerican Male 2.png"),
    full: require("../../public/Avatars/SAmerican Male 1.png"),
  },
];

export function getAvatarById(avatarId: string | null | undefined) {
  if (!avatarId) {
    return undefined;
  }
  return avatarOptions.find((avatar) => avatar.id === avatarId);
}
