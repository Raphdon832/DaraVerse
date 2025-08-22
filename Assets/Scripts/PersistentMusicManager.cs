using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections;
using System.Collections.Generic;

public class PersistentMusicManager : MonoBehaviour
{
    [Header("Music Setup")]
    public List<AudioClip> musicPlaylist;
    public AudioSource audioSource;

    [Header("Mute Button UI (Optional)")]
    public Button muteToggleButton;
    public Sprite muteIcon;
    public Sprite unmuteIcon;

    [Header("Fade Settings")]
    public float fadeDuration = 1f;

    [Header("Scenes where music should be stopped")]
    public List<string> excludedSceneNames;

    [Header("Trivia Success")]
    public GameObject successPanel;

    [Header("Answer Feedback Sounds")]
    public AudioSource triviaAudioSource;
    public AudioClip correctSound;
    public AudioClip wrongSound;

    private bool isMuted = false;
    private Coroutine fadeCoroutine;

    void Start()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;

        if (muteToggleButton != null)
        {
            muteToggleButton.onClick.AddListener(ToggleMute);
            UpdateMuteIcon();
        }

        if (successPanel != null)
            successPanel.SetActive(false);

        PlayRandomMusicWithFade();
    }

    void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        if (excludedSceneNames.Contains(scene.name))
        {
            StartCoroutine(FadeAndStop());
            return;
        }

        GameObject foundButton = GameObject.FindWithTag("MuteButton");
        if (foundButton != null)
        {
            muteToggleButton = foundButton.GetComponent<Button>();
            if (muteToggleButton != null)
            {
                muteToggleButton.onClick.RemoveAllListeners();
                muteToggleButton.onClick.AddListener(ToggleMute);
                UpdateMuteIcon();
            }
        }
    }

    public void ToggleMute()
    {
        isMuted = !isMuted;

        if (fadeCoroutine != null)
            StopCoroutine(fadeCoroutine);

        fadeCoroutine = StartCoroutine(FadeVolume(isMuted ? 0f : 1f, fadeDuration));
        UpdateMuteIcon();
    }

    void UpdateMuteIcon()
    {
        if (muteToggleButton != null && muteToggleButton.image != null)
        {
            muteToggleButton.image.sprite = isMuted ? muteIcon : unmuteIcon;
        }
    }

    void PlayRandomMusicWithFade()
    {
        if (musicPlaylist.Count == 0 || audioSource == null) return;

        AudioClip newClip = musicPlaylist[Random.Range(0, musicPlaylist.Count)];

        if (fadeCoroutine != null)
            StopCoroutine(fadeCoroutine);

        fadeCoroutine = StartCoroutine(FadeToNewClip(newClip));
    }

    IEnumerator FadeToNewClip(AudioClip newClip)
    {
        yield return StartCoroutine(FadeVolume(0f, fadeDuration));

        audioSource.clip = newClip;
        audioSource.loop = true;
        audioSource.Play();

        yield return StartCoroutine(FadeVolume(isMuted ? 0f : 1f, fadeDuration));
    }

    IEnumerator FadeVolume(float targetVolume, float duration)
    {
        float startVolume = audioSource.volume;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            audioSource.volume = Mathf.Lerp(startVolume, targetVolume, elapsed / duration);
            elapsed += Time.deltaTime;
            yield return null;
        }

        audioSource.volume = targetVolume;
    }

    IEnumerator FadeAndStop()
    {
        yield return StartCoroutine(FadeVolume(0f, fadeDuration));
        audioSource.Stop();
    }

    public void PlayCorrectSound()
    {
        if (triviaAudioSource != null && correctSound != null)
            triviaAudioSource.PlayOneShot(correctSound);
    }

    public void PlayWrongSound()
    {
        if (triviaAudioSource != null && wrongSound != null)
            triviaAudioSource.PlayOneShot(wrongSound);
    }

    public void ShowSuccessPanel()
    {
        if (successPanel != null)
            successPanel.SetActive(true);
    }
}