const fs = require('fs');

const generateBadges = () => {
    const badges = [];

    const dailyGoals = [
        ["daily-goal-1", "Coding Primer", "Complete 1 Coding trivia session."],
        ["daily-goal-2", "AI Explorer", "Complete 1 AI Literacy trivia session."],
        ["daily-goal-3", "Cyber Prep", "Complete 1 Cybersecurity trivia session."],
        ["daily-goal-4", "Data Dive", "Complete 1 Data Skills trivia session."],
        ["daily-goal-5", "Robotics Run", "Complete 1 Robotics/Climate trivia session."],
        ["daily-goal-6", "Mission Starter", "Start a new mission today."],
        ["daily-goal-7", "Perfect Step", "Complete a mission step perfectly on the first try."],
        ["daily-goal-8", "Theme Weaver", "Change your app theme or colors."],
        ["daily-goal-9", "Mentor Match", "Review your mentor matches."],
        ["daily-goal-10", "Certificate Check", "Check out a certificate requirement."],
        ["daily-goal-11", "Badge Hunter", "View a locked badge in the gallery."],
        ["daily-goal-12", "Double Play", "Play 2 trivia sessions in one day."],
        ["daily-goal-13", "Mission Complete", "Complete 1 mission from start to finish today."],
        ["daily-goal-14", "Knowledge Seeker", "Search for a specific STEM topic."],
        ["daily-goal-15", "Cyber Review", "Revisit the CyberQuest mission."],
        ["daily-goal-16", "Avatar Update", "Update your avatar background."],
        ["daily-goal-17", "Robotics Explorer", "Explore the Robotics track."],
        ["daily-goal-18", "Progress Check", "Check your weekly progress."],
        ["daily-goal-19", "Mentor Bio", "Read a mentor's full bio."],
        ["daily-goal-20", "Trivia Master", "Score 80% or higher today in any trivia."]
    ];

    const weeklyGoals = [
        ["weekly-goal-1", "Trivia Buff", "Play 5 trivia sessions this week."],
        ["weekly-goal-2", "Mission Specialist", "Complete 3 missions this week."],
        ["weekly-goal-3", "Perfect Score", "Score 100% on 3 trivia sessions this week."],
        ["weekly-goal-4", "STEM Generalist", "Try all 5 STEM categories in one week."],
        ["weekly-goal-5", "Dedicated Learner", "Spend at least 60 minutes learning this week."],
        ["weekly-goal-6", "Reward Earner", "Unlock 2 new badges this week."],
        ["weekly-goal-7", "Project Builder", "Submit a project this week."],
        ["weekly-goal-8", "Networker", "Schedule or complete a mentor call."],
        ["weekly-goal-9", "Consistent Learner", "Log in 5 different days this week."],
        ["weekly-goal-10", "Track Finisher", "Complete a full STEM track."],
        ["weekly-goal-11", "Streak Keeper", "Reach a 3-week streak."],
        ["weekly-goal-12", "Vocab Builder", "View 10 different glossary terms."],
        ["weekly-goal-13", "Data Ace", "Earn a perfect score on a Data Skills mission."],
        ["weekly-goal-14", "Cyber Ace", "Earn a perfect score on a Cybersecurity mission."],
        ["weekly-goal-15", "Reaching Out", "Send a mentorship request."],
        ["weekly-goal-16", "Refresher", "Re-play 3 old missions to refresh memory."],
        ["weekly-goal-17", "High Achiever", "Achieve an average score of 90% in weekly trivia."],
        ["weekly-goal-18", "Deep Dive", "Spend 120 minutes learning this week."],
        ["weekly-goal-19", "Weekend Warrior", "Log in on both Saturday and Sunday."],
        ["weekly-goal-20", "Certified", "Unlock your first Certificate."]
    ];

    dailyGoals.forEach((goal) => {
        badges.push({
            id: goal[0],
            name: goal[1],
            description: goal[2],
            unlockCriteria: goal[2]
        });
    });

    weeklyGoals.forEach((goal) => {
        badges.push({
            id: goal[0],
            name: goal[1],
            description: goal[2],
            unlockCriteria: goal[2]
        });
    });

    return badges;
};

let code = fs.readFileSync('src/data/catalog.ts', 'utf8');
const newBadges = generateBadges();
let formattedBadges = '';

newBadges.forEach(b => {
    formattedBadges += '  {\n';
    formattedBadges += '    id: "' + b.id + '",\n';
    formattedBadges += '    name: "' + b.name + '",\n';
    formattedBadges += '    description: "' + b.description + '",\n';
    formattedBadges += '    unlockCriteria: "' + b.unlockCriteria + '",\n';
    formattedBadges += '  },\n';
});

// Use a regex that ignores whitespace and line ending differences
const regex = /];\s*export const certificateCatalog/;

// Actually, I need to remove the previously injected badges so there are no duplicates!
// Let's strip out anything from the array that has ID starting with daily-goal- or weekly-goal- 
// before injecting again. 
// Since I want a clean file, I'll do this via the existing catalog, removing the old ones.

// We will just read the file, parse the array? No, easier to just regex out the old daily/weekly badges.
// However they are hardcoded. We can just cut the file up to the end of the stem-spectrum badge.

let cutPoint = code.indexOf('id: "stem-spectrum"');
let afterCut = code.indexOf('},', cutPoint) + 2;

let earlyCode = code.substring(0, afterCut);
let finalCode = earlyCode + '\n' + formattedBadges + '];\n\nexport const certificateCatalog: Certificate[] = [\n' +
    '  {\n' +
    '    id: "stem-leadership-p1",\n' +
    '    name: "STEM Leadership Pathway Certificate",\n' +
    '    description: "Complete mission and project milestones for pathway validation.",\n' +
    '    minCompletedMissions: 2,\n' +
    '    minSubmittedProjects: 1,\n' +
    '  },\n' +
    '];\n\n' +
    'export function getMissionById(missionId: string) {\n' +
    '  return missionCatalog.find((mission) => mission.id === missionId);\n' +
    '}\n\n' +
    'export function getBadgeById(badgeId: string) {\n' +
    '  return badgeCatalog.find((badge) => badge.id === badgeId);\n' +
    '}\n';

fs.writeFileSync('src/data/catalog.ts', finalCode, 'utf8');
console.log('Regenerated specific task badges successfully.');
