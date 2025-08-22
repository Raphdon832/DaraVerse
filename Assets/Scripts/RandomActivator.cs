using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class RandomActivator : MonoBehaviour
{
    [Header("Objects to Randomly Activate")]
    public List<GameObject> objectsToActivate;

    [Header("Timing Settings")]
    public float activeDuration = 3f;

    [Tooltip("Minimum delay between activations (seconds)")]
    public float minDelayBetweenActivations = 1f;

    [Tooltip("Maximum delay between activations (seconds)")]
    public float maxDelayBetweenActivations = 3f;

    [Header("Activation Loop")]
    public bool loopActivation = true;

    private bool isRunning = false;

    void Start()
    {
        if (loopActivation)
        {
            StartActivating();
        }
    }

    public void StartActivating()
    {
        if (!isRunning)
        {
            isRunning = true;
            StartCoroutine(ActivationLoop());
        }
    }

    public void StopActivating()
    {
        isRunning = false;
        StopAllCoroutines();
        DisableAll();
    }

    IEnumerator ActivationLoop()
    {
        while (isRunning)
        {
            // Choose a random object
            GameObject chosen = objectsToActivate[Random.Range(0, objectsToActivate.Count)];

            // Activate it
            chosen.SetActive(true);

            // Wait while active
            yield return new WaitForSeconds(activeDuration);

            // Disable it
            chosen.SetActive(false);

            // Random delay before next activation
            float randomDelay = Random.Range(minDelayBetweenActivations, maxDelayBetweenActivations);
            yield return new WaitForSeconds(randomDelay);
        }
    }

    void DisableAll()
    {
        foreach (GameObject obj in objectsToActivate)
        {
            if (obj.activeSelf)
                obj.SetActive(false);
        }
    }
}
