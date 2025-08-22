// TriviaMissionManager.cs
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;
using System.Collections.Generic;

public class TriviaMissionManager : MonoBehaviour
{
    //Background Image
    public GameObject BackgroundImage;
    //Timer for the Questions Variable
    public TMP_Text timerText;
    public float timePerQuestion = 30f;
    private float currentTime;
    private bool isTimerRunning = false;
    //End of Timer

    //Pause functions
    public GameObject pauseMenu; // Assign panel in the Inspector
    private bool isPaused = false;

    public GameObject pauseButton;
    public GameObject BigScoreText;
    public List<GameObject> objectsToDisableAtEnd;



    public ButtonsController HapticFeedback;
    [System.Serializable]
    public class Question
    {
        public string questionText;
        public string[] options;
        public int correctOptionIndex;
    }

    public Question[] questions;
    public TMP_Text questionText;
    public Button[] optionButtons;
    public TMP_Text[] optionButtonTexts; // Text components for each button
    public TMP_Text feedbackText;
    public List<TMP_Text> scoreTexts;
    public GameObject endScreen;
    public GameObject correctAnswerEffect;
    public GameObject wrongAnswerEffect;
    public GameObject tryAgainButton;
    public GameObject goBackButton;

    private List<Question> randomizedQuestions = new List<Question>();
    private int currentQuestionIndex = 0;
    private int score = 0;
    private bool answeredWrongThisQuestion = false;

    void Start()
    {
        HighScoreManager.Instance.InitializeLevel("Level1");
        feedbackText.text = "";
        score = 0;
        UpdateScoreText();
        RandomizeQuestions();
        DisplayCurrentQuestion();
    }

    void Update()
    {
        if (isTimerRunning)
    {
        currentTime -= Time.deltaTime;
        timerText.text = Mathf.Ceil(currentTime).ToString() + "s";

        if (currentTime <= 0f)
        {
            isTimerRunning = false;
            feedbackText.text = "Time's up!";
            Invoke("NextQuestion", 3.7f);
        }
    }


    }

    void RandomizeQuestions()
    {
    List<Question> allQuestions = new List<Question>(questions);

    randomizedQuestions.Clear();
    int countToPick = Mathf.Min(10, allQuestions.Count);

    for (int i = 0; i < countToPick; i++)
    {
        int index = Random.Range(0, allQuestions.Count);
        randomizedQuestions.Add(allQuestions[index]);
        allQuestions.RemoveAt(index); // prevent duplicates
    }
    }


    void DisplayCurrentQuestion()
    {
        Question q = randomizedQuestions[currentQuestionIndex];
        questionText.text = q.questionText;
        answeredWrongThisQuestion = false;

        List<int> indices = new List<int> { 0, 1, 2, 3 };
        for (int i = 0; i < indices.Count; i++)
        {
            int temp = indices[i];
            int rand = Random.Range(i, indices.Count);
            indices[i] = indices[rand];
            indices[rand] = temp;
        }

        int newCorrectIndex = 0;
        for (int i = 0; i < optionButtons.Length; i++)
        {
            if (i < q.options.Length)
            {
                optionButtons[i].gameObject.SetActive(true);
                int optionIndex = indices[i];
                optionButtonTexts[i].text = q.options[optionIndex];

                if (optionIndex == q.correctOptionIndex)
                {
                    newCorrectIndex = i;
                }

                int index = i;
                optionButtons[i].onClick.RemoveAllListeners();
                optionButtons[i].onClick.AddListener(() => OnOptionSelected(index));
            }
            else
            {
                optionButtons[i].gameObject.SetActive(false);
            }
        }

        q.correctOptionIndex = newCorrectIndex;

        if (correctAnswerEffect != null)
        {
            correctAnswerEffect.SetActive(false);
        }
        if (wrongAnswerEffect != null)
        {
            wrongAnswerEffect.SetActive(false);
        }
        currentTime = timePerQuestion;
        isTimerRunning = true;
    }

    void OnOptionSelected(int selectedIndex)
    {
        isTimerRunning = false;
        if (selectedIndex == randomizedQuestions[currentQuestionIndex].correctOptionIndex)
        {
            feedbackText.text = "Correct!";
            isTimerRunning = false;

           if (!answeredWrongThisQuestion)
            {
                int baseScore = 10;
                int bonus = (currentTime > 20f) ? 5 : 0;
                score += baseScore + bonus;
                UpdateScoreText();
            }

            if (correctAnswerEffect != null)
            {
                correctAnswerEffect.SetActive(true);
                HapticFeedback.Haptic();
            }

            Invoke("NextQuestion", 3.7f);
        }
        else
        {
            feedbackText.text = "Oops! Try again.";
            answeredWrongThisQuestion = true;

            if (wrongAnswerEffect != null)
            {
                wrongAnswerEffect.SetActive(true);
                Invoke("HideWrongAnswerEffect", 3.7f);
            }
        }
    }

    void NextQuestion()
    {
        feedbackText.text = "";
        currentQuestionIndex++;

        if (currentQuestionIndex < randomizedQuestions.Count)
        {
            DisplayCurrentQuestion();
        }
        else
        {
            ShowEndScreen();
            isTimerRunning = false;
            pauseButton.SetActive(false);
            BigScoreText.SetActive(true);
        }
    }

    void HideWrongAnswerEffect()
    {
        if (wrongAnswerEffect != null)
        {
            wrongAnswerEffect.SetActive(false);
        }
    }

    void ShowEndScreen()
    {
        if (questionText != null)
            questionText.gameObject.SetActive(false);

        foreach (Button btn in optionButtons)
        {
            if (btn != null)
                btn.gameObject.SetActive(false);
        }

        if (endScreen != null)
            endScreen.SetActive(true);
            BackgroundImage.SetActive(false);

        if (tryAgainButton != null)
            tryAgainButton.SetActive(true);

        if (goBackButton != null)
            goBackButton.SetActive(true);

        HighScoreManager.Instance.TrySetNewHighScore(score);
    
        // Save high score before showing the end screen
        HighScoreManager.Instance.TrySetNewHighScore(score);
        // Hide the question text
        if (questionText != null)
        {
            questionText.gameObject.SetActive(false);
        }

        // Hide all option buttons
        foreach (Button btn in optionButtons)
        {
            if (btn != null)
            {
                btn.gameObject.SetActive(false);
            }
        }

        // Finally, show the End Screen
        if (endScreen != null)
        {
            endScreen.SetActive(true);
        }


        foreach (GameObject obj in objectsToDisableAtEnd)
        {
            if (obj != null)
            obj.SetActive(false);
        }
    }

    void UpdateScoreText()
    {
        foreach (TMP_Text text in scoreTexts)
        {
        if (text != null)
        {
            text.text = score.ToString();
        }
        }
    }

    public void ReturnToHome()
    {
        SceneManager.LoadScene("Homescreen");
    }

    public void TryAgain()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    public void PauseGame()
{
    isPaused = true;
    isTimerRunning = false; // Stop the timer
    pauseMenu.SetActive(true);
    Time.timeScale = 0f; // Pause everything else
}

    public void ResumeGame()
{
    isPaused = false;
    isTimerRunning = true;
    pauseMenu.SetActive(false);
    Time.timeScale = 1f;
}

}
