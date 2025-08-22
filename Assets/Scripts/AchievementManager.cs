using UnityEngine;
using System.Collections.Generic;
using UnityEngine.Events;

public enum AchievementType
{
    AppOpened,
    TriviaClicked,
    PointsReached,
    NewHighScore,
    LevelOpened
}

[System.Serializable]
public class Achievement
{
    public string id; // Unique name (e.g. "open_app")
    public string title;
    public AchievementType type;
    public int value; // e.g. 10 points, score of 30
    public bool unlocked;
    public UnityEvent onUnlocked; // Optional UI feedback
}

public class AchievementManager : MonoBehaviour
{
    public static AchievementManager Instance;
    public List<Achievement> achievements = new List<Achievement>();

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadAchievements();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void Trigger(AchievementType type, int value = 0)
    {
        foreach (var achievement in achievements)
        {
            if (!achievement.unlocked && achievement.type == type)
            {
                if (type == AchievementType.AppOpened || type == AchievementType.TriviaClicked || type == AchievementType.LevelOpened)
                {
                    Unlock(achievement);
                }
                else if (value >= achievement.value)
                {
                    Unlock(achievement);
                }
            }
        }
    }

    private void Unlock(Achievement achievement)
    {
        achievement.unlocked = true;
        PlayerPrefs.SetInt("ACH_" + achievement.id, 1);
        PlayerPrefs.Save();
        achievement.onUnlocked?.Invoke();
        Debug.Log("Achievement Unlocked: " + achievement.title);
    }

    private void LoadAchievements()
    {
        foreach (var achievement in achievements)
        {
            if (PlayerPrefs.GetInt("ACH_" + achievement.id, 0) == 1)
            {
                achievement.unlocked = true;
            }
        }
    }
}
