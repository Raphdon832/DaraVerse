using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;

[System.Serializable]
public class SaveableObject
{
    public string key;
    public GameObject targetObject;
    public bool savePosition;
    public bool saveText;

    // Internal tracking
    [HideInInspector] public Vector3 lastSavedPosition;
    [HideInInspector] public string lastSavedText;
}

public class SaveManager : MonoBehaviour
{
    public List<SaveableObject> itemsToSave;
    public float checkInterval = 1.0f; // Time between auto-checks in seconds

    void Start()
    {
        LoadAll();
        InvokeRepeating(nameof(AutoSaveCheck), checkInterval, checkInterval);
    }

    void AutoSaveCheck()
    {
        foreach (var item in itemsToSave)
        {
            if (item.targetObject == null) continue;

            // Position Change
            if (item.savePosition)
            {
                Vector3 currentPos = item.targetObject.transform.position;
                if (currentPos != item.lastSavedPosition)
                {
                    PlayerPrefs.SetFloat(item.key + "_x", currentPos.x);
                    PlayerPrefs.SetFloat(item.key + "_y", currentPos.y);
                    PlayerPrefs.SetFloat(item.key + "_z", currentPos.z);
                    item.lastSavedPosition = currentPos;
                    Debug.Log($"[AutoSave] Position saved for {item.key}");
                }
            }

            // Text Change
            if (item.saveText)
            {
                Text textComponent = item.targetObject.GetComponent<Text>();
                if (textComponent != null)
                {
                    string currentText = textComponent.text;
                    if (currentText != item.lastSavedText)
                    {
                        PlayerPrefs.SetString(item.key + "_text", currentText);
                        item.lastSavedText = currentText;
                        Debug.Log($"[AutoSave] Text saved for {item.key}");
                    }
                }
            }
        }

        PlayerPrefs.Save();
    }

    public void LoadAll()
    {
        foreach (var item in itemsToSave)
        {
            if (item.targetObject == null) continue;

            if (item.savePosition)
            {
                Vector3 pos = item.targetObject.transform.position;
                pos.x = PlayerPrefs.GetFloat(item.key + "_x", pos.x);
                pos.y = PlayerPrefs.GetFloat(item.key + "_y", pos.y);
                pos.z = PlayerPrefs.GetFloat(item.key + "_z", pos.z);
                item.targetObject.transform.position = pos;
                item.lastSavedPosition = pos;
            }

            if (item.saveText)
            {
                Text textComponent = item.targetObject.GetComponent<Text>();
                if (textComponent != null)
                {
                    string savedText = PlayerPrefs.GetString(item.key + "_text", textComponent.text);
                    textComponent.text = savedText;
                    item.lastSavedText = savedText;
                }
            }
        }
    }

    public void ClearAllData()
    {
        PlayerPrefs.DeleteAll();
        Debug.Log("All PlayerPrefs cleared.");
    }
}