using UnityEngine;
using TMPro;

public class SoundToggleButton : MonoBehaviour
{
    public TextMeshProUGUI toggleText;

    void Start()
    {
        UpdateIcon();
    }

    public void ToggleSound()
    {
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.ToggleMute();
            UpdateIcon();
        }
    }

    void UpdateIcon()
    {
        if (SoundManager.Instance != null && toggleText != null)
        {
            toggleText.text = SoundManager.Instance.IsMuted() ? "🔇" : "🔊";
        }
    }
}
