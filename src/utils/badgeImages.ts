export const bgImages = {
    daily: require("../../assets/badges/bg_daily.png"),
    weekly: require("../../assets/badges/bg_weekly.png"),
    cyber: require("../../assets/badges/bg_cyber.png"),
    robotics: require("../../assets/badges/bg_robotics.png"),
    coding: require("../../assets/badges/bg_coding.png"),
    chess: require("../../assets/badges/bg_chess.png"),
    sudoku: require("../../assets/badges/bg_sudoku.png"),
    ai: require("../../assets/badges/bg_ai.png"),
    data: require("../../assets/badges/bg_data.png"),
    stem: require("../../assets/badges/bg_stem.png"),
};

export const getBadgeBg = (id: string) => {
    if (id.includes("daily-goal")) return bgImages.daily;
    if (id.includes("weekly-goal")) return bgImages.weekly;
    if (id.includes("cyber")) return bgImages.cyber;
    if (id.includes("relay") || id.includes("robotics")) return bgImages.robotics;
    if (id.includes("chess")) return bgImages.chess;
    if (id.includes("sudoku")) return bgImages.sudoku;
    if (id.includes("code") || id.includes("loop") || id.includes("binary") || id.includes("coding")) return bgImages.coding;
    if (id.includes("ai")) return bgImages.ai;
    if (id.includes("data")) return bgImages.data;
    return bgImages.stem;
};
