using UnityEngine;

public class AutoHideAfterDelay : MonoBehaviour
{
    public float hideDelay = 5f;

    void OnEnable()
    {
        CancelInvoke(); // just in case it was reused
        Invoke(nameof(Hide), hideDelay);
    }

    void Hide()
    {
        gameObject.SetActive(false);
    }
}