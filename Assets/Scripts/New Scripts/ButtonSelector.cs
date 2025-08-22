using UnityEngine;
using UnityEngine.SceneManagement;

public class ButtonSelector : MonoBehaviour
{
    public string selectionKey;         // e.g. "option1", "sword", "mentorA"
    public string nextSceneName;        // Scene to load after selection (optional)

    public void SelectOption()
    {
        PlayerPrefs.SetString("SelectedOption", selectionKey);
        PlayerPrefs.Save();

        Debug.Log($"Selected: {selectionKey}");

        if (!string.IsNullOrEmpty(nextSceneName))
        {
            SceneManager.LoadScene(nextSceneName);
        }
    }
}