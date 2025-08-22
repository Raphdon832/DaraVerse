using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class InAppWebView : MonoBehaviour
{
    WebViewObject webViewObject;

    public void OpenWeb(string url)
    {
        webViewObject = (new GameObject("WebViewObject")).AddComponent<WebViewObject>();
        webViewObject.Init(
            cb: (msg) => { Debug.Log($"WebView message: {msg}"); },
            err: (msg) => { Debug.LogError($"WebView error: {msg}"); },
            ld: (msg) => { Debug.Log($"WebView loaded: {msg}"); });

        webViewObject.LoadURL(url);
        webViewObject.SetMargins(0, 100, 0, 0); // Adjust margin if needed
        webViewObject.SetVisibility(true);
    }

    public void CloseWeb()
    {
        if (webViewObject != null)
        {
            Destroy(webViewObject.gameObject);
        }
    }
}