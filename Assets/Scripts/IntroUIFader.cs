using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class IntroUIFader : MonoBehaviour
{
    [System.Serializable]
    public class FadeObject
    {
        public GameObject targetObject;
        public float delayBeforeShow = 0.5f;
        public float displayDuration = 2f;
    }

    public List<FadeObject> fadeSequence = new List<FadeObject>();

    void Awake()
    {
        foreach (var item in fadeSequence)
        {
            if (item.targetObject != null)
                item.targetObject.SetActive(false);
        }
    }

    void Start()
    {
        StartCoroutine(PlaySequence());
    }

    IEnumerator PlaySequence()
    {
        foreach (var item in fadeSequence)
        {
            yield return new WaitForSeconds(item.delayBeforeShow);

            if (item.targetObject != null)
                item.targetObject.SetActive(true);

            yield return new WaitForSeconds(item.displayDuration);

            if (item.targetObject != null)
                item.targetObject.SetActive(false);
        }
    }
}
