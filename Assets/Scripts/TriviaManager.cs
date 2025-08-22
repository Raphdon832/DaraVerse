using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

[System.Serializable]
public class TriviaQuestion
{
    public string question;
    public string[] options;
    public int correctIndex;
}

public class TriviaManager : MonoBehaviour
{
    [Header("Trivia Settings")]
    public float timePerQuestion = 30f;
    public int passingScore = 3;
    public int pointsPerQuestion = 10;
    public int bonusPerSecond = 1;
    public int questionsPerQuiz = 5;

    [Header("UI References")]
    public TextMeshProUGUI questionText;
    public Button[] optionButtons;
    public TextMeshProUGUI timerText;
    public TextMeshProUGUI feedbackText;
    public TextMeshProUGUI scoreText;
    public TextMeshProUGUI finalScoreText;
    public GameObject questFailedPanel;
    public GameObject quizPanel;
    public Button tryAgainButton;
    public GameObject successPanel;

    [Header("Question List")]
    public List<TriviaQuestion> originalQuestions = new List<TriviaQuestion>();

    [Header("Sound Effects")]
    public AudioSource audioSource;
    public AudioClip correctSound;
    public AudioClip wrongSound;

    private List<TriviaQuestion> randomizedQuestions;
    private int currentQuestionIndex = -1;
    private float timer;
    private bool isTimerRunning = false;
    private int score = 0;
    private bool quizEnded = false;

    void Start()
    {
        tryAgainButton.onClick.AddListener(RestartQuiz);
        StartQuiz();
    }

    void Update()
    {
        if (isTimerRunning)
        {
            timer -= Time.deltaTime;
            timerText.text = "" + Mathf.Ceil(timer).ToString();

            if (timer <= 0)
            {
                isTimerRunning = false;
                feedbackText.text = "Time's up!";
                Invoke("ShowNextQuestion", 1.5f);
            }
        }
    }

    void StartQuiz()
    {
        score = 0;
        currentQuestionIndex = -1;
        quizEnded = false;
        feedbackText.text = "";
        questFailedPanel.SetActive(false);
        successPanel.SetActive(false);
        tryAgainButton.gameObject.SetActive(false);
        quizPanel.SetActive(true);

        randomizedQuestions = new List<TriviaQuestion>(originalQuestions);
        ShuffleList(randomizedQuestions);

        if (randomizedQuestions.Count > questionsPerQuiz)
        {
            randomizedQuestions = randomizedQuestions.GetRange(0, questionsPerQuiz);
        }

        UpdateScoreUI();
        ShowNextQuestion();
    }

    void ShowNextQuestion()
    {
        feedbackText.text = "";

        currentQuestionIndex++;

        if (currentQuestionIndex >= randomizedQuestions.Count)
        {
            EndQuiz();
            return;
        }

        TriviaQuestion q = randomizedQuestions[currentQuestionIndex];

        List<string> shuffledOptions = new List<string>(q.options);
        ShuffleList(shuffledOptions);
        int newCorrectIndex = shuffledOptions.IndexOf(q.options[q.correctIndex]);

        questionText.text = q.question;

        for (int i = 0; i < optionButtons.Length; i++)
        {
            if (i < shuffledOptions.Count)
            {
                optionButtons[i].gameObject.SetActive(true);
                optionButtons[i].GetComponentInChildren<TextMeshProUGUI>().text = shuffledOptions[i];
                optionButtons[i].onClick.RemoveAllListeners();

                int index = i;
                optionButtons[i].onClick.AddListener(() =>
                {
                    if (!quizEnded)
                        HandleAnswer(index == newCorrectIndex);
                });
            }
            else
            {
                optionButtons[i].gameObject.SetActive(false);
            }
        }

        timer = timePerQuestion;
        isTimerRunning = true;
    }

    void HandleAnswer(bool isCorrect)
    {
        isTimerRunning = false;

        if (isCorrect)
        {
            float timeRemaining = Mathf.Clamp(timer, 0, timePerQuestion);
            int bonus = Mathf.RoundToInt(timeRemaining * bonusPerSecond);
            score += pointsPerQuestion + bonus;
            feedbackText.text = "Correct!";
            if (audioSource != null && correctSound != null)
                audioSource.PlayOneShot(correctSound);
        }
        else
        {
            feedbackText.text = "Wrong!";
            if (audioSource != null && wrongSound != null)
                audioSource.PlayOneShot(wrongSound);
        }

        UpdateScoreUI();
        Invoke("ShowNextQuestion", 1.5f);
    }

    void EndQuiz()
    {
        quizEnded = true;
        quizPanel.SetActive(false);
        feedbackText.text = "";

        foreach (Button btn in optionButtons)
        {
            btn.interactable = false;
        }

        finalScoreText.text = "" + score;

        if (score < passingScore)
        {
            questFailedPanel.SetActive(true);
            tryAgainButton.gameObject.SetActive(true);
            tryAgainButton.onClick.RemoveAllListeners();
            tryAgainButton.onClick.AddListener(RestartQuiz);
        }
        else
        {
            Debug.Log("Quest Passed! Score: " + score);
            if (successPanel != null)
                successPanel.SetActive(true);
        }
    }

    void RestartQuiz()
    {
        foreach (Button btn in optionButtons)
        {
            btn.interactable = true;
        }

        StartQuiz();
    }

    void UpdateScoreUI()
    {
        scoreText.text = "" + score;
    }

    void ShuffleList<T>(List<T> list)
    {
        for (int i = list.Count - 1; i > 0; i--)
        {
            int rnd = Random.Range(0, i + 1);
            T value = list[rnd];
            list[rnd] = list[i];
            list[i] = value;
        }
    }
}