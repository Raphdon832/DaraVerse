using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DisableAfterSeconds : MonoBehaviour
{
    [System.Serializable]
    public class DisableSet
    {
        [Header("Label (optional)")]
        public string label;

        [Header("GameObjects in this set")]
        public List<GameObject> gameObjects;

        [Header("Timing (in seconds)")]
        public float delayBeforeActivation = 2f;     // X seconds
        public float activeDuration = 5f;            // Y seconds
        public float delayBeforeDeactivation = 3f;   // Z seconds
    }

    [System.Serializable]
    public class Dependency
    {
        [Header("This GameObject will become ACTIVE")]
        public GameObject dependentObject;

        [Header("ONLY when this GameObject becomes INACTIVE")]
        public GameObject watchedObject;
    }

    [Header("Disable Sets")]
    public List<DisableSet> disableSets = new List<DisableSet>();

    [Header("Special Dependency Triggers")]
    public List<Dependency> dependencies = new List<Dependency>();

    void Awake()
    {
        // Force all dependents OFF as early as possible
        foreach (var dep in dependencies)
        {
            if (dep.dependentObject != null)
                dep.dependentObject.SetActive(false);
        }
    }

    void Start()
    {
        // Also force them off in Start, just in case
        foreach (var dep in dependencies)
        {
            if (dep.dependentObject != null)
                dep.dependentObject.SetActive(false);
        }

        // Run timed cycles
        foreach (var set in disableSets)
        {
            StartCoroutine(ActivationCycle(set));
        }

        // Monitor dependencies
        foreach (var dep in dependencies)
        {
            if (dep.dependentObject != null && dep.watchedObject != null)
            {
                StartCoroutine(WatchAndActivate(dep));
            }
        }
    }

    IEnumerator ActivationCycle(DisableSet set)
    {
        foreach (var obj in set.gameObjects)
        {
            if (obj != null) obj.SetActive(false);
        }

        yield return new WaitForSeconds(set.delayBeforeActivation);

        foreach (var obj in set.gameObjects)
        {
            if (obj != null) obj.SetActive(true);
        }

        yield return new WaitForSeconds(set.activeDuration);
        yield return new WaitForSeconds(set.delayBeforeDeactivation);

        foreach (var obj in set.gameObjects)
        {
            if (obj != null) obj.SetActive(false);
        }
    }

    IEnumerator WatchAndActivate(Dependency dep)
    {
        // Ensure Unity hierarchy is settled
        yield return null;
        yield return null;

        // Wait until the watchedObject becomes inactive
        while (dep.watchedObject != null && dep.watchedObject.activeInHierarchy)
        {
            yield return null;
        }

        // Now it's inactive — enable the dependent
        if (dep.dependentObject != null)
            dep.dependentObject.SetActive(true);
    }
}