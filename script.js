const getVariables = () => {
    const variableList = document.querySelector('#global-variables > form');
    if (!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: readVariables,
                args: ['--']
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    console.log(`Frame ${frameId}`);
                    result && result.forEach(element => {
                        const div = document.createElement('div');
                        div.classList.add('spectrum-Form-item');
                        div.innerHTML = `
                        <label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--left" for="fieldLabelExample-${element[0]}">${element[0]}</label>
                        <div class="spectrum-Form-itemField">
                            <div class="spectrum-Textfield">
                                <input class="spectrum-Textfield-input" aria-invalid="false" type="text" placeholder="${element[1]}" id="fieldLabelExample-${element[0]}">
                            </div>
                        </div>`;

                        div.querySelector('input').addEventListener('change', ((e) => {
                            chrome.scripting.insertCSS({
                                target: {
                                    tabId: tab[0].id,
                                },
                                css: `:root { ${element[0]}: ${e.target.value} !important; }`
                            });
                            console.log(`:root { ${element[0]}: ${e.target.value} !important; }`);
                        }));
                        variableList.append(div);
                    });

                }
            });
        }
    });
};

const getImages = () => {
    const images = document.querySelector('#images');
    if (!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            console.log(readVariables);
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: collectImages
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    result && result.forEach(element => {
                        const div = document.createElement('div');
                        div.classList.add('spectrum-AssetCard-assetContainer');
                        images.innerHTML += `<div style="width: 100%; height: 224px; margin:auto;">
                        <div class="spectrum-Card spectrum-Card--gallery" tabindex="0" role="figure" style="">
                          <div class="spectrum-Card-preview">
                            <div class="spectrum-Asset">
                              <img class="spectrum-Asset-image"
                                src="${element?.src}" />
                            </div>
                          </div>
                          <hr class="spectrum-Divider spectrum-Divider--sizeS spectrum-Card-divider">
                          <div class="spectrum-Card-body">
                            <div class="spectrum-Card-header">
                              <div class="spectrum-Card-title spectrum-Heading spectrum-Heading--sizeXS">${element?.alt}</div>
                              <div class="spectrum-Card-subtitle spectrum-Detail spectrum-Detail--sizeS">${element?.ext}</div>
                              <div class="spectrum-Card-description">
                                <a href="#" class="copy-landing">
                                    <img src="./images/Smock_Copy_18_N.svg" class="copy-btn clickable"/>
                                    <input class="copy-input" value="${element?.src}" type="hidden" />
                                </a>
                              </div>
                              <div class="spectrum-Card-actionButton">
                                <div style="display: inline-block;">
                                  <button aria-haspopup="true" class="spectrum-ActionButton spectrum-ActionButton--quiet">
                                    <svg class="spectrum-Icon spectrum-Icon--sizeM" focusable="false" aria-hidden="true">
                                      <use xlink:href="#spectrum-icon-18-More" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="spectrum-QuickActions spectrum-Card-quickActions">
                            <div class="spectrum-Checkbox spectrum-Checkbox--sizeM">
                              <input type="checkbox" class="spectrum-Checkbox-input" title="Select" value="${element?.src}">
                              <span class="spectrum-Checkbox-box">
                                <svg class="spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" focusable="false"
                                  aria-hidden="true">
                                  <use xlink:href="#spectrum-css-icon-Checkmark100" />
                                </svg>
                                <svg class="spectrum-Icon spectrum-UIIcon-Dash100 spectrum-Checkbox-partialCheckmark" focusable="false"
                                  aria-hidden="true">
                                  <use xlink:href="#spectrum-css-icon-Dash100" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>`;
                    });
                }

                document.querySelectorAll('.spectrum-Card--gallery').forEach((item) => {
                    item.querySelector('.copy-landing').addEventListener('click', ((e) => {
                        navigator.clipboard.writeText(item.querySelector('.copy-input').value);
                        e.preventDefault();
                    }));


                    item.querySelector('.spectrum-Checkbox-input').addEventListener('click', ((e) => {
                        const src = e.target.value;
                        fetch(src)
                            .then(function (response) {
                                return response.blob()
                            })
                            .then(function (blob) {
                                const data = [new ClipboardItem({ [type]: blob })];
                                navigator.clipboard.write(blob);
                            });
                        console.log(e.target.value);
                        console.log(e.target.parentElement.parentElement.previousSibling);
                    }))
                });
            });
        }
    });

};

const toggleSelected = (e) => {
    const tabs = document.querySelector('.spectrum-Tabs');

    [...tabs.children].forEach((tab) => {
        if (tab.classList.contains('is-selected')) tab.classList.toggle('is-selected');
    });
    const anchor = e.target.parentElement;
    anchor.classList.toggle('is-selected');

    const slider = document.querySelector('.spectrum-Tabs-selectionIndicator');
    const selected = document.querySelector('.is-selected');
    slider.style = `width: 28px; left: ${selected.offsetLeft}px;`;

    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach((item) => {
        if (!item.classList.contains('hidden')) item.classList.toggle('hidden');
    });

    console.log(anchor);
    const ti = anchor.href.split('#')[1];
    document.querySelector(`#${ti}`).classList.toggle('hidden');
};

const copyPath = (e) => {
    // document.querySelectorAll('.copy-landing').forEach((landing) => {
    //     landing.addEventListener('click', ((e) => {
    //         alert(document.querySelector('.copy-input'));
    //         console.log(document.querySelector('.copy-input'));
    //         navigator.clipboard.writeText(document.querySelector('.copy-input').value);
    //         e.preventDefault();
    //     }));
    // });
    console.log(e.target);
    e.preventDefault();
};

addEventListener('DOMContentLoaded', ((e) => {
    getVariables();
    getImages();

    const tabs = document.querySelectorAll('.spectrum-Tabs-item');
    console.log(tabs);
    tabs.forEach((tab) => {
        tab.addEventListener('click', ((e) => {
            toggleSelected(e);
        }))
    });
}));

Object.entries(document.styleSheets).forEach((key, val) => console.log(key[1].rules))


const collectImages = () => {
    let images = []
    images = [...document.querySelectorAll('img')].map((img) => {
        const url = new URL(img.src);
        const { pathname } = url;
        return { src: img.src, width: img.width, height: img.height, alt: img.alt || 'no alt', pathname: pathname, ext: pathname.split('.')[1] || 'no ext.' };
    });

    let imgs = [];
    imgs = [...document.querySelectorAll('*[style]')].reduce((results, style) => {
        if (style.style[0] === 'background-image') {
            const elems = style.style.backgroundImage.match(/"((?:\\.|[^"\\])*)"/);
            const { origin } = window.location;
            const url = new URL(`${origin}${elems[1]}`);
            results.push({ src: url.href, width: 0, height: 0, alt: 'no alt', pathname: elems[1], ext: elems[1].split('.')[1] || 'no ext.' });
        }
        return results;
    }, []);

    const isSameDomain = (styleSheet) => {
        if (!styleSheet.href) {
            return true;
        }
        return styleSheet.href.indexOf(window.location.origin) === 0;
    };
    const isStyleRule = (rule) => rule.type === 1;
    const values = [...document.styleSheets].filter(isSameDomain).reduce(
        (finalArr, sheet) =>
            finalArr.concat(
                [...sheet.cssRules].filter(isStyleRule).reduce((propValArr, rule) => {
                    const props = [...rule.style].map((propName) => {
                        return [
                            propName.trim(),
                            rule.style.getPropertyValue(propName).trim()
                        ]
                    }).filter(([propName]) => propName.indexOf('background-image') === 0);
                    return [...propValArr, ...props];
                }, [])
            ),
        []
    );

    const bgImgs = values.reduce((results, value) => {
        if(value[1].startsWith('url')) {
            const elems = value[1].match(/"((?:\\.|[^"\\])*)"/);
            const { origin } = window.location;
            const url = new URL(`${origin}/${elems[1]}`);
            results.push({ src: url.href, width: 0, height: 0, alt: 'no alt', pathname: elems[1], ext: elems[1].split('.')[1] || 'no ext.' });
        } 
        return results;
    });
   
    return images.concat(imgs).concat(bgImgs.slice(2));
}

const readVariables = (search) => {
    const isSameDomain = (styleSheet) => {
        if (!styleSheet.href) {
            return true;
        }
        return styleSheet.href.indexOf(window.location.origin) === 0;
    };
    const isStyleRule = (rule) => rule.type === 1;
    const values = [...document.styleSheets].filter(isSameDomain).reduce(
        (finalArr, sheet) =>
            finalArr.concat(
                [...sheet.cssRules].filter(isStyleRule).reduce((propValArr, rule) => {
                    const props = [...rule.style].map((propName) => {
                        return [
                            propName.trim(),
                            rule.style.getPropertyValue(propName).trim()
                        ]
                    }).filter(([propName]) => propName.indexOf(search) === 0);
                    return [...propValArr, ...props];
                }, [])
            ),
        []
    );
    console.log(values);
    return values;
}
