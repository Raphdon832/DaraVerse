using UnityEngine;
using TMPro;

public class GlobalSoundToggleButton : MonoBehaviour
{
    public TextMeshProUGUI toggleText; // Optional: show 🔊 / 🔇

    void Start()
    {
        UpdateUI();
    }

    public void ToggleSound()
    {
        GlobalAudioManager.Instance.ToggleMute();
        UpdateUI();
    }

    void UpdateUI()
    {
        if (toggleText != null)
        {
            toggleText.text = GlobalAudioManager.Instance.IsMuted() ? "🔇" : "🔊";
        }
    }
}
