using UnityEngine;
using TMPro;

public class HomeGreeting : MonoBehaviour
{
    public TMP_Text greetingText;

    void Start()
    {
        string userName = PlayerPrefs.GetString("UserName", "Explorer");
        greetingText.text = "Hello, " + userName + "!";
    }
}