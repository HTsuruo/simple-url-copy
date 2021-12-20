
const AMAZON_HOST = "www.amazon.co.jp";
const GOOGLE_DRIVE_HOST = "drive.google.com";
const FIREBASE_CONSOLE_HOST = "console.firebase.google.com";

let stores = {
  "excludeQuery": false
}
//テキストのコピー
const copyText = text => {
  let copyTextArea = document.querySelector("#copy-textarea");
  copyTextArea.textContent = text;
  copyTextArea.select();
  document.execCommand('copy');
}

const extractAmazonUrl = rawUrl => {
  const url = new URL(rawUrl);
  if (url.host == AMAZON_HOST && url.pathname.match(/\/dp\/[A-Za-z0-9]+\//)) {
    newUrl = url.origin + url.pathname.replace(/(^\S+)(\/dp\/[A-Za-z0-9]+\/)(.*)/, '$2');
    return newUrl;
  } else {
    return rawUrl;
  }
}

const excludeQuery = rawUrl => {
  const url = new URL(rawUrl);
  const newUrl = url.origin + url.pathname;
  return newUrl;
}

const showCopied = _ => {
  let copied = document.querySelector("#copied");
  copied.classList.remove("invisible");//invisibleを削除
  setTimeout(_ => copied.classList.add("invisible"), 500);//5秒？で追加
}

// URL共有する際に都合の悪いログインしているアカウント特有の`/u/x`を取り除きます。
const retrieveAccountPathFromOriginalUrl = rawUrl => {
  const url = new URL(rawUrl);
  if(url.hostname == GOOGLE_DRIVE_HOST || url.hostname == FIREBASE_CONSOLE_HOST) {
    const splitWord = '/u/';
    if ( rawUrl.indexOf(splitWord) == -1 ) {
      return rawUrl;
    }
    const splited = url.origin.split(splitWord);
    return splited[0] + "/"+ splited[1].slice(1);
  }
  return rawUrl;
}

const copyUrl = menuType => {
  chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, function (tabs) {
    let url = tabs[0].url;//URLの取得
    const title = tabs[0].title;//titleの取得

    // Process AmazonURL
    url = extractAmazonUrl(url);

    // Process Query
    if(stores.excludeQuery) {
      url = excludeQuery(url);
    }

    url = retrieveAccountPathFromOriginalUrl(url)

    let text;
    switch (menuType) {//textの選択
      case "only":
        text = `${url}`
        break;
      case "markdown":
        text = `[${title}](${url})`
        break;
      case "html":
        text = `<a href="${url}">${title}</a>`
        break;
      case "simple":
        text = `${title} ${url}`
        break;
      case "with-newline":
        text = `${title}\n${url}`
        break;
      case "markdown-with-newline":
        text = `[${title}](${url})\n`
      case "markdown-with-list":
        text = `- [${title}](${url})`
        break;
    }
    copyText(text);
    showCopied();
  })
}

const onInit = _ => {
  // First copy markdown
  copyUrl("markdown");
  document.querySelectorAll(".mdl-button").forEach(el => {
    el.addEventListener("click", onClickCopyMenu);
  });
  document.querySelector("#switchExcludeQuery")
          .addEventListener("click", onClickSwitchExcludeQuery);
}

const onClickSwitchExcludeQuery = evt => {
  stores.excludeQuery = evt.srcElement.checked;
  console.log(evt.srcElement.checked);
}

const onClickCopyMenu = function(evt){
  const menuType = this.id;
  copyUrl(menuType);
}

document.addEventListener("DOMContentLoaded", onInit);