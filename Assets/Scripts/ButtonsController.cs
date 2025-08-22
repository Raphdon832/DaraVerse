using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using Solo.MOST_IN_ONE;

public class ButtonsController : MonoBehaviour
{
    public string Scenename;
    // Start is called before the first frame update
    public void HapticFeel()
    {
       Haptic();
    }

    public void Haptic()
    {
        /* #if UNITY_ANDROID && !UNITY_EDITOR
        Handheld.Vibrate(); //Android default vibration

        #elif UNITY_IOS && !UNITY_EDITOR
        //iOS: Use native plugin for better haptics (see below)
        Handheld.Vibrate(); //Limited on iOS
        #else
        Debug.Log ("Vibrate called (Editor or unsupported platform)");
        #endif*/

        Most_HapticFeedback.Generate(Most_HapticFeedback.HapticTypes.RigidImpact);
        Debug.Log ("Haptics Works");
    }



     public void GoBackOneStep()
    {
        /*// Example: Load previous scene
        int currentSceneIndex = SceneManager.GetActiveScene().buildIndex;
        
        if (currentSceneIndex > 0) // Make sure we're not at the first scene
        {
            SceneManager.LoadScene(currentSceneIndex - 1);
        }
        else
        {
            // Maybe quit app if we're already at the first screen
            Application.Quit();
        }*/
    }

    void Update()
    {
        /*if (Input.GetKeyDown(KeyCode.Escape))
        {
            GoBackOneStep();
        }*/
    }

    public void GoToScene(string Scene)
    {
        SceneManager.LoadScene(Scene);
        Haptic();
    }

    public void GoBackToScene(string GoBackScene)
    {
        SceneManager.LoadScene(GoBackScene);
        Haptic();
    }

}
