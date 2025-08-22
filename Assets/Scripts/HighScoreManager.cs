using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;
using System.Collections.Generic;

public class HighScoreManager : MonoBehaviour
{
    public static HighScoreManager Instance;
    public TMP_Text highScoreDisplayText;
    
    private int currentHighScore = 0;
    private string currentLevelKey = "";

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // Call this when starting a level
    public void InitializeLevel(string levelName)
    {
        currentLevelKey = levelName + "_HighScore";
        LoadHighScore();
    }

    // Call this when the player finishes a level
    public void TrySetNewHighScore(int score)
    {
        if (score > currentHighScore)
        {
            currentHighScore = score;
            SaveHighScore();
            UpdateHighScoreUI();
        }
    }

    private void SaveHighScore()
    {
        PlayerPrefs.SetInt(currentLevelKey, currentHighScore);
        PlayerPrefs.Save();
    }

    private void LoadHighScore()
    {
        currentHighScore = PlayerPrefs.GetInt(currentLevelKey, 0);
        UpdateHighScoreUI();
    }

    private void UpdateHighScoreUI()
    {
        if (highScoreDisplayText != null)
        {
            highScoreDisplayText.text = "High Score: " + currentHighScore;
        }
    }
}