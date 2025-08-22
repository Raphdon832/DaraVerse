using UnityEngine;
using System.Collections.Generic;

public class SelectorReceiver : MonoBehaviour
{
    [System.Serializable]
    public class SelectableOption
    {
        public string key;               // The same key used in ButtonSelector
        public GameObject targetObject;  // Object to activate
    }

    public List<SelectableOption> options;

    void Start()
    {
        string selectedKey = PlayerPrefs.GetString("SelectedOption", "");

        foreach (var option in options)
        {
            bool isActive = (option.key == selectedKey);
            option.targetObject.SetActive(isActive);
        }
    }
}
