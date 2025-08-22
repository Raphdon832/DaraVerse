using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SuccessFeedback : MonoBehaviour
{
    public ButtonsController HapticFeedback;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        HapticFeedback.Haptic();
    }
}
