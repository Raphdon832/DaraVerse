using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;

public class GlobalAudioManager : MonoBehaviour
{
    public static GlobalAudioManager Instance;

    [Header("Audio Setup")]
    public List<AudioClip> audioClips;
    public float fadeDuration = 1.5f;
    public float targetVolume = 1f;

    [Header("Scene Exclusion")]
    public List<string> excludedScenes;

    private AudioSource audioSource;
    private bool isMuted = false;
    private bool isSceneExcluded = false;
    private AudioClip lastClip;

    void Awake()
    {
        // Singleton setup
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);

        // Setup AudioSource
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }

        audioSource.loop = false; // Enable auto-track switching
        audioSource.playOnAwake = false;
        audioSource.volume = targetVolume;

        SceneManager.sceneLoaded += OnSceneLoaded;

        if (audioClips != null && audioClips.Count > 0)
        {
            PlayRandomClip();
            StartCoroutine(AudioLoopHandler());
        }
    }

    void PlayRandomClip()
    {
        if (audioClips.Count == 0) return;

        AudioClip newClip;

        // Prevent repeating the same clip back to back
        do
        {
            newClip = audioClips[Random.Range(0, audioClips.Count)];
        } while (audioClips.Count > 1 && newClip == lastClip);

        lastClip = newClip;
        audioSource.clip = newClip;
        audioSource.Play();
    }

    IEnumerator AudioLoopHandler()
    {
        while (true)
        {
            // Wait while current clip is still playing or excluded or muted
            while (audioSource.isPlaying || isMuted || isSceneExcluded)
            {
                yield return null;
            }

            if (!isMuted && !isSceneExcluded)
            {
                PlayRandomClip();
            }

            yield return null;
        }
    }

    void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        string sceneName = scene.name;
        isSceneExcluded = excludedScenes.Contains(sceneName);

        if (isSceneExcluded)
        {
            StartCoroutine(FadeOut());
        }
        else if (!isMuted)
        {
            StartCoroutine(FadeIn());
        }
    }

    public void ToggleMute()
    {
        isMuted = !isMuted;

        if (isSceneExcluded) return;

        if (isMuted)
            StartCoroutine(FadeOut());
        else
            StartCoroutine(FadeIn());
    }

    public bool IsMuted()
    {
        return isMuted;
    }

    IEnumerator FadeOut()
    {
        float startVolume = audioSource.volume;

        for (float t = 0; t < fadeDuration; t += Time.deltaTime)
        {
            audioSource.volume = Mathf.Lerp(startVolume, 0f, t / fadeDuration);
            yield return null;
        }

        audioSource.volume = 0f;
        audioSource.Pause();
    }

    IEnumerator FadeIn()
    {
        if (audioSource.clip == null && audioClips.Count > 0)
            PlayRandomClip();

        audioSource.UnPause();
        float currentVolume = 0f;
        audioSource.volume = 0f;

        for (float t = 0; t < fadeDuration; t += Time.deltaTime)
        {
            currentVolume = Mathf.Lerp(0f, targetVolume, t / fadeDuration);
            audioSource.volume = currentVolume;
            yield return null;
        }

        audioSource.volume = targetVolume;
    }

    void OnDestroy()
    {
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }
}
