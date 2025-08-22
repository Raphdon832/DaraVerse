using UnityEngine;

public class AppStartTrigger : MonoBehaviour
{
    void Start()
    {
        if (AchievementManager.Instance != null)
        {
            AchievementManager.Instance.Trigger(AchievementType.AppOpened);
        }
    }
}