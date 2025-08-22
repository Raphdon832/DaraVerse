using UnityEngine;

public class PauseManager : MonoBehaviour
{
    [Header("Pause UI")]
    public GameObject pauseMenuUI;

    private bool isPaused = false;

    public void TogglePause()
    {
        isPaused = !isPaused;

        if (isPaused)
            PauseGame();
        else
            ResumeGame();
    }

    public void PauseGame()
    {
        Time.timeScale = 0f;
        if (pauseMenuUI != null)
            pauseMenuUI.SetActive(true);
    }

    public void ResumeGame()
    {
        Time.timeScale = 1f;
        if (pauseMenuUI != null)
            pauseMenuUI.SetActive(false);
    }

    void OnDestroy()
    {
        // Ensure timeScale is reset if the object is destroyed (e.g. scene reload)
        Time.timeScale = 1f;
    }
}