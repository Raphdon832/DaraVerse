const fs = require('fs');

let code = fs.readFileSync('src/screens/HomeHubScreen.tsx', 'utf8');

// 1. Update avatar hero height from 360 to 240
code = code.replace(/height: 360,/g, 'height: 240,');

// 2. Add hero progress visually inside Avatar.
const avatar_code_search = `          <MotiImage
            source={selectedAvatar.full}
            style={styles.fullAvatar}
            resizeMode="contain"
            from={{ translateY: 5 }}
            animate={{ translateY: -15 }}
            transition={{ type: "timing", duration: 2500, loop: true }}
          />
        </View>`;

const avatar_code_replace = `          <MotiImage
            source={selectedAvatar.full}
            style={styles.fullAvatar}
            resizeMode="contain"
            from={{ translateY: 5 }}
            animate={{ translateY: -15 }}
            transition={{ type: "timing", duration: 2500, loop: true }}
          />
          <View style={styles.avatarGradientOverlay} />
          
          <View style={styles.heroProgressOverlay}>
            <Text style={styles.heroProgressLabel}>Weekly Goal</Text>
            <View style={styles.heroProgressBar}>
               <View style={[styles.heroProgressFill, { width: \`\${weeklyGoalPercent}%\`, backgroundColor: state.theme.primaryColor }]} />
            </View>
          </View>
        </View>`;

code = code.replace(avatar_code_search, avatar_code_replace);

// Update Quick Actions to Horizontally Scrollable Pills (Shape radius: 999)
const quick_actions_search = `          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <MotiPressable
                key={action.id}
                onPress={action.onPress}
                animate={pressScale95}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
              >
                <View style={styles.quickActionIconWrap}>
                  <Ionicons
                    name={(state.theme.iconType === "filled"
                      ? action.icon.replace("-outline", "")
                      : action.icon) as any}
                    size={20}
                    color={colors.textPrimary}
                  />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </MotiPressable>
            ))}
          </View>`;

const quick_actions_replace = `          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
            style={styles.fullWidthScroll}
          >
            {quickActions.map((action) => (
              <MotiPressable
                key={action.id}
                onPress={action.onPress}
                animate={pressScale95}
                style={[styles.quickActionPill, { backgroundColor: action.color }]}
              >
                <Ionicons
                  name={(state.theme.iconType === "filled"
                    ? action.icon.replace("-outline", "")
                    : action.icon) as any}
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.quickActionLabelPill}>{action.label}</Text>
              </MotiPressable>
            ))}
          </ScrollView>`;
code = code.replace(quick_actions_search, quick_actions_replace);


// Modify Today's Plan limit
code = code.replace(
    'const visiblePlanTasks = todaysPlan.slice(0, 3);',
    'const visiblePlanTasks = todaysPlan.slice(0, 2);'
);

// Progress Snapshot Removal
const snapshot_regex = /          <View style=\{styles\.sectionHeader\}>\n            <Text style=\{\[styles\.sectionTitle, \{ color: adaptiveTextColor \}\]\}>Progress Snapshot<\/Text>[\s\S]*?          <\/ScrollView>/;
code = code.replace(snapshot_regex, "");

// Modify Weekly Goal to be Momentum Block
const weekly_goal_regex = /          <View style=\{styles\.sectionHeader\}>\n            <Text style=\{\[styles\.sectionTitle, \{ color: adaptiveTextColor \}\]\}>Weekly Goal<\/Text>[\s\S]*?          <\/View>\n          <\/View>/;

const momentum_replace = `          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Momentum</Text>
            <Text style={styles.planMeta}>{weeklyGoalProgress}/{weeklyGoalTarget} done</Text>
          </View>
          <View style={[styles.weeklyGoalCard, { backgroundColor: adaptiveCardBg }]}>
            <Text style={[styles.weeklyGoalTitle, { color: adaptiveTextColor }]}>
              {weeklyGoalRemaining === 0
                ? "Target complete. Great progress!"
                : \`\${weeklyGoalRemaining} activities to reach your weekly milestone.\`}
            </Text>

            <View style={styles.weeklyBarTrack}>
              <View
                style={[
                  styles.weeklyBarFill,
                  {
                    width: \`\${weeklyGoalPercent}%\`,
                    backgroundColor: state.theme.primaryColor,
                  },
                ]}
              />
            </View>

            <View style={styles.weeklyStatsRow}>
               {progressTiles.slice(0, 3).map((tile) => (
                 <View key={tile.id} style={styles.weeklyStatChip}>
                   <Text style={styles.weeklyStatValue}>{tile.value.split(" ")[0]}</Text>
                   <Text style={styles.weeklyStatLabel}>{tile.label}</Text>
                 </View>
               ))}
            </View>
          </View>`;
code = code.replace(weekly_goal_regex, momentum_replace);


// Reorder Today's Plan to be before Quick Actions
const today_plan_regex = /(          <View style=\{styles\.sectionHeader\}>\n            <Text style=\{\[styles\.sectionTitle, \{ color: adaptiveTextColor \}\]\}>Today's Plan<\/Text>[\s\S]*?          <\/View>\n          <View style=\{styles\.planList\}>[\s\S]*?          <\/View>)/;
const match_plan = code.match(today_plan_regex);
if (match_plan) {
    const today_plan_code = match_plan[1];
    code = code.replace(today_plan_code, "");

    // Insert before Quick Actions
    const qa_header = "          <View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Quick Actions</Text>";
    code = code.replace(qa_header, today_plan_code + "\\n\\n" + qa_header);
}

// Edit Theme search
const edit_theme_search = `  editThemeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 36,
    height: 36,
    borderRadius: 18,`;
const edit_theme_replace = `  editThemeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.15)",
    width: 32,
    height: 32,
    borderRadius: 16,`;
code = code.replace(edit_theme_search, edit_theme_replace);


const new_styles = `
  avatarGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.xxl,
  },
  heroProgressOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroProgressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: radius.pill,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  quickActionsScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  quickActionPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  quickActionLabelPill: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
`;

code = code.replace("  quickActionsGrid: {", new_styles + "  quickActionsGrid: {");

fs.writeFileSync('src/screens/HomeHubScreen.tsx', code, 'utf8');
console.log("SUCCESS");
