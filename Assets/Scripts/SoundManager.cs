using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance;

    [Header("Audio Settings")]
    public List<AudioClip> backgroundClips;
    public AudioSource audioSource;
    public float fadeDuration = 1.5f;

    private bool isMuted = false;

    void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);

        if (audioSource == null)
            audioSource = gameObject.AddComponent<AudioSource>();

        audioSource.loop = true;
        audioSource.playOnAwake = false;
        PlayRandomClip();
    }

    void PlayRandomClip()
    {
        if (backgroundClips.Count == 0) return;

        AudioClip randomClip = backgroundClips[Random.Range(0, backgroundClips.Count)];
        audioSource.clip = randomClip;
        audioSource.Play();
    }

    public void ToggleMute()
    {
        isMuted = !isMuted;

        if (isMuted)
            StartCoroutine(FadeOut(audioSource, fadeDuration));
        else
            StartCoroutine(FadeIn(audioSource, fadeDuration));
    }

    public bool IsMuted()
    {
        return isMuted;
    }

    IEnumerator FadeOut(AudioSource source, float duration)
    {
        float startVolume = source.volume;

        for (float t = 0; t < duration; t += Time.deltaTime)
        {
            source.volume = Mathf.Lerp(startVolume, 0, t / duration);
            yield return null;
        }

        source.volume = 0;
        source.Pause();
    }

    IEnumerator FadeIn(AudioSource source, float duration)
    {
        source.UnPause();
        float targetVolume = 1f;
        source.volume = 0;

        for (float t = 0; t < duration; t += Time.deltaTime)
        {
            source.volume = Mathf.Lerp(0, targetVolume, t / duration);
            yield return null;
        }

        source.volume = targetVolume;
    }
}
