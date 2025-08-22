using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class FrameRateManager : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Application.targetFrameRate = 120;
    }
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            GoBack();
        }
    }

    void GoBack()
    {
        // Example: Load previous scene
        int currentSceneIndex = SceneManager.GetActiveScene().buildIndex;
        
        if (currentSceneIndex > 0) // Make sure we're not at the first scene
        {
            SceneManager.LoadScene(currentSceneIndex - 1);
        }
        else
        {
            // Maybe quit app if we're already at the first screen
            Application.Quit();
        }
    }
}
