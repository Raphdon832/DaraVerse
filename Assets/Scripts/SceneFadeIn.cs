using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

public class SceneFadeIn : MonoBehaviour
{
    public Image fadeImage;
    public float fadeDuration = 1.5f;

    [Header("Optional: Disable these GameObjects after fade + delay")]
    public List<GameObject> objectsToDisableAfterFade;
    public float disableDelayAfterFade = 3f;

    void Start()
    {
        if (fadeImage != null)
        {
            Color color = fadeImage.color;
            color.a = 1f;
            fadeImage.color = color;
            StartCoroutine(FadeIn());
        }
    }

    IEnumerator FadeIn()
    {
        float timer = 0f;
        Color color = fadeImage.color;

        while (timer < fadeDuration)
        {
            timer += Time.deltaTime;
            color.a = Mathf.Lerp(1f, 0f, timer / fadeDuration);
            fadeImage.color = color;
            yield return null;
        }

        fadeImage.color = new Color(color.r, color.g, color.b, 0f); // Ensure it's fully transparent

        if (objectsToDisableAfterFade != null && objectsToDisableAfterFade.Count > 0)
        {
            yield return new WaitForSeconds(disableDelayAfterFade);

            foreach (GameObject go in objectsToDisableAfterFade)
            {
                if (go != null)
                    go.SetActive(false);
            }
        }
    }
}