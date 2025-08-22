using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;
using Solo.MOST_IN_ONE;

public class UserSetupManager : MonoBehaviour
{
    public TMP_InputField nameInput;
    public TMP_InputField ageInput;
    public TMP_Text warningText;



void Start()
    {
        nameInput.shouldHideMobileInput = false;
        ageInput.shouldHideMobileInput = false;

#if UNITY_WEBGL && !UNITY_EDITOR
        SetWebGLInputFix();
#endif
    }

#if UNITY_WEBGL && !UNITY_EDITOR
    private void SetWebGLInputFix()
    {
        // This will only compile in the proper WebGL environment
        // captureAllKeyboardInput is available in Unity 2021.2+
        // Wrap in try-catch in case of version mismatch
        try
        {
            typeof(Input).GetProperty("captureAllKeyboardInput")?.SetValue(null, false, null);
        }
        catch { }
    }
#endif


    public void OnContinue()
    {
        string name = nameInput.text.Trim();
        string age = ageInput.text.Trim();

        /*if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(age))
        {
            warningText.text = "Please enter your name and age.";
            return;
        }*/

        PlayerPrefs.SetString("UserName", name);
        PlayerPrefs.SetString("UserAge", age);
        PlayerPrefs.Save();

        SceneManager.LoadScene("Homescreen");
        Most_HapticFeedback.Generate(Most_HapticFeedback.HapticTypes.RigidImpact);
    }
}