import re

with open("src/screens/HomeHubScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update avatar hero height from 360 to 240
code = re.sub(r'height: 360,', r'height: 240,', code)

# 2. Add hero progress visually inside Avatar.
# Finding: 
#           <MotiImage
#             source={selectedAvatar.full}
#             style={styles.fullAvatar}
#             resizeMode="contain"
#             from={{ translateY: 5 }}
#             animate={{ translateY: -15 }}
#             transition={{ type: "timing", duration: 2500, loop: true }}
#           />
#         </View>
avatar_code_search = """          <MotiImage
            source={selectedAvatar.full}
            style={styles.fullAvatar}
            resizeMode="contain"
            from={{ translateY: 5 }}
            animate={{ translateY: -15 }}
            transition={{ type: "timing", duration: 2500, loop: true }}
          />"""

avatar_code_replace = """          <MotiImage
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
               <View style={[styles.heroProgressFill, { width: `${weeklyGoalPercent}%`, backgroundColor: state.theme.primaryColor }]} />
            </View>
          </View>"""
code = code.replace(avatar_code_search, avatar_code_replace)


# Update Quick Actions to Horizontally Scrollable Pills (Shape radius: 999)
quick_actions_search = """          <View style={styles.quickActionsGrid}>
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
          </View>"""

quick_actions_replace = """          <ScrollView
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
          </ScrollView>"""
code = code.replace(quick_actions_search, quick_actions_replace)


# Merge Weekly Goal & Progress Snapshot into Momentum Module
weekly_goal_search = r"""          <View style={styles.sectionHeader}>
            <Text style=\[styles.sectionTitle, { color: adaptiveTextColor }\]>Weekly Goal</Text>
            <Text style={styles.planMeta}>{weeklyGoalProgress}/{weeklyGoalTarget} done</Text>
          </View>
          <View style=\[styles.weeklyGoalCard, { backgroundColor: adaptiveCardBg }\]>
            <Text style=\[styles.weeklyGoalTitle, { color: adaptiveTextColor }\]>
              {weeklyGoalRemaining === 0
                \? "Weekly target complete\. Keep building momentum\."
                : `\$\{weeklyGoalRemaining\} activity\$\{weeklyGoalRemaining > 1 \? "ies" : "y"\} left this week`}
            </Text>
            <Text style={styles.weeklyGoalSubtitle}>
              Counted activities: mission completions, project submissions, and mentorship requests\.
            </Text>

            <View style={styles.weeklyBarTrack}>
              <View
                style=\[
                  styles.weeklyBarFill,
                  {
                    width: `\$\{weeklyGoalPercent\}%`,
                    backgroundColor: state.theme.primaryColor,
                  },
                \]
              />
            </View>

            <View style={styles.weeklyStatsRow}>
              <View style={styles.weeklyStatChip}>
                <Text style={styles.weeklyStatLabel}>Missions</Text>
                <Text style={styles.weeklyStatValue}>{missionsThisWeek}</Text>
              </View>
              <View style={styles.weeklyStatChip}>
                <Text style={styles.weeklyStatLabel}>Projects</Text>
                <Text style={styles.weeklyStatValue}>{projectsThisWeek}</Text>
              </View>
              <View style={styles.weeklyStatChip}>
                <Text style={styles.weeklyStatLabel}>Mentorship</Text>
                <Text style={styles.weeklyStatValue}>{requestsThisWeek}</Text>
              </View>
            </View>
          </View>"""


snapshot_search = r"""          <View style={styles.sectionHeader}>
            <Text style=\[styles.sectionTitle, { color: adaptiveTextColor }\]>Progress Snapshot</Text>
            <Pressable onPress=\{\(\) => openTab\("Achievements"\)\}>
              <Text style=\[styles.seeAllText, { color: state.theme.primaryColor }\]>View details</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator=\{false\}
            contentContainerStyle=\{styles.snapshotScroll\}
            style=\{styles.fullWidthScroll\}
          >
            \{progressTiles.map\(\(tile\) => \(
              <View key=\{tile.id\} style=\[styles.snapshotCard, \{ backgroundColor: tile.color \}\]\>
                <View style=\{styles.snapshotIconWrap\}\>
                  <Ionicons
                    name=\{\(state.theme.iconType === "filled"
                      \? tile.icon.replace\("-outline", ""\)
                      : tile.icon\) as any\}
                    size=\{20\}
                    color=\{colors.textPrimary\}
                  />
                </View>
                <Text style=\{styles.snapshotValue\}\>\{tile.value\}</Text>
                <Text style=\{styles.snapshotLabel\}\>\{tile.label\}</Text>
                <Text style=\{styles.snapshotHelper\} numberOfLines=\{2\}\>\{tile.helper\}</Text>
              </View>
            \)\)\}
          </ScrollView>"""

code = re.sub(snapshot_search, "", code)
# Replace weekly goal with Momentum Module
momentum_replace = """          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Momentum</Text>
            <Text style={styles.planMeta}>{weeklyGoalProgress}/{weeklyGoalTarget} done</Text>
          </View>
          <View style={[styles.weeklyGoalCard, { backgroundColor: adaptiveCardBg }]}>
            <Text style={[styles.weeklyGoalTitle, { color: adaptiveTextColor }]}>
              {weeklyGoalRemaining === 0
                ? "Target complete. Great progress!"
                : `${weeklyGoalRemaining} activities to reach your weekly milestone.`}
            </Text>

            <View style={styles.weeklyBarTrack}>
              <View
                style={[
                  styles.weeklyBarFill,
                  {
                    width: `${weeklyGoalPercent}%`,
                    backgroundColor: state.theme.primaryColor,
                  },
                ]}
              />
            </View>

            <View style={styles.weeklyStatsRow}>
               {progressTiles.slice(0, 3).map((tile) => (
                 <View key={tile.id} style={styles.weeklyStatChip}>
                   <Ionicons name={tile.icon as any} size={14} color={colors.textSecondary} />
                   <Text style={styles.weeklyStatValue}>{tile.value.split(" ")[0]}</Text>
                   <Text style={styles.weeklyStatLabel}>{tile.label}</Text>
                 </View>
               ))}
            </View>
          </View>"""
code = re.sub(weekly_goal_search, momentum_replace, code)


# Today's Plan (Limit to top 2 tasks visually)
plan_search = """const visiblePlanTasks = todaysPlan.slice(0, 3);"""
plan_replace = """const visiblePlanTasks = todaysPlan.slice(0, 2);"""
code = code.replace(plan_search, plan_replace)

# Reorder: 
# Currently the order is: ContinueCard, Explore Topics, Quick Actions, Today's Plan, Mentor Live, Weekly Goal (Momentum), For You, Recent Activity, Recommended Missions.
# Since we removed Progress Snapshot entirely, the order is now:
# 1. Continue Card
# 2. Explore Topics
# 3. Quick Actions
# 4. Today's Plan
# Let's write the reorder as a simple cut-paste.
# We want Today's Plan BEFORE Quick Actions.
today_plan_regex = r"(          <View style=\{styles\.sectionHeader\}>\n            <Text style=\{\[styles\.sectionTitle, \{ color: adaptiveTextColor \}\]\}>Today.*?          </View>\n          <View style=\{styles\.planList\}>\n.*?          </View>)"
match_plan = re.search(today_plan_regex, code, re.DOTALL)
if match_plan:
    today_plan_code = match_plan.group(1)
    code = code.replace(today_plan_code, "")
    # insert before Quick Actions
    qa_header = "          <View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Quick Actions</Text>"
    code = code.replace(qa_header, today_plan_code + "\n\n" + qa_header)

# Edit Theme Button Low Emphasis
edit_theme_search = """  editThemeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 36,
    height: 36,
    borderRadius: 18,
"""
edit_theme_replace = """  editThemeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.15)",
    width: 32,
    height: 32,
    borderRadius: 16,
"""
code = code.replace(edit_theme_search, edit_theme_replace)


# Need to inject the missing styles logic at the end or inside the StyleSheet.
new_styles = """
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
"""

code = code.replace("  quickActionsGrid: {", new_styles + "  quickActionsGrid: {")


with open("src/screens/HomeHubScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS")
